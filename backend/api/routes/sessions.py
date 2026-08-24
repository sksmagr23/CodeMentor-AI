from fastapi import APIRouter, HTTPException
from backend.app.schemas.analysis import AnalysisRequest
from backend.agents.planner import AgentPlanner, AgentAnalysisResponse
import logging

router = APIRouter(prefix="/sessions", tags=["Sessions"])
logger = logging.getLogger(__name__)

@router.post("/analyze", response_model=AgentAnalysisResponse)
async def analyze_snippet(req: AnalysisRequest):
    """Direct standalone analysis of user code snippet, problem statement, and active test case."""
    try:
        planner = AgentPlanner()
        analysis = planner.plan_session(
            code=req.code,
            problem_statement=req.problem_statement,
            test_input=req.test_input,
            query=req.query
        )
        return analysis
    except Exception as e:
        logger.error(f"Snippet analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="CodeMentor AI: There was an issue processing your request. Please try again in a while."
        )
