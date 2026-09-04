import type { AgentResponse, DSASessionContext, ChatMessage, SessionSummary } from '../types/dsa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TOKEN_KEY = 'codementor_auth_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// AUTH API

export interface GoogleLoginPayload {
  email: string;
  name: string;
  avatar_url?: string;
  google_id?: string;
}

export interface AuthApiResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    provider: string;
  };
}

export async function loginWithGoogleApi(payload: GoogleLoginPayload): Promise<AuthApiResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to authenticate with Google');
  }
  const data: AuthApiResponse = await res.json();
  setAuthToken(data.access_token);
  return data;
}

export async function getCurrentUserApi() {
  const token = getAuthToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    setAuthToken(null);
    return null;
  }
  return res.json();
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } finally {
    setAuthToken(null);
  }
}

// SESSIONS & WORKSPACE API

export async function createSession(userId: string = 'default_user'): Promise<DSASessionContext> {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error(`Failed to create session: ${res.statusText}`);
  return res.json();
}

export async function listSessions(): Promise<SessionSummary[]> {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to list sessions: ${res.statusText}`);
  return res.json();
}

export const getSessionsList = listSessions;

export async function getSession(sessionId: string): Promise<DSASessionContext> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to get session: ${res.statusText}`);
  return res.json();
}

export async function sendQuery(
  query: string,
  sessionId?: string,
  userId: string = 'default_user'
): Promise<AgentResponse> {
  const res = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      session_id: sessionId || null,
      user_id: userId,
      query,
    }),
  });
  if (!res.ok) throw new Error(`Query failed: ${res.statusText}`);
  return res.json();
}

export async function updateSessionContext(
  sessionId: string,
  problem: string,
  solution: string,
  language: string = 'cpp',
  activeInput: string = '',
  testCases: string[] = [],
  analyzeImmediately: boolean = true
): Promise<AgentResponse> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/context`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      problem,
      solution,
      language,
      active_input: activeInput,
      test_cases: testCases,
      analyze_immediately: analyzeImmediately,
    }),
  });
  if (!res.ok) throw new Error(`Failed to update context: ${res.statusText}`);
  return res.json();
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete session: ${res.statusText}`);
}
