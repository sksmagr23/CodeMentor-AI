"""
Conversation history service for CodeMentor AI.
Saves and retrieves chronological user and agent chat messages in MongoDB 'conversation_history' collection.
"""
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.db.mongodb import get_db_manager, sanitize_mongo_doc
from backend.agents.schemas import ChatMessageRecord, NextAction

logger = logging.getLogger(__name__)


class ConversationService:
    def __init__(self):
        self.db = get_db_manager()

    def save_message(
        self,
        session_id: str,
        user_id: str,
        role: str,
        content: str,
        intent: Optional[str] = None,
        structured_data: Optional[Dict[str, Any]] = None,
        next_actions: Optional[List[Dict[str, str]]] = None,
    ) -> ChatMessageRecord:
        """Save a single message (user or assistant) to MongoDB conversation history."""
        now = datetime.now(timezone.utc)
        actions_data = [
            action if isinstance(action, dict) else action.model_dump()
            for action in (next_actions or [])
        ]

        doc = {
            "session_id": session_id,
            "user_id": user_id,
            "role": role,
            "content": content,
            "intent": intent,
            "structured_data": structured_data,
            "next_actions": actions_data,
            "created_at": now,
        }

        self.db.conversation_history.insert_one(doc)

        self.db.dsa_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"updated_at": now}}
        )

        return ChatMessageRecord(
            session_id=session_id,
            user_id=user_id,
            role=role,
            content=content,
            intent=intent,
            structured_data=structured_data,
            next_actions=[NextAction(**a) for a in actions_data],
            created_at=now,
        )

    def get_messages(self, session_id: str, limit: int = 100) -> List[ChatMessageRecord]:
        """Fetch all messages for a session in chronological order."""
        cursor = self.db.conversation_history.find(
            {"session_id": session_id}
        ).sort("created_at", 1).limit(limit)

        records: List[ChatMessageRecord] = []
        for doc in cursor:
            doc = sanitize_mongo_doc(doc)
            actions = [NextAction(**a) for a in doc.get("next_actions", [])]
            records.append(
                ChatMessageRecord(
                    session_id=doc["session_id"],
                    user_id=doc.get("user_id", "default_user"),
                    role=doc["role"],
                    content=doc["content"],
                    intent=doc.get("intent"),
                    structured_data=doc.get("structured_data"),
                    next_actions=actions,
                    created_at=doc.get("created_at", datetime.now(timezone.utc)),
                )
            )
        return records

    def clear_history(self, session_id: str) -> None:
        """Clear all messages for a given session."""
        self.db.conversation_history.delete_many({"session_id": session_id})


_conversation_service: Optional[ConversationService] = None


def get_conversation_service() -> ConversationService:
    global _conversation_service
    if _conversation_service is None:
        _conversation_service = ConversationService()
    return _conversation_service
