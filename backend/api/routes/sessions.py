import json
from fastapi import APIRouter, HTTPException, Depends
from backend.app.schemas.session import (
    SessionCreateRequest, SessionStateResponse
)
from backend.app.schemas.analysis import (
    AnalysisRequest, ContextSyncRequest, ContextSyncResponse, ConversationalQueryRequest
)
from backend.agents.planner import AgentPlanner, AgentAnalysisResponse
from backend.app.redis_client import redis_client
from backend.execution.sandbox.manager import SandboxManager
from backend.execution.sandbox.policy import SandboxPolicy

router = APIRouter(prefix="/sessions", tags=["Sessions"])
manager = SandboxManager()

def get_session_data(session_id: str) -> tuple:
    """Helper to fetch trace, cursor, and code from Redis."""
    if not redis_client:
        raise HTTPException(status_code=500, detail="Redis client is not initialized.")
        
    trace_json = redis_client.get(f"trace_{session_id}")
    cursor_str = redis_client.get(f"cursor_{session_id}")
    code = redis_client.get(f"code_{session_id}")
    
    if not trace_json or not cursor_str:
        raise HTTPException(status_code=404, detail="Execution session not found or expired.")
        
    return json.loads(trace_json), int(cursor_str), code or ""

def reconstruct_state(session_id: str, trace_data: dict, step: int, code: str) -> dict:
    """Replays trace events up to target step K to reconstruct variables, outputs, and line cursor."""
    events = trace_data.get("events", [])
    total_steps = len(events)
    status = trace_data.get("status", "success")
    error_message = trace_data.get("error_message")
    
    if total_steps == 0:
        return {
            "session_id": session_id,
            "step": 1,
            "total_steps": 0,
            "line": 1,
            "variables": [],
            "output": [f"[error]: {error_message}"] if error_message else [],
            "status": status,
            "error_message": error_message
        }
        
    if step < 1:
        step = 1
    if step > total_steps:
        step = total_steps
        
    current_line = 1
    variables = {}
    output = []
    
    for idx in range(step):
        event = events[idx]
        event_type = event.get("type")
        
        if "line" in event and event["line"] > 0:
            current_line = event["line"]
            
        for var in variables.values():
            var["changed"] = False
            
        if event_type == "assignment":
            var_name = event.get("variable")
            val = event.get("value")
            prev_val = variables.get(var_name, {}).get("value")
            
            variables[var_name] = {
                "name": var_name,
                "value": val,
                "prev_value": prev_val,
                "changed": True
            }
        elif event_type == "output":
            output.append(event.get("text"))
            
    return {
        "session_id": session_id,
        "step": step,
        "total_steps": total_steps,
        "line": current_line,
        "variables": list(variables.values()),
        "output": output,
        "status": status,
        "error_message": error_message
    }

@router.post("", response_model=SessionStateResponse)
async def create_session(req: SessionCreateRequest):
    """Compiles C++ source code, executes it inside sandbox, and registers a session."""
    if not redis_client:
        raise HTTPException(status_code=500, detail="Redis server is offline.")
        
    policy = SandboxPolicy()
    trace = manager.compile_and_run(req.source_code, req.input_data, policy)
    
    session_id = trace.session_id
    
    redis_client.setex(f"trace_{session_id}", 1800, trace.model_dump_json())
    redis_client.setex(f"code_{session_id}", 1800, req.source_code)
    redis_client.setex(f"input_{session_id}", 1800, req.input_data)
    redis_client.setex(f"cursor_{session_id}", 1800, "1")
    
    trace_data = json.loads(trace.model_dump_json())
    
    return reconstruct_state(session_id, trace_data, 1, req.source_code)

@router.get("/{session_id}", response_model=SessionStateResponse)
async def get_session(session_id: str):
    """Retrieves current visual state of the execution session."""
    trace_data, cursor, code = get_session_data(session_id)
    return reconstruct_state(session_id, trace_data, cursor, code)



import uuid
import logging

logger = logging.getLogger(__name__)

memory_session_store = {}

def save_session_context(session_id: str, code: str, problem_statement: str, test_input: str):
    if redis_client:
        try:
            redis_client.setex(f"code_{session_id}", 1800, code)
            redis_client.setex(f"problem_{session_id}", 1800, problem_statement)
            redis_client.setex(f"input_{session_id}", 1800, test_input)
        except Exception as e:
            logger.warning(f"Redis write failed, using local memory: {e}")
            
    memory_session_store[session_id] = {
        "code": code,
        "problem_statement": problem_statement,
        "test_input": test_input
    }

def get_session_context(session_id: str) -> tuple:
    if session_id in memory_session_store:
        ctx = memory_session_store[session_id]
        return ctx["code"], ctx["problem_statement"], ctx["test_input"]
        
    if redis_client:
        try:
            code_bytes = redis_client.get(f"code_{session_id}")
            prob_bytes = redis_client.get(f"problem_{session_id}")
            input_bytes = redis_client.get(f"input_{session_id}")
            
            code = code_bytes.decode("utf8") if isinstance(code_bytes, bytes) else str(code_bytes or "")
            prob = prob_bytes.decode("utf8") if isinstance(prob_bytes, bytes) else str(prob_bytes or "")
            inp = input_bytes.decode("utf8") if isinstance(input_bytes, bytes) else str(input_bytes or "")
            if code or prob or inp:
                return code, prob, inp
        except Exception as e:
            logger.warning(f"Redis read failed: {e}")
            
    return "", "", ""

@router.post("/sync", response_model=ContextSyncResponse)
async def sync_new_session(req: ContextSyncRequest):
    """Registers a new workspace context, creating a unique session ID."""
    session_id = str(uuid.uuid4())
    save_session_context(session_id, req.code, req.problem_statement, req.test_input)
    return ContextSyncResponse(session_id=session_id, message="Workspace context synced successfully.")

@router.post("/{session_id}/sync", response_model=ContextSyncResponse)
async def sync_existing_session(session_id: str, req: ContextSyncRequest):
    """Updates the active workspace context for an existing session ID."""
    save_session_context(session_id, req.code, req.problem_statement, req.test_input)
    return ContextSyncResponse(session_id=session_id, message="Workspace context updated successfully.")

@router.post("/{session_id}/analyze", response_model=AgentAnalysisResponse)
async def analyze_session(session_id: str, req: ConversationalQueryRequest):
    """Invokes the Agent Planner to analyze conversational query using the active synced workspace context."""
    code, problem_statement, test_input = get_session_context(session_id)
    if not code and not problem_statement:
         raise HTTPException(status_code=400, detail="No active synced workspace context found. Please sync your details first.")
         
    try:
        planner = AgentPlanner()
        analysis = planner.plan_session(
            code=code,
            problem_statement=problem_statement,
            test_input=test_input,
            query=req.query
        )
        return analysis
    except Exception as e:
        logger.error(f"Agent analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="CodeMentor AI: There was an issue processing your request. Please try again in a while."
        )

@router.post("/analyze", response_model=AgentAnalysisResponse)
async def analyze_snippet(req: AnalysisRequest):
    """Direct standalone analysis of user code snippet, problem statement, and active test case (for tests/direct access)."""
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
