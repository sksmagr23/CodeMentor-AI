from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SessionCreateRequest(BaseModel):
    source_code: str = Field(..., description="C++ source code to compile and trace.")
    input_data: Optional[str] = Field("", description="Standard input (stdin) data to feed into execution.")

class VariableUIState(BaseModel):
    name: str
    value: Any
    prev_value: Optional[Any] = None
    changed: bool = False

class SessionStateResponse(BaseModel):
    session_id: str
    step: int
    total_steps: int
    line: int
    variables: List[VariableUIState]
    output: List[str]
    status: str
    error_message: Optional[str] = None
