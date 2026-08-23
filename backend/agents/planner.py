import os
import json
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from backend.agents.prompts import SYSTEM_PROMPT

logger = logging.getLogger(__name__)

class ProblemUnderstanding(BaseModel):
    title: str = Field(..., description="The title of the DSA problem.")
    difficulty: str = Field(..., description="Difficulty level: Easy, Medium, or Hard.")
    statement: str = Field(..., description="Extracted clean problem statement.")
    objective: str = Field(..., description="Primary objective or goal of the problem.")
    inputs: List[str] = Field(..., description="Key input parameters and variables.")
    outputs: List[str] = Field(..., description="Key output variables and format.")
    constraints: List[str] = Field(..., description="Array size limits, value ranges, and time/space constraints.")
    edge_cases: List[str] = Field(..., description="Edge cases to consider (e.g. empty array, single element, negative values).")
    pattern: str = Field(..., description="DSA algorithmic pattern (e.g. Two Pointers, Sliding Window, DP, DFS, BFS, Hash Map).")
    expected_complexity: str = Field(..., description="Expected optimal complexity bound (e.g. Time: O(N), Space: O(N)).")

class UserApproach(BaseModel):
    algorithm: str = Field(..., description="Name of the algorithm/approach used in the user code.")
    logic: str = Field(..., description="Core logic details of the approach.")
    data_structures: List[str] = Field(..., description="Data structures utilized.")
    correctness_classification: str = Field(..., description="Classification of approach: optimal, suboptimal, buggy, or incorrect.")
    complexity_rationale: str = Field(..., description="Explanation of why this approach yields its complexity.")

class ComplexityEstimation(BaseModel):
    time: str = Field(..., description="Estimated Time Complexity (e.g., O(N log N)).")
    space: str = Field(..., description="Estimated Space Complexity (e.g., O(N)).")
    rationale: str = Field(..., description="Brief rationale for the complexity estimate.")

class BugAnalysis(BaseModel):
    issue: str = Field(..., description="Detailed explanation of the logical issue/bug if present. If correct, return 'No bugs detected'.")
    fix: str = Field(..., description="Detailed fix instructions. If correct, return 'No bugs detected'.")
    counterexample_input: str = Field(..., description="Failing counterexample input parameters if buggy.")
    expected_output: str = Field(..., description="Expected correct output for the counterexample.")
    actual_output: str = Field(..., description="Actual incorrect output produced by user code for the counterexample.")
    corrected_code: str = Field(..., description="Corrected C++ or Python source code if buggy. If correct, return the original code unchanged.")

class UIComponentIntent(BaseModel):
    type: str = Field(..., description="Type of UI component: problem_summary, approach_card, bug_analysis, dry_run_markdown, or solution_comparison.")
    props: Dict[str, Any] = Field(default_factory=dict, description="Component configuration properties corresponding to type's expected structure.")
    priority: int = Field(..., description="Ordering priority of the component (higher values rendered first).")

class UIPlan(BaseModel):
    components: List[UIComponentIntent] = Field(..., description="List of components planned for rendering.")
    rationale: str = Field(..., description="Concise rationale for this layout choice.")

class AgentAnalysisResponse(BaseModel):
    intent: str = Field(..., description="The detected user intent: 'General Chat' (greetings, general chat questions), 'Explain Approach' (requests algorithm explanation), 'Debug / Show Fix' (looks for bugs/fixes), 'Optimize Solution' (requests optimized solution), 'Compare Complexity' (requests side-by-side complexity analysis), or 'Dry Run' (requests visual dry run simulation).")
    chat_response: str = Field(..., description="Conversational text response answering the user query. Must explain the reasoning, answer questions, or introduce the visual/interactive cards being rendered.")
    problem_understanding: Optional[ProblemUnderstanding] = Field(None, description="DSA problem summary and bounds. Set to None if intent is General Chat.")
    user_approach: Optional[UserApproach] = Field(None, description="User approach analysis and classification. Set to None if intent is General Chat.")
    complexity: Optional[ComplexityEstimation] = Field(None, description="Algorithmic complexity estimate. Set to None if intent is General Chat.")
    bug_analysis: Optional[BugAnalysis] = Field(None, description="Logical bug diagnosis and counterexample. Set to None if intent is General Chat.")
    ui_plan: Optional[UIPlan] = Field(None, description="Planned UI components composition. Set to None if intent is General Chat.")

def load_dotenv():
    for path in (".env", "backend/.env", "../.env"):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ[k.strip()] = v.strip("'\"")
            break

class AgentPlanner:
    """
    Agentic Planner orchestrating Query Analysis, DSA Problem Understanding, and Generative UI planning.
    Uses Google GenAI SDK (Gemini API) to output structured UIPlans and TraceAnalysisResults.
    """
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("Agent Error: GEMINI_API_KEY environment variable is not set. Please set the API key.")
        
        try:
            self.client = genai.Client(api_key=self.api_key)
        except Exception as e:
            raise RuntimeError(f"Agent Error: Failed to initialize Gemini API Client: {str(e)}")

    def plan_session(self, code: str, problem_statement: str, test_input: str, query: Optional[str] = None) -> AgentAnalysisResponse:
        """
        Invokes Gemini API with structured schema output to construct ProblemUnderstanding, UserApproach, and UIPlan.
        """
        schema_dict = AgentAnalysisResponse.model_json_schema()
        
        def clean_schema(s: Any):
            if isinstance(s, dict):
                s.pop("additionalProperties", None)
                for k, v in list(s.items()):
                    clean_schema(v)
            elif isinstance(s, list):
                for item in s:
                    clean_schema(item)
                    
        clean_schema(schema_dict)
        
        user_prompt = f"""
PROBLEM STATEMENT:
{problem_statement or "(None)"}

USER SOLUTION CODE:
{code or "(None)"}

ACTIVE SAMPLE TEST CASE:
{test_input or "(None)"}

USER CHAT INQUIRY:
{query or "Analyze my approach, find any logical bugs, and compare it with the optimal solution complexity."}
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    response_schema=schema_dict,
                    temperature=0.2
                )
            )
            
            raw_json = json.loads(response.text)
            validated_response = AgentAnalysisResponse.model_validate(raw_json)
            return validated_response
            
        except Exception as e:
            raise RuntimeError(f"Agent Error: Gemini API generation failed: {str(e)}")
