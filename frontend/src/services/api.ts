const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface VariableState {
  name: string;
  value: any;
  prev_value: any | null;
  changed: boolean;
}

export interface SessionState {
  session_id: string;
  step: number;
  total_steps: number;
  line: number;
  variables: VariableState[];
  output: string[];
  status: string;
  error_message: string | null;
}

export const api = {
  createSession: async (sourceCode: string, inputData: string): Promise<SessionState> => {
    const res = await fetch(`${API_URL}/api/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code: sourceCode,
        input_data: inputData,
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to create session");
    }
    
    return res.json();
  },

  analyzeSnippet: async (
    code: string,
    problemStatement: string,
    testInput: string,
    query?: string
  ): Promise<any> => {
    const res = await fetch(`${API_URL}/api/v1/sessions/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        problem_statement: problemStatement,
        test_input: testInput,
        query: query || ""
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.detail || "CodeMentor AI analysis failed.";
      throw new Error(errMsg);
    }

    return res.json();
  },

  syncContext: async (
    session_id: string | null,
    code: string,
    problemStatement: string,
    testInput: string
  ): Promise<{ session_id: string; message: string }> => {
    const url = session_id 
      ? `${API_URL}/api/v1/sessions/${session_id}/sync`
      : `${API_URL}/api/v1/sessions/sync`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        problem_statement: problemStatement,
        test_input: testInput
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.detail || "Workspace context sync failed.";
      throw new Error(errMsg);
    }

    return res.json();
  },

  analyzeConversational: async (
    session_id: string,
    query: string
  ): Promise<any> => {
    const res = await fetch(`${API_URL}/api/v1/sessions/${session_id}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.detail || "Conversational analysis failed.";
      throw new Error(errMsg);
    }

    return res.json();
  }
};
