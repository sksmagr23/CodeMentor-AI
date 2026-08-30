"""
MongoDB connection manager and collections provider for CodeMentor AI.
Handles connections, indexes, and document sanitization.
"""
import os
import logging
from typing import Optional, Dict, Any
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.collection import Collection
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

logger = logging.getLogger(__name__)

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "codementor_db")


class MongoDBManager:
    _instance: Optional["MongoDBManager"] = None
    _client: Optional[MongoClient] = None
    _db: Optional[Database] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDBManager, cls).__new__(cls)
        return cls._instance

    @classmethod
    def get_client(cls) -> MongoClient:
        if cls._client is None:
            try:
                cls._client = MongoClient(
                    MONGODB_URL,
                    serverSelectionTimeoutMS=5000,
                    connectTimeoutMS=5000,
                )
                cls._client.admin.command("ping")
                logger.info(f"[MongoDB] Connected successfully")
            except Exception as e:
                logger.error(f"[MongoDB] Connection failed: {e}")
                raise e
        return cls._client

    @classmethod
    def get_database(cls) -> Database:
        if cls._db is None:
            client = cls.get_client()
            cls._db = client[DB_NAME]
            cls._ensure_indexes(cls._db)
        return cls._db

    @classmethod
    def _ensure_indexes(cls, db: Database):
        """Create necessary indexes for dsa_sessions and conversation_history."""
        try:
            db["dsa_sessions"].create_index([("session_id", ASCENDING)], unique=True)
            db["dsa_sessions"].create_index([("user_id", ASCENDING)])
            db["dsa_sessions"].create_index([("updated_at", DESCENDING)])

            db["conversation_history"].create_index([("session_id", ASCENDING), ("created_at", ASCENDING)])
            db["conversation_history"].create_index([("user_id", ASCENDING)])
        except Exception as e:
            logger.warning(f"{e}")

    @property
    def dsa_sessions(self) -> Collection:
        return self.get_database()["dsa_sessions"]

    @property
    def conversation_history(self) -> Collection:
        return self.get_database()["conversation_history"]


def get_db_manager() -> MongoDBManager:
    return MongoDBManager()


def sanitize_mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert ObjectId to string and make document JSON-serializable."""
    if doc is None:
        return None
    cleaned = dict(doc)
    if "_id" in cleaned:
        cleaned["_id"] = str(cleaned["_id"])
    return cleaned
