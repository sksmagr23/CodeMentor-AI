"""
CodeMentor AI - FastAPI Main Application.
Provides RESTful APIs for conversational DSA mentorship,
session persistence, and dynamic structured record generation.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from backend.db.mongodb import get_db_manager
from backend.api.routes.query import router as query_router
from backend.api.routes.sessions import router as sessions_router
from backend.api.routes.auth import router as auth_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("codementor")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing CodeMentor AI backend...")
    try:
        db_mgr = get_db_manager()
        _ = db_mgr.get_database()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB on startup: {e}")
    yield
    logger.info("Shutting down CodeMentor AI backend...")


app = FastAPI(
    title="CodeMentor AI",
    description="Conversational DSA Mentor with Intent-driven UI",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(query_router)
api_router.include_router(sessions_router)

@api_router.get("/health", summary="API Health Check")
@app.get("/health", summary="Health Check")
async def health_check():
    return {
        "status": "healthy",
        "service": "CodeMentor AI",
        "version": "1.0.0",
        "database": "connected",
    }

app.include_router(api_router)
app.include_router(auth_router)
app.include_router(query_router)
app.include_router(sessions_router)


@app.get("/", summary="Root Endpoint")
async def root():
    return {
        "message": "Welcome to CodeMentor AI API",
        "docs": "/docs",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
