"""
CodeMentor AI Agents Package.
Exports core planner, system prompts, schemas, and DSA intent tools.
"""
from .prompts import (
    CODEMENTOR_SYSTEM_INSTRUCTIONS,
    GENERAL_CHAT_SYSTEM_PROMPT,
    NON_DRY_RUN_IMAGE_REFUSAL_RESPONSE,
    EXPLAIN_PROBLEM_PROMPT,
    ANALYZE_SOLUTION_PROMPT,
    DEBUG_SOLUTION_PROMPT,
    GENERATE_COUNTEREXAMPLE_PROMPT,
    GENERATE_DRY_RUN_PROMPT,
    SHOW_FIX_PROMPT,
    OPTIMIZE_SOLUTION_PROMPT,
    COMPARE_SOLUTIONS_PROMPT,
    EXPLAIN_COMPLEXITY_PROMPT,
    build_auto_extract_prompt,
    build_dry_run_image_prompt,
)
from .schemas import (
    AgentResponse,
    DSAIntent,
    NextAction,
    StructuredDataType,
    DSASessionContext,
    ChatMessageRecord,
)
from .planner import DSAPlanner, get_planner
from .tools import (
    explain_problem_tool,
    analyze_solution_tool,
    debug_solution_tool,
    generate_counterexample_tool,
    generate_dry_run_tool,
    show_fix_tool,
    optimize_solution_tool,
    compare_solutions_tool,
    explain_complexity_tool,
)

__all__ = [
    "CODEMENTOR_SYSTEM_INSTRUCTIONS",
    "GENERAL_CHAT_SYSTEM_PROMPT",
    "NON_DRY_RUN_IMAGE_REFUSAL_RESPONSE",
    "EXPLAIN_PROBLEM_PROMPT",
    "ANALYZE_SOLUTION_PROMPT",
    "DEBUG_SOLUTION_PROMPT",
    "GENERATE_COUNTEREXAMPLE_PROMPT",
    "GENERATE_DRY_RUN_PROMPT",
    "SHOW_FIX_PROMPT",
    "OPTIMIZE_SOLUTION_PROMPT",
    "COMPARE_SOLUTIONS_PROMPT",
    "EXPLAIN_COMPLEXITY_PROMPT",
    "build_auto_extract_prompt",
    "build_dry_run_image_prompt",
    "AgentResponse",
    "DSAIntent",
    "NextAction",
    "StructuredDataType",
    "DSASessionContext",
    "ChatMessageRecord",
    "DSAPlanner",
    "get_planner",
    "explain_problem_tool",
    "analyze_solution_tool",
    "debug_solution_tool",
    "generate_counterexample_tool",
    "generate_dry_run_tool",
    "show_fix_tool",
    "optimize_solution_tool",
    "compare_solutions_tool",
    "explain_complexity_tool",
]
