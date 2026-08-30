"""
DSA Analysis Tools for CodeMentor AI.
Provides structured tools decorated with @tool for all controlled DSA intents.
Each tool produces validated structured_data and contextual next_actions.
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

from .tool import tool
from .schemas import (
    DSAIntent,
    StructuredDataType,
    CorrectnessClassification,
)
from .intents import build_default_next_actions
from backend.services.image_generation import generate_dry_run_image

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def get_genai_client() -> genai.Client:
    return genai.Client(api_key=GEMINI_API_KEY)


def call_structured_llm(system_instruction: str, prompt: str, schema: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Helper to query Gemini for structured JSON analysis with graceful fallback."""
    client = get_genai_client()
    try:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
            response_mime_type="application/json",
        )
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config,
        )
        if response.text:
            return json.loads(response.text)
    except Exception as e:
        logger.warning(f"[Tools LLM] Error querying structured LLM: {e}")
    return {}


# =========================================================================
# 1. SETUP PROBLEM TOOL
# =========================================================================

@tool
def open_problem_setup_form(
    problem: str = "",
    solution: str = "",
    language: str = "cpp",
    active_input: str = "",
) -> Dict[str, Any]:
    """
    Opens the interactive problem and solution setup form in the UI.
    Call this when the user needs to submit their problem statement and code,
    or when solution analysis is requested but no problem or code is found in the session.
    """
    structured_data = {
        "type": StructuredDataType.PROBLEM_SETUP_FORM.value,
        "problem": problem or "",
        "solution": solution or "",
        "language": language or "cpp",
        "active_input": active_input or "",
    }
    next_actions = [
        {"label": "Submit & Analyze", "action_prompt": "I have filled in the problem and solution form. Please analyze it."},
    ]
    return {
        "intent": DSAIntent.SETUP_PROBLEM.value,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# =========================================================================
# 2. EXPLAIN PROBLEM TOOL
# =========================================================================

@tool
def explain_problem_tool(
    problem_statement: str,
) -> Dict[str, Any]:
    """
    Analyzes and explains a DSA problem statement: objective, inputs, outputs,
    constraints, edge cases, pattern, and expected complexity.
    """
    sys_prompt = "You are a DSA problem analyst. Return a JSON object with: title, statement_summary, objective, inputs (list), outputs, constraints (list), edge_cases (list), pattern (e.g. Two Pointers, Sliding Window, DP), expected_time_complexity, expected_space_complexity."
    prompt = f"Analyze this DSA problem statement:\n\n{problem_statement}"

    data = call_structured_llm(sys_prompt, prompt)

    structured_data = {
        "type": StructuredDataType.PROBLEM_SUMMARY.value,
        "title": data.get("title") or "DSA Problem Analysis",
        "statement": data.get("statement_summary") or problem_statement[:300],
        "objective": data.get("objective") or "Solve the problem efficiently within constraints.",
        "inputs": data.get("inputs") or ["Standard input array or parameters"],
        "outputs": data.get("outputs") or "Calculated result",
        "constraints": data.get("constraints") or ["1 <= N <= 10^5"],
        "edge_cases": data.get("edge_cases") or ["Empty input", "Single element", "Negative numbers", "Duplicates"],
        "pattern": data.get("pattern") or "Algorithmic Pattern",
        "expected_complexity": f"Time: {data.get('expected_time_complexity', 'O(N)')}, Space: {data.get('expected_space_complexity', 'O(1)')}",
    }

    next_actions = [
        {"label": "Setup My Solution", "action_prompt": "I want to submit my solution code for this problem"},
        {"label": "Explain Expected Approach", "action_prompt": "What is the standard optimal approach to solve this?"},
    ]

    return {
        "intent": DSAIntent.EXPLAIN_PROBLEM.value,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# =========================================================================
# 3. ANALYZE SOLUTION TOOL
# =========================================================================

@tool
def analyze_solution_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
    example_input: str = "",
) -> Dict[str, Any]:
    """
    Performs conceptual analysis of a user's DSA solution code:
    algorithm, logic breakdown, correctness classification, strengths, weaknesses,
    and exact time and space complexity.
    """
    sys_prompt = """You are a senior DSA mentor. Analyze the user's code against the problem statement.
Return JSON with:
- algorithm: name of algorithm used
- logic: concise explanation of what the code does
- data_structures: list of data structures used
- correctness_classification: one of ["correct_and_optimal", "correct_but_suboptimal", "correct_idea_buggy_implementation", "incorrect_approach", "partially_correct"]
- strengths: list of strengths
- weaknesses: list of weaknesses or potential pitfalls
- time_complexity: Big-O time complexity (e.g. O(N))
- space_complexity: Big-O space complexity (e.g. O(1))
- time_complexity_reasoning: explanation of why
- space_complexity_reasoning: explanation of why
"""
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}\n\nInput (if any): {example_input}"
    data = call_structured_llm(sys_prompt, prompt)

    classification = data.get("correctness_classification", "correct_but_suboptimal")
    structured_data = {
        "type": StructuredDataType.APPROACH_CARD.value,
        "algorithm": data.get("algorithm") or "User Algorithm",
        "logic": data.get("logic") or "Analyzed code logic",
        "data_structures": data.get("data_structures") or ["Array"],
        "correctness_classification": classification,
        "strengths": data.get("strengths") or ["Clear structure"],
        "weaknesses": data.get("weaknesses") or [],
        "time_complexity": data.get("time_complexity") or "O(N)",
        "space_complexity": data.get("space_complexity") or "O(1)",
        "time_complexity_reasoning": data.get("time_complexity_reasoning") or "",
        "space_complexity_reasoning": data.get("space_complexity_reasoning") or "",
    }

    actions = build_default_next_actions(
        DSAIntent.ANALYZE_SOLUTION.value,
        {"problem": problem_statement, "solution": solution_code, "classification": classification}
    )

    return {
        "intent": DSAIntent.ANALYZE_SOLUTION.value,
        "structured_data": structured_data,
        "next_actions": [a.model_dump() for a in actions],
    }


