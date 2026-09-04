"""
Google ADK Tools for CodeMentor AI.
Defines all 10 specialized, language-agnostic DSA tools returning validated structured data
and agent-generated dynamic next action suggestion chips.
"""
import json
import logging
import re
import os
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
from .prompts import (
    EXPLAIN_PROBLEM_PROMPT,
    ANALYZE_SOLUTION_PROMPT,
    DEBUG_SOLUTION_PROMPT,
    GENERATE_COUNTEREXAMPLE_PROMPT,
    GENERATE_DRY_RUN_PROMPT,
    SHOW_FIX_PROMPT,
    OPTIMIZE_SOLUTION_PROMPT,
    COMPARE_SOLUTIONS_PROMPT,
    EXPLAIN_COMPLEXITY_PROMPT,
)
from .intents import build_default_next_actions
from backend.services.image_generation import generate_dry_run_image

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")


def get_genai_client() -> genai.Client:
    return genai.Client(api_key=GEMINI_API_KEY)


def call_structured_llm(system_instruction: str, prompt: str) -> Dict[str, Any]:
    """Helper to query Gemini with structured JSON output instructions."""
    client = get_genai_client()
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        response_mime_type="application/json",
        temperature=0.2,
    )
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config,
        )
        text = response.text or "{}"
        return json.loads(text)
    except Exception as e:
        logger.error(f"Failed to call structured LLM: {e}")
        return {}


def extract_dynamic_next_actions(
    raw_actions: Any,
    fallback_intent: str,
    context: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, str]]:
    """Extract validated next actions from LLM output, falling back to contextual defaults if absent."""
    if isinstance(raw_actions, list) and len(raw_actions) > 0:
        valid_actions = []
        for item in raw_actions:
            if isinstance(item, dict) and item.get("label") and item.get("action_prompt"):
                valid_actions.append({
                    "label": str(item["label"]).strip(),
                    "action_prompt": str(item["action_prompt"]).strip(),
                })
        if valid_actions:
            return valid_actions

    defaults = build_default_next_actions(fallback_intent, context or {})
    return [a.model_dump() for a in defaults]


# 1. EXPLAIN PROBLEM TOOL

