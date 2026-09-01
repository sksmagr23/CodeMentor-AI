"""
Session service for CodeMentor AI.
Manages persistent DSA workspace context in MongoDB 'dsa_sessions' collection.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from backend.db.mongodb import get_db_manager, sanitize_mongo_doc
from backend.agents.schemas import (
    DSASessionContext,
    ContextUpdateRequest,
    SessionSummary,
)

logger = logging.getLogger(__name__)


class DSASessionService:
    def __init__(self):
        self.db = get_db_manager()

    def create_session(
        self,
        user_id: str = "default_user",
        session_id: Optional[str] = None,
        initial_context: Optional[ContextUpdateRequest] = None,
    ) -> DSASessionContext:
        """Create a new DSA session context."""
        sid = session_id or str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        doc = {
            "session_id": sid,
            "user_id": user_id,
            "problem": initial_context.problem if initial_context else None,
            "solution": initial_context.solution if initial_context else None,
            "language": initial_context.language if initial_context else "cpp",
            "active_input": initial_context.active_input if initial_context else None,
            "test_cases": initial_context.test_cases if initial_context else [],
            "problem_understanding": None,
            "user_approach": None,
            "current_analysis": None,
            "generated_solutions": [],
            "current_workspace_state": {},
            "created_at": now,
            "updated_at": now,
        }

        self.db.dsa_sessions.replace_one({"session_id": sid}, doc, upsert=True)
        logger.info(f"[SessionService] Created session: {sid} for user: {user_id}")
        return DSASessionContext(**doc)

    def get_session(self, session_id: str) -> Optional[DSASessionContext]:
        """Retrieve a session by its session_id."""
        doc = self.db.dsa_sessions.find_one({"session_id": session_id})
        if not doc:
            return None
        doc = sanitize_mongo_doc(doc)
        return DSASessionContext(**doc)

    def get_or_create_session(
        self,
        session_id: Optional[str],
        user_id: str = "default_user"
    ) -> DSASessionContext:
        """Fetch existing session or create a new one if not found."""
        if session_id:
            existing = self.get_session(session_id)
            if existing:
                return existing
        return self.create_session(user_id=user_id, session_id=session_id)

    def update_context(
        self,
        session_id: str,
        context: ContextUpdateRequest,
        user_id: str = "default_user"
    ) -> DSASessionContext:
        """Update problem, solution, language, active input, and test cases in session."""
        now = datetime.now(timezone.utc)
        active_in = context.active_input
        if not active_in and context.test_cases:
            active_in = context.test_cases[0]

        update_fields = {
            "problem": context.problem,
            "solution": context.solution,
            "language": context.language,
            "active_input": active_in,
            "test_cases": context.test_cases or [],
            "updated_at": now,
        }

        self.db.dsa_sessions.update_one(
            {"session_id": session_id},
            {"$set": update_fields},
            upsert=True
        )

        session = self.get_session(session_id)
        if not session:
            return self.create_session(user_id=user_id, session_id=session_id, initial_context=context)
        return session

    def update_analysis_state(
        self,
        session_id: str,
        problem_understanding: Optional[Dict[str, Any]] = None,
        user_approach: Optional[Dict[str, Any]] = None,
        current_analysis: Optional[Dict[str, Any]] = None,
        generated_solutions: Optional[List[Dict[str, Any]]] = None,
        workspace_state: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Persist structured analysis insights into the session."""
        updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
        if problem_understanding is not None:
            updates["problem_understanding"] = problem_understanding
        if user_approach is not None:
            updates["user_approach"] = user_approach
        if current_analysis is not None:
            updates["current_analysis"] = current_analysis
        if generated_solutions is not None:
            updates["generated_solutions"] = generated_solutions
        if workspace_state is not None:
            updates["current_workspace_state"] = workspace_state

        self.db.dsa_sessions.update_one({"session_id": session_id}, {"$set": updates})

    def list_sessions(self, user_id: Optional[str] = None, limit: int = 30) -> List[SessionSummary]:
        """List active sessions for sidebar navigation."""
        query = {"user_id": user_id} if user_id else {}
        cursor = self.db.dsa_sessions.find(query).sort("updated_at", -1).limit(limit)

        summaries: List[SessionSummary] = []
        for doc in cursor:
            sid = doc["session_id"]
            msg_count = self.db.conversation_history.count_documents({"session_id": sid})
            title = None
            if doc.get("problem_understanding") and doc["problem_understanding"].get("title"):
                title = doc["problem_understanding"]["title"]
            elif doc.get("problem"):
                title = (doc["problem"].strip().split("\n")[0])[:40]

            summaries.append(
                SessionSummary(
                    session_id=sid,
                    user_id=doc.get("user_id", "default_user"),
                    problem_title=title or "DSA Session",
                    language=doc.get("language", "cpp"),
                    message_count=msg_count,
                    created_at=doc.get("created_at", datetime.now(timezone.utc)),
                    updated_at=doc.get("updated_at", datetime.now(timezone.utc)),
                )
            )
        return summaries

    def delete_session(self, session_id: str) -> bool:
        """Delete session and its associated chat history."""
        self.db.dsa_sessions.delete_one({"session_id": session_id})
        self.db.conversation_history.delete_many({"session_id": session_id})
        return True


_session_service: Optional[DSASessionService] = None


def get_session_service() -> DSASessionService:
    global _session_service
    if _session_service is None:
        _session_service = DSASessionService()
    return _session_service
