import type { AgentResponse, DSASessionContext, ChatMessage, SessionSummary } from '../types/dsa';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function createSession(userId: string = 'default_user'): Promise<DSASessionContext> {
  const res = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error(`Failed to create session: ${res.statusText}`);
  return res.json();
}

export async function listSessions(): Promise<SessionSummary[]> {
  const res = await fetch(`${API_BASE_URL}/sessions`);
  if (!res.ok) throw new Error(`Failed to list sessions: ${res.statusText}`);
  return res.json();
}

export async function getSession(sessionId: string): Promise<DSASessionContext> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`);
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
    headers: { 'Content-Type': 'application/json' },
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
  analyzeImmediately: boolean = true
): Promise<AgentResponse> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      problem,
      solution,
      language,
      active_input: activeInput,
      analyze_immediately: analyzeImmediately,
    }),
  });
  if (!res.ok) throw new Error(`Failed to update context: ${res.statusText}`);
  return res.json();
}

export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.statusText}`);
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete session: ${res.statusText}`);
}
