"""
Controlled DSA Intent Registry and Next Actions builder.
Ensures uniform intent definitions, next action defaults, and validation.
"""
from typing import List, Dict, Any, Optional
from .schemas import DSAIntent, NextAction, StructuredDataType


def build_default_next_actions(intent: str, context: Optional[Dict[str, Any]] = None) -> List[NextAction]:
    """
    Build contextual next actions.
    Actions must:
    - be short
    - be unique
    - be contextual
    - move the workflow forward
    - use the same session
    - never appear redundantly in chat text
    """
    ctx = context or {}
    has_problem = bool(ctx.get("problem"))
    has_solution = bool(ctx.get("solution"))

    if intent == DSAIntent.GENERAL_CHAT or intent == "welcome":
        if not has_problem or not has_solution:
            return [
                NextAction(label="Analyze My Solution", action_prompt="I want to analyze my solution for a DSA problem"),
                NextAction(label="Explain a DSA Problem", action_prompt="Can you explain a DSA problem?"),
                NextAction(label="Ask a DSA Question", action_prompt="What is dynamic programming and when do we use it?"),
            ]
        else:
            return [
                NextAction(label="Analyze Approach", action_prompt="Analyze my approach and its correctness"),
                NextAction(label="Show Dry Run", action_prompt="Show me a dry run of my solution"),
                NextAction(label="Optimal Solution", action_prompt="Show the optimal approach for this problem"),
            ]

    if intent == DSAIntent.ANALYZE_SOLUTION or intent == DSAIntent.EXPLAIN_APPROACH:
        classification = ctx.get("classification", "")
        actions = []
        if "buggy" in classification or "incorrect" in classification:
            actions.append(NextAction(label="Why is it wrong?", action_prompt="Why is my solution wrong? Show the bug"))
            actions.append(NextAction(label="Show Counterexample", action_prompt="Give me a counterexample where my solution fails"))
            actions.append(NextAction(label="Show Fix", action_prompt="Show the corrected code for my approach"))
        else:
            actions.append(NextAction(label="Show Dry Run", action_prompt="Show me a dry run of my solution with step-by-step trace"))
            actions.append(NextAction(label="Show Optimal", action_prompt="Show the optimal approach and code"))
            actions.append(NextAction(label="Explain Complexity", action_prompt="Explain the time and space complexity in detail"))
        return actions

    if intent == DSAIntent.DEBUG_SOLUTION:
        return [
            NextAction(label="Show Counterexample", action_prompt="Show me the failing counterexample input and output"),
            NextAction(label="Show Corrected Code", action_prompt="Show me the corrected implementation"),
            NextAction(label="Show Dry Run", action_prompt="Show me a dry run on the failing test case"),
        ]

    if intent == DSAIntent.COUNTEREXAMPLE:
        return [
            NextAction(label="Show Dry Run", action_prompt="Show me a dry run with this counterexample"),
            NextAction(label="Show Fix", action_prompt="How do I fix this bug? Show corrected code"),
            NextAction(label="Optimal Approach", action_prompt="Show the optimal approach for this problem"),
        ]

    if intent == DSAIntent.DRY_RUN:
        return [
            NextAction(label="Show Optimal", action_prompt="Show the optimal approach and code"),
            NextAction(label="Compare Solutions", action_prompt="Compare my approach with the optimal one"),
            NextAction(label="Explain Complexity", action_prompt="Explain the complexity breakdown"),
        ]

    if intent == DSAIntent.SHOW_FIX:
        return [
            NextAction(label="Compare Solutions", action_prompt="Compare my original solution with the fixed version"),
            NextAction(label="Show Optimal", action_prompt="Show the optimal approach"),
            NextAction(label="Show Dry Run", action_prompt="Show dry run of the fixed solution"),
        ]

    if intent == DSAIntent.OPTIMIZE_SOLUTION:
        return [
            NextAction(label="Compare Both", action_prompt="Compare my approach with the optimal approach"),
            NextAction(label="Explain Complexity", action_prompt="Explain the optimal complexity"),
            NextAction(label="Show Dry Run", action_prompt="Show a dry run of the optimal solution"),
        ]

    if intent == DSAIntent.COMPARE_SOLUTIONS:
        return [
            NextAction(label="Show Optimal Code", action_prompt="Show the complete optimal code"),
            NextAction(label="Show Dry Run", action_prompt="Show a dry run visualization"),
            NextAction(label="Analyze Edge Cases", action_prompt="What edge cases should I be careful about?"),
        ]

    if intent == DSAIntent.EXPLAIN_PROBLEM:
        return [
            NextAction(label="Setup My Solution", action_prompt="I have a solution for this problem, let's analyze it"),
            NextAction(label="Explain Expected Approach", action_prompt="What is the standard approach to solve this?"),
        ]

    if intent == DSAIntent.EXPLAIN_COMPLEXITY:
        return [
            NextAction(label="Can This Be Optimized?", action_prompt="Can my approach be optimized further?"),
            NextAction(label="Show Dry Run", action_prompt="Show me a dry run of the solution"),
            NextAction(label="Show Optimal Approach", action_prompt="Show the optimal solution"),
        ]

    return []
