"""
Pydantic schemas and typed data models for CodeMentor AI.
Defines controlled DSA intents, structured data types, and API payloads.
"""
from enum import Enum
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime


class DSAIntent(str, Enum):
    GENERAL_CHAT = "general_chat"
    SETUP_PROBLEM = "setup_problem"
    EXPLAIN_PROBLEM = "explain_problem"
    EXPLAIN_APPROACH = "explain_approach"
    ANALYZE_SOLUTION = "analyze_solution"
    DEBUG_SOLUTION = "debug_solution"
    COUNTEREXAMPLE = "counterexample"
    DRY_RUN = "dry_run"
    SHOW_FIX = "show_fix"
    OPTIMIZE_SOLUTION = "optimize_solution"
    COMPARE_SOLUTIONS = "compare_solutions"
    SHOW_CODE = "show_code"
    EXPLAIN_COMPLEXITY = "explain_complexity"


class StructuredDataType(str, Enum):
    PROBLEM_SETUP_FORM = "problem_setup_form"
    PROBLEM_SUMMARY = "problem_summary"
    APPROACH_CARD = "approach_card"
    BUG_ANALYSIS_CARD = "bug_analysis_card"
    COUNTEREXAMPLE_CARD = "counterexample_card"
    COMPLEXITY_CARD = "complexity_card"
    SOLUTION_COMPARISON_CARD = "solution_comparison_card"
    OPTIMIZATION_CARD = "optimization_card"
    CODE_VIEWER = "code_viewer"
    DRY_RUN_IMAGE = "dry_run_image"


class CorrectnessClassification(str, Enum):
    CORRECT_AND_OPTIMAL = "correct_and_optimal"
    CORRECT_BUT_SUBOPTIMAL = "correct_but_suboptimal"
    CORRECT_IDEA_BUGGY_IMPLEMENTATION = "correct_idea_buggy_implementation"
    INCORRECT_APPROACH = "incorrect_approach"
    PARTIALLY_CORRECT = "partially_correct"
    INSUFFICIENT_INFORMATION = "insufficient_information"


class NextAction(BaseModel):
    label: str = Field(..., description="Short button text (1-4 words)")
    action_prompt: str = Field(..., description="The exact prompt sent when user clicks this action")


class ProblemUnderstanding(BaseModel):
    title: str
    statement: str
    objective: str
    inputs: List[str] = []
    outputs: str = ""
    constraints: List[str] = []
    edge_cases: List[str] = []
    pattern: str = ""
    expected_complexity: Optional[str] = None


class UserApproach(BaseModel):
    algorithm: str
    logic: str
    data_structures: List[str] = []
    correctness_classification: CorrectnessClassification = CorrectnessClassification.CORRECT_BUT_SUBOPTIMAL
    strengths: List[str] = []
    weaknesses: List[str] = []
    complexity: str = ""
    edge_case_analysis: Optional[str] = None


class BugAnalysis(BaseModel):
    issue: str
    why_it_fails: str
    failing_condition: str
    counterexample: str
    expected_output: str
    actual_output: str
    fix: str
    corrected_code: Optional[str] = None


class SolutionCandidate(BaseModel):
    type: str = "optimal"  # "user", "fixed", "optimal"
    approach: str
    code: str
    explanation: str
    time_complexity: str
    space_complexity: str
    tradeoffs: List[str] = []


class ApproachComparison(BaseModel):
    user_approach: Optional[str] = None
    fixed_approach: Optional[str] = None
    optimal_approach: Optional[str] = None
    correctness: Optional[str] = None
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    tradeoffs: List[str] = []
    candidates: List[SolutionCandidate] = []


class DryRunData(BaseModel):
    title: str = "Dry Run Visualization"
    problem_title: str
    input_used: str
    steps: List[str] = []
    explanation: str
    image_url: str


# Session & Context Models

class DSASessionContext(BaseModel):
    session_id: str
    user_id: str = "default_user"
    problem: Optional[str] = None
    solution: Optional[str] = None
    language: str = "cpp"
    active_input: Optional[str] = None
    test_cases: List[str] = []
    problem_understanding: Optional[Dict[str, Any]] = None
    user_approach: Optional[Dict[str, Any]] = None
    current_analysis: Optional[Dict[str, Any]] = None
    generated_solutions: List[Dict[str, Any]] = []
    current_workspace_state: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ContextUpdateRequest(BaseModel):
    problem: str
    solution: str
    language: str = "cpp"
    active_input: Optional[str] = None
    test_cases: List[str] = []
    analyze_immediately: bool = True


# Agent & API Payload Models

class AgentResponse(BaseModel):
    session_id: str
    response: str
    intent: str
    structured_data: Optional[Dict[str, Any]] = None
    next_actions: List[NextAction] = []
    dsa_context: Optional[Dict[str, Any]] = None
    new_session: bool = False


class QueryRequest(BaseModel):
    session_id: Optional[str] = None
    user_id: Optional[str] = "default_user"
    query: str


class SessionCreateRequest(BaseModel):
    user_id: Optional[str] = "default_user"
    initial_context: Optional[ContextUpdateRequest] = None


class SessionSummary(BaseModel):
    session_id: str
    user_id: str
    problem_title: Optional[str] = None
    language: Optional[str] = None
    message_count: int = 0
    created_at: datetime
    updated_at: datetime


class ChatMessageRecord(BaseModel):
    session_id: str
    user_id: str
    role: str  # "user" or "assistant"
    content: str
    intent: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    next_actions: List[NextAction] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
