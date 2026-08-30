"""
Query Router for CodeMentor AI.
Processes user queries within the active session, coordinates intent handling,
and logs chronological conversation history in MongoDB.
"""
import logging
from fastapi import APIRouter, HTTPException

from backend.agents.schemas import QueryRequest, AgentResponse
from backend.services.session import get_session_service
from backend.services.conversation import get_conversation_service
from backend.agents.planner import get_planner

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["query"])


@router.post("", response_model=AgentResponse, summary="Send a query to CodeMentor AI")
async def process_query(request: QueryRequest):
    session_service = get_session_service()
    conversation_service = get_conversation_service()
    planner = get_planner()

    session = session_service.get_or_create_session(
        session_id=request.session_id,
        user_id=request.user_id or "default_user",
    )
    session_id = session.session_id
    user_id = session.user_id

    conversation_service.save_message(
        session_id=session_id,
        user_id=user_id,
        role="user",
        content=request.query,
    )

    try:
        agent_response = await planner.execute_query(
            session_id=session_id,
            user_id=user_id,
            query=request.query,
        )
    except Exception as e:
        logger.error(f"[QueryRouter] Planner execution failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent execution error: {str(e)}")

    conversation_service.save_message(
        session_id=session_id,
        user_id=user_id,
        role="assistant",
        content=agent_response.response,
        intent=agent_response.intent,
        structured_data=agent_response.structured_data,
        next_actions=[a.model_dump() for a in agent_response.next_actions],
    )

    return agent_response