@tool
def explain_problem_tool(
    problem_statement: str,
) -> Dict[str, Any]:
    """
    Analyzes and explains a DSA problem statement: objective, inputs, outputs,
    constraints, edge cases, pattern, and expected complexity.
    """
    prompt = f"Analyze this DSA problem statement:\n\n{problem_statement}"
    data = call_structured_llm(EXPLAIN_PROBLEM_PROMPT, prompt)

    title = data.get("title") or "DSA Problem Analysis"
    pattern = data.get("pattern") or "Algorithmic Pattern"
    exp_time = data.get("expected_time_complexity") or "O(N)"
    exp_space = data.get("expected_space_complexity") or "O(1)"

    structured_data = {
        "type": StructuredDataType.PROBLEM_SUMMARY.value,
        "title": title,
        "statement": data.get("statement_summary") or problem_statement[:300],
        "objective": data.get("objective") or "Solve the problem efficiently within constraints.",
        "inputs": data.get("inputs") or ["Standard input array or parameters"],
        "outputs": data.get("outputs") or "Calculated result",
        "constraints": data.get("constraints") or ["1 <= N <= 10^5"],
        "edge_cases": data.get("edge_cases") or ["Empty input", "Single element", "Negative numbers", "Duplicates"],
        "pattern": pattern,
        "expected_complexity": f"Time: {exp_time}, Space: {exp_space}",
    }

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.EXPLAIN_PROBLEM.value,
        {"problem": problem_statement}
    )

    response_text = f"Here is the breakdown for **{title}** ({pattern}). The expected optimal complexity is **{exp_time}** time and **{exp_space}** space. Objective: {structured_data['objective']}"

    return {
        "intent": DSAIntent.EXPLAIN_PROBLEM.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# 3. ANALYZE SOLUTION TOOL

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
    exact time and space complexity, and dynamic follow-up actions.
    """
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}\n\nInput (if any): {example_input}"
    data = call_structured_llm(ANALYZE_SOLUTION_PROMPT, prompt)

    classification = data.get("correctness_classification", "correct_but_suboptimal")
    algorithm = data.get("algorithm") or "Custom Algorithm"
    time_comp = data.get("time_complexity") or "O(N)"
    space_comp = data.get("space_complexity") or "O(1)"
    logic = data.get("logic") or "Analyzed code logic"

    structured_data = {
        "type": StructuredDataType.APPROACH_CARD.value,
        "algorithm": algorithm,
        "logic": logic,
        "data_structures": data.get("data_structures") or ["Array"],
        "correctness_classification": classification,
        "strengths": data.get("strengths") or ["Clear structure"],
        "weaknesses": data.get("weaknesses") or [],
        "time_complexity": time_comp,
        "space_complexity": space_comp,
        "time_complexity_reasoning": data.get("time_complexity_reasoning") or "",
        "space_complexity_reasoning": data.get("space_complexity_reasoning") or "",
    }

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.ANALYZE_SOLUTION.value,
        {"problem": problem_statement, "solution": solution_code, "classification": classification}
    )

    class_title = classification.replace('_', ' ').title()
    response_text = f"I've analyzed your implementation. You are using **{algorithm}** ({class_title}). It operates in **{time_comp}** time and **{space_comp}** auxiliary space. {logic}"

    return {
        "intent": DSAIntent.ANALYZE_SOLUTION.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# 4. DEBUG SOLUTION TOOL

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
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}"
    data = call_structured_llm(DEBUG_SOLUTION_PROMPT, prompt)

    issue = data.get("issue") or "Logic discrepancy identified"
    why_it_fails = data.get("why_it_fails") or "The code fails on boundary inputs."

    structured_data = {
        "type": StructuredDataType.BUG_ANALYSIS_CARD.value,
        "issue": issue,
        "why_it_fails": why_it_fails,
        "failing_condition": data.get("failing_condition") or "Edge case boundary",
        "counterexample": data.get("counterexample") or "Input: [0], Target: 0",
        "expected_output": data.get("expected_output") or "Expected valid output",
        "actual_output": data.get("actual_output") or "Incorrect value or runtime error",
        "fix": data.get("fix") or "Update the boundary check and loop termination condition.",
        "corrected_code": data.get("corrected_code") or "",
        "language": language,
    }

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.DEBUG_SOLUTION.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    response_text = f"I've diagnosed the issue in your solution: **{issue}**. {why_it_fails} Check the detailed bug breakdown, failing test case, and suggested fix below."

    return {
        "intent": DSAIntent.DEBUG_SOLUTION.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# 5. COUNTEREXAMPLE TOOL

@tool
def generate_counterexample_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Generates a concrete failing counterexample for the user's solution.
    """
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}"
    data = call_structured_llm(GENERATE_COUNTEREXAMPLE_PROMPT, prompt)

    inp = data.get("counterexample_input") or "Sample failing input"
    exp = data.get("expected_output") or "Expected Output"
    act = data.get("actual_output") or "Actual Code Output"
    reason = data.get("reason") or "The condition terminates prematurely on this edge case."

    structured_data = {
        "type": StructuredDataType.COUNTEREXAMPLE_CARD.value,
        "input": inp,
        "expected_output": exp,
        "actual_output": act,
        "reason": reason,
    }

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.COUNTEREXAMPLE.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    response_text = f"Here is a concrete failing counterexample for your code. On input `{inp}`, expected output is `{exp}`, but your code yields `{act}`. Reason: {reason}"

    return {
        "intent": DSAIntent.COUNTEREXAMPLE.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# 6. ON-DEMAND DRY RUN TOOL

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
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}\n\nInput (or pick a representative test case): {example_input}"
    data = call_structured_llm(GENERATE_DRY_RUN_PROMPT, prompt)

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

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.DRY_RUN.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    response_text = f"Here is the visual step-by-step dry run trace for `{title}` on input `{input_str}` using `{algorithm}`. {explanation}"

    return {
        "intent": DSAIntent.DRY_RUN.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# 7. SHOW FIX TOOL

@tool
def show_fix_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Shows the corrected implementation of the user's approach with highlighted fixes.
    """
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nOriginal Code:\n{solution_code}"
    data = call_structured_llm(SHOW_FIX_PROMPT, prompt)

    corrected_code = data.get("corrected_code") or solution_code
    explanation = data.get("explanation") or "Corrected boundary handling and indexing."
    time_comp = data.get("time_complexity", "O(N)")
    space_comp = data.get("space_complexity", "O(1)")

    structured_data = {
        "type": StructuredDataType.CODE_VIEWER.value,
        "title": "Corrected Implementation",
        "code": corrected_code,
        "language": language,
        "explanation": explanation,
        "time_complexity": time_comp,
        "space_complexity": space_comp,
    }

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.SHOW_FIX.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    response_text = f"Here is the corrected code for your solution ({time_comp} time, {space_comp} space). {explanation}"

    return {
        "intent": DSAIntent.SHOW_FIX.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# 8. OPTIMIZE SOLUTION TOOL

@tool
def optimize_solution_tool(
    problem_statement: str,
    solution_code: str = "",
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Analyzes whether the user's solution can be optimized, explaining the optimal approach,
    complexity improvements, and providing optimal code.
    """
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nUser Solution (if any):\n{solution_code}"
    data = call_structured_llm(OPTIMIZE_SOLUTION_PROMPT, prompt)

    approach_name = data.get("approach_name") or "Optimal Approach"
    time_comp = data.get("time_complexity") or "O(N)"
    space_comp = data.get("space_complexity") or "O(1)"
    explanation = data.get("explanation") or "Eliminates redundant work by utilizing an efficient algorithmic pattern."

    structured_data = {
        "type": StructuredDataType.OPTIMIZATION_CARD.value,
        "approach_name": approach_name,
        "time_complexity": time_comp,
        "space_complexity": space_comp,
        "previous_complexity": data.get("previous_complexity") or ("O(N²)" if solution_code else None),
        "explanation": explanation,
        "optimal_code": data.get("optimal_code") or "// Optimal implementation\n",
        "language": language,
        "tradeoffs": data.get("tradeoffs") or ["Optimal runtime with minimal auxiliary space."],
    }

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.OPTIMIZE_SOLUTION.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    response_text = f"We can solve this optimally using **{approach_name}** to achieve **{time_comp}** time and **{space_comp}** space. {explanation}"

    return {
        "intent": DSAIntent.OPTIMIZE_SOLUTION.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# 9. COMPARE SOLUTIONS TOOL

@tool
def compare_solutions_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Compares the user's approach with optimal and alternate approaches in a structured comparison card.
    """
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nUser Solution:\n{solution_code}"
    data = call_structured_llm(COMPARE_SOLUTIONS_PROMPT, prompt)

    user_time = data.get("user_time") or "O(N²)"
    opt_time = data.get("optimal_time") or "O(N)"
    rec = data.get("recommendation") or "Adopt the optimal approach for large inputs."

    structured_data = {
        "type": StructuredDataType.SOLUTION_COMPARISON_CARD.value,
        "user_approach": data.get("user_approach") or "Current Solution",
        "user_time": user_time,
        "user_space": data.get("user_space") or "O(1)",
        "optimal_approach": data.get("optimal_approach") or "Optimal Approach",
        "optimal_time": opt_time,
        "optimal_space": data.get("optimal_space") or "O(N)",
        "key_differences": data.get("key_differences") or ["Runtime complexity", "Auxiliary space tradeoff"],
        "recommendation": rec,
    }

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.COMPARE_SOLUTIONS.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    response_text = f"Comparing approaches: Your current solution runs in **{user_time}** time vs. the optimal **{opt_time}**. {rec}"

    return {
        "intent": DSAIntent.COMPARE_SOLUTIONS.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }


# 10. EXPLAIN COMPLEXITY TOOL

@tool
def explain_complexity_tool(
    problem_statement: str,
    solution_code: str,
    language: str = "cpp",
) -> Dict[str, Any]:
    """
    Provides a detailed mathematical and conceptual breakdown of the time and space complexity.
    """
    prompt = f"Problem:\n{problem_statement}\n\nLanguage: {language}\n\nCode:\n{solution_code}"
    data = call_structured_llm(EXPLAIN_COMPLEXITY_PROMPT, prompt)

    time_comp = data.get("time_complexity") or "O(N)"
    space_comp = data.get("space_complexity") or "O(1)"
    bottleneck = data.get("bottleneck") or "Iteration over input elements."

    structured_data = {
        "type": StructuredDataType.COMPLEXITY_CARD.value,
        "time_complexity": time_comp,
        "space_complexity": space_comp,
        "time_breakdown": data.get("time_breakdown") or ["Single pass traversal through the collection."],
        "space_breakdown": data.get("space_breakdown") or ["Only constant pointers and auxiliary primitives used."],
        "bottleneck": bottleneck,
        "best_case": data.get("best_case") or "O(1)",
        "worst_case": data.get("worst_case") or "O(N)",
    }

    next_actions = extract_dynamic_next_actions(
        data.get("next_actions"),
        DSAIntent.EXPLAIN_COMPLEXITY.value,
        {"problem": problem_statement, "solution": solution_code}
    )

    response_text = f"Complexity breakdown: Overall time complexity is **{time_comp}** and auxiliary space is **{space_comp}**. Primary bottleneck: {bottleneck}."

    return {
        "intent": DSAIntent.EXPLAIN_COMPLEXITY.value,
        "response": response_text,
        "structured_data": structured_data,
        "next_actions": next_actions,
    }