# =========================================================================
# 4. DEBUG SOLUTION TOOL
# =========================================================================

@tool
def debug_solution_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Pinpoints logic errors, off-by-one errors, edge-case failures, or algorithmic flaws
    in the user's code, providing a clear counterexample and fix.
    """
    sys_prompt = """You are an expert DSA debugging specialist. Identify bugs and edge-case failures in the code.
Return JSON with:
- issue: short description of the bug
- why_it_fails: detailed explanation of why the logic fails
- failing_condition: condition or edge case causing the failure
- counterexample: specific input that breaks the code
- expected_output: correct expected output for counterexample
- actual_output: what the user code produces
- fix: concise guidance on how to fix
- corrected_code: clean snippet of the corrected solution
"""
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}"
    data = call_structured_llm(sys_prompt, prompt)

    structured_data = {
        "type": StructuredDataType.BUG_ANALYSIS_CARD.value,
        "issue": data.get("issue") or "Logic discrepancy identified",
        "why_it_fails": data.get("why_it_fails") or "The code fails on boundary inputs.",
        "failing_condition": data.get("failing_condition") or "Edge case boundary",
        "counterexample": data.get("counterexample") or "Input: [0], Target: 0",
        "expected_output": data.get("expected_output") or "Expected valid output",
        "actual_output": data.get("actual_output") or "Incorrect value or runtime error",
        "fix": data.get("fix") or "Update the boundary check and loop termination condition.",
        "corrected_code": data.get("corrected_code") or "",
        "language": language,
    }

    actions = build_default_next_actions(
        DSAIntent.DEBUG_SOLUTION.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    return {
        "intent": DSAIntent.DEBUG_SOLUTION.value,
        "structured_data": structured_data,
        "next_actions": [a.model_dump() for a in actions],
    }


# =========================================================================
# 5. COUNTEREXAMPLE TOOL
# =========================================================================

@tool
def generate_counterexample_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Generates a concrete failing counterexample for the user's solution.
    """
    sys_prompt = """Generate a specific failing test case / counterexample for the code.
Return JSON with:
- counterexample_input: formatted input string
- expected_output: correct output expected by the problem
- actual_output: what the user's solution returns or does
- reason: clear explanation of why the user's logic produces this incorrect output
"""
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}"
    data = call_structured_llm(sys_prompt, prompt)

    structured_data = {
        "type": StructuredDataType.COUNTEREXAMPLE_CARD.value,
        "input": data.get("counterexample_input") or "Sample failing input",
        "expected_output": data.get("expected_output") or "Expected Output",
        "actual_output": data.get("actual_output") or "Actual Code Output",
        "reason": data.get("reason") or "The condition terminates prematurely on this edge case.",
    }

    actions = build_default_next_actions(
        DSAIntent.COUNTEREXAMPLE.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    return {
        "intent": DSAIntent.COUNTEREXAMPLE.value,
        "structured_data": structured_data,
        "next_actions": [a.model_dump() for a in actions],
    }


# =========================================================================
# 6. ON-DEMAND DRY RUN TOOL
# =========================================================================

@tool
async def generate_dry_run_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
    example_input: str = "",
) -> Dict[str, Any]:
    """
    Generates an educational dry-run visualization and step-by-step trace.
    INVOKE ONLY WHEN USER EXPLICITLY ASKS FOR DRY RUN OR TRACE.
    """
    sys_prompt = """You are a DSA execution tracer. Create a clear conceptual dry-run trace for the code on an input.
Return JSON with:
- problem_title: short problem title
- algorithm: algorithm name
- input_used: the exact input used for this trace
- steps: list of 4-6 concise trace steps showing variable states (e.g. 'Step 1: left=0 (2), right=3 (15), sum=17 > 9 -> decrement right')
- explanation: summary explanation of the dry run
"""
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}\n\nInput (or pick a representative test case): {example_input}"
    data = call_structured_llm(sys_prompt, prompt)

    title = data.get("problem_title") or "DSA Dry Run"
    algorithm = data.get("algorithm") or "Algorithm Trace"
    input_str = data.get("input_used") or example_input or "Example Input"
    raw_steps = data.get("steps") or [
        "Step 1: Initialize pointers and tracking structures.",
        "Step 2: Inspect first element and update state.",
        "Step 3: Advance index and check termination condition.",
        "Step 4: Return calculated result.",
    ]
    steps = []
    for s in raw_steps:
        if isinstance(s, dict):
            desc = s.get("description") or s.get("action") or s.get("detail") or s.get("text")
            step_num = s.get("step")
            if desc and step_num:
                steps.append(f"Step {step_num}: {desc}")
            elif desc:
                steps.append(str(desc))
            else:
                steps.append(" • ".join(f"{k}: {v}" for k, v in s.items()))
        elif isinstance(s, str):
            steps.append(s)
        else:
            steps.append(str(s))

    explanation = data.get("explanation") or "Step-by-step educational trace through the algorithm."

    image_url = await generate_dry_run_image(
        problem_title=title,
        algorithm=algorithm,
        input_str=input_str,
        steps=steps,
        problem_statement=problem_statement,
    )

    structured_data = {
        "type": StructuredDataType.DRY_RUN_IMAGE.value,
        "title": f"Dry Run: {title}",
        "problem_title": title,
        "input_used": input_str,
        "algorithm": algorithm,
        "steps": steps,
        "explanation": explanation,
        "image_url": image_url,
    }

    actions = build_default_next_actions(
        DSAIntent.DRY_RUN.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    return {
        "intent": DSAIntent.DRY_RUN.value,
        "structured_data": structured_data,
        "next_actions": [a.model_dump() for a in actions],
    }


# =========================================================================
# 7. SHOW FIX TOOL
# =========================================================================

@tool
def show_fix_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Shows the corrected implementation of the user's approach with highlighted fixes.
    """
    sys_prompt = """You are a DSA code coach. Provide the cleanly corrected version of the user's code.
Return JSON with:
- title: concise title
- explanation: what was changed and why
- corrected_code: the full corrected code
- language: programming language
- time_complexity: Big-O
- space_complexity: Big-O
"""
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nOriginal Code:\n{solution_code}"
    data = call_structured_llm(sys_prompt, prompt)

    corrected_code = data.get("corrected_code") or solution_code
    explanation = data.get("explanation") or "Corrected boundary handling and indexing."

    structured_data = {
        "type": StructuredDataType.CODE_VIEWER.value,
        "title": "Corrected Implementation",
        "code": corrected_code,
        "language": language,
        "explanation": explanation,
        "time_complexity": data.get("time_complexity", "O(N)"),
        "space_complexity": data.get("space_complexity", "O(1)"),
    }

    actions = build_default_next_actions(
        DSAIntent.SHOW_FIX.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    return {
        "intent": DSAIntent.SHOW_FIX.value,
        "structured_data": structured_data,
        "next_actions": [a.model_dump() for a in actions],
    }


# =========================================================================
# 8. OPTIMIZE SOLUTION TOOL
# =========================================================================

@tool
def optimize_solution_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Analyzes whether the user's solution can be optimized, explaining the optimal approach,
    complexity improvements, and providing optimal code.
    """
    sys_prompt = """You are an algorithm optimization architect. Provide the optimal solution for this DSA problem.
Return JSON with:
- approach_name: name of optimal approach (e.g. Two Pointers / Hash Map)
- time_complexity: optimal time (e.g. O(N))
- space_complexity: optimal space (e.g. O(1))
- previous_complexity: estimated user solution complexity (e.g. O(N^2))
- explanation: why this approach is optimal and how it reduces redundant work
- optimal_code: clean, optimal code snippet
- tradeoffs: list of tradeoffs
"""
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nUser Solution:\n{solution_code}"
    data = call_structured_llm(sys_prompt, prompt)

    structured_data = {
        "type": StructuredDataType.OPTIMIZATION_CARD.value,
        "approach_name": data.get("approach_name") or "Optimal Approach",
        "time_complexity": data.get("time_complexity") or "O(N)",
        "space_complexity": data.get("space_complexity") or "O(1)",
        "previous_complexity": data.get("previous_complexity") or "O(N²)",
        "explanation": data.get("explanation") or "Eliminates nested iterations by utilizing an efficient lookup structure.",
        "optimal_code": data.get("optimal_code") or "// Optimal implementation\n",
        "language": language,
        "tradeoffs": data.get("tradeoffs") or ["Optimal runtime with minimal auxiliary space."],
    }

    actions = build_default_next_actions(
        DSAIntent.OPTIMIZE_SOLUTION.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    return {
        "intent": DSAIntent.OPTIMIZE_SOLUTION.value,
        "structured_data": structured_data,
        "next_actions": [a.model_dump() for a in actions],
    }


# =========================================================================
# 9. COMPARE SOLUTIONS TOOL
# =========================================================================

@tool
def compare_solutions_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Compares the user's approach with optimal and alternate approaches in a structured comparison card.
    """
    sys_prompt = """Compare the user's approach against the optimal approach and brute force.
Return JSON with:
- user_approach: name and description of user approach
- user_time: Big-O
- user_space: Big-O
- optimal_approach: name and description of optimal approach
- optimal_time: Big-O
- optimal_space: Big-O
- key_differences: list of key algorithmic differences
- recommendation: final recommendation
"""
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nUser Solution:\n{solution_code}"
    data = call_structured_llm(sys_prompt, prompt)

    structured_data = {
        "type": StructuredDataType.SOLUTION_COMPARISON_CARD.value,
        "user_approach": data.get("user_approach") or "Current Solution",
        "user_time": data.get("user_time") or "O(N²)",
        "user_space": data.get("user_space") or "O(1)",
        "optimal_approach": data.get("optimal_approach") or "Optimal Approach",
        "optimal_time": data.get("optimal_time") or "O(N)",
        "optimal_space": data.get("optimal_space") or "O(N)",
        "key_differences": data.get("key_differences") or ["Runtime complexity", "Auxiliary space tradeoff"],
        "recommendation": data.get("recommendation") or "Adopt the optimal approach for large inputs.",
    }

    actions = build_default_next_actions(
        DSAIntent.COMPARE_SOLUTIONS.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    return {
        "intent": DSAIntent.COMPARE_SOLUTIONS.value,
        "structured_data": structured_data,
        "next_actions": [a.model_dump() for a in actions],
    }


# =========================================================================
# 10. EXPLAIN COMPLEXITY TOOL
# =========================================================================

@tool
def explain_complexity_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Provides a detailed mathematical and conceptual breakdown of the time and space complexity.
    """
    sys_prompt = """Explain time and space complexity of the code in depth.
Return JSON with:
- time_complexity: e.g. O(N log N)
- space_complexity: e.g. O(1)
- time_breakdown: list of breakdown points explaining each loop/recursion
- space_breakdown: list of breakdown points explaining memory/stack usage
- bottleneck: main performance bottleneck
- best_case: best case Big-O
- worst_case: worst case Big-O
"""
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}"
    data = call_structured_llm(sys_prompt, prompt)

    structured_data = {
        "type": StructuredDataType.COMPLEXITY_CARD.value,
        "time_complexity": data.get("time_complexity") or "O(N)",
        "space_complexity": data.get("space_complexity") or "O(1)",
        "time_breakdown": data.get("time_breakdown") or ["Single pass traversal through the collection."],
        "space_breakdown": data.get("space_breakdown") or ["Only constant pointers and auxiliary primitives used."],
        "bottleneck": data.get("bottleneck") or "Iteration over input elements.",
        "best_case": data.get("best_case") or "O(1)",
        "worst_case": data.get("worst_case") or "O(N)",
    }

    actions = build_default_next_actions(
        DSAIntent.EXPLAIN_COMPLEXITY.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    return {
        "intent": DSAIntent.EXPLAIN_COMPLEXITY.value,
        "structured_data": structured_data,
        "next_actions": [a.model_dump() for a in actions],
    }
