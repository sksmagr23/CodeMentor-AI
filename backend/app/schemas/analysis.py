from pydantic import BaseModel, Field
from typing import Optional

class AnalysisRequest(BaseModel):
    code: str = Field(..., description="The user solution code snippet.")
    problem_statement: str = Field(..., description="The DSA problem statement description.")
    test_input: str = Field(..., description="The active sample test input/arguments.")
    query: Optional[str] = Field(None, description="Optional user follow-up text prompt query.")

class ContextSyncRequest(BaseModel):
    code: str = Field(..., description="The user solution code snippet to sync.")
    problem_statement: str = Field(..., description="The DSA problem statement to sync.")
    test_input: str = Field(..., description="The active test case parameters to sync.")

class ContextSyncResponse(BaseModel):
    session_id: str = Field(..., description="The session identifier linked to the synced context.")
    message: str = Field(..., description="Confirmation message.")

class ConversationalQueryRequest(BaseModel):
    query: str = Field(..., description="The user query text sent to the agent.")
