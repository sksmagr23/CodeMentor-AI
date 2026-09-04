"""
Sessions Router for CodeMentor AI.
Handles session creation, context updates, history retrieval, and session listing.
"""
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Path, Depends

from backend.agents.schemas import (
    DSASessionContext,
    ContextUpdateRequest,
    SessionCreateRequest,
    SessionSummary,
    ChatMessageRecord,
    AgentResponse,
)
from backend.services.session import get_session_service
from backend.services.conversation import get_conversation_service
from backend.agents.planner import get_planner

from backend.services.auth import get_current_user_optional
from fastapi import Depends

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=DSASessionContext, summary="Create a new DSA session")
async def create_session(
    request: SessionCreateRequest = SessionCreateRequest(),
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    session_service = get_session_service()
    user_id = current_user["user_id"] if current_user else (request.user_id or "default_user")
    session = session_service.create_session(
        user_id=user_id,
        initial_context=request.initial_context,
    )
    return session


@router.get("", response_model=List[SessionSummary], summary="List active DSA sessions")
async def list_sessions(
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    session_service = get_session_service()
    user_id = current_user.get("user_id") if current_user else None
    return session_service.list_sessions(user_id=user_id)


@router.get("/{session_id}", response_model=DSASessionContext, summary="Get DSA session and context")
async def get_session(session_id: str = Path(..., description="Session ID")):
    session_service = get_session_service()
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/{session_id}/context", response_model=AgentResponse, summary="Save or update problem and solution context")
async def update_session_context(
    session_id: str,
    context: ContextUpdateRequest,
):
    """
    Save problem and solution context to the session.
    If analyze_immediately is True, runs initial solution analysis and returns
    structured approach card + next actions!
    """
    session_service = get_session_service()
    conversation_service = get_conversation_service()
    planner = get_planner()

    session = session_service.update_context(session_id=session_id, context=context)

    user_msg = f"Submitted problem and solution for analysis:\n\nProblem:\n{context.problem}\n\nLanguage: {context.language}"
    conversation_service.save_message(
        session_id=session_id,
        user_id=session.user_id,
        role="user",
        content=user_msg,
    )

    if context.analyze_immediately:
        response = await planner.execute_query(
            session_id=session_id,
            user_id=session.user_id,
            query="Analyze my solution approach and its correctness",
        )
    else:
        response = AgentResponse(
            session_id=session_id,
            response="Problem and solution context updated successfully.",
            intent="setup_problem",
            structured_data=None,
            next_actions=[],
            dsa_context=session.model_dump(),
        )

    conversation_service.save_message(
        session_id=session_id,
        user_id=session.user_id,
        role="assistant",
        content=response.response,
        intent=response.intent,
        structured_data=response.structured_data,
        next_actions=[a.model_dump() for a in response.next_actions],
    )

    return response


@router.get("/{session_id}/messages", response_model=List[ChatMessageRecord], summary="Get conversation history")
async def get_session_messages(session_id: str = Path(..., description="Session ID")):
    conversation_service = get_conversation_service()
    messages = conversation_service.get_messages(session_id=session_id)
    return messages


@router.delete("/{session_id}", summary="Delete session and history")
async def delete_session(session_id: str = Path(..., description="Session ID")):
    session_service = get_session_service()
    session_service.delete_session(session_id)
    return {"status": "success", "message": f"Session {session_id} deleted"}
