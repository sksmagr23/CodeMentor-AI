import { useState, useEffect, useCallback } from 'react';
import type {
  ChatMessage,
  DSASessionContext,
  AgentResponse,
} from '../types/dsa';
import {
  createSession,
  getSession,
  getSessionMessages,
  sendQuery,
  updateSessionContext,
} from '../services/api';

const SESSION_STORAGE_KEY = 'codementor_session_id';

export function useChatSession() {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_STORAGE_KEY) || null;
  });
  const [sessionContext, setSessionContext] = useState<DSASessionContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initSession() {
      try {
        setIsLoading(true);
        if (sessionId) {
          try {
            const [ctx, msgs] = await Promise.all([
              getSession(sessionId),
              getSessionMessages(sessionId),
            ]);
            setSessionContext(ctx);
            setMessages(msgs);
            return;
          } catch (e) {
            console.warn('Existing session not found on server, creating a new one.', e);
          }
        }

        const newSession = await createSession();
        setSessionId(newSession.session_id);
        setSessionContext(newSession);
        setMessages([]);
        localStorage.setItem(SESSION_STORAGE_KEY, newSession.session_id);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize session');
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const sendMessage = useCallback(
    async (queryText: string) => {
      if (!queryText.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        session_id: sessionId || '',
        user_id: 'default_user',
        role: 'user',
        content: queryText,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(null);

      try {
        const response: AgentResponse = await sendQuery(queryText, sessionId || undefined);

        if (!sessionId && response.session_id) {
          setSessionId(response.session_id);
          localStorage.setItem(SESSION_STORAGE_KEY, response.session_id);
        }

        const assistantMsg: ChatMessage = {
          session_id: response.session_id,
          user_id: 'default_user',
          role: 'assistant',
          content: response.response,
          intent: response.intent,
          structured_data: response.structured_data,
          next_actions: response.next_actions,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (response.dsa_context) {
          setSessionContext(response.dsa_context as DSASessionContext);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to send message');
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading]
  );

  const saveProblemContext = useCallback(
    async (data: {
      problem: string;
      solution: string;
      language: string;
      active_input?: string;
      test_cases?: string[];
      analyzeImmediately?: boolean;
    }) => {
      if (!sessionId) return;
      setIsLoading(true);
      setError(null);

      const analyzeNow = data.analyzeImmediately !== false;

      try {
        const response = await updateSessionContext(
          sessionId,
          data.problem,
          data.solution,
          data.language,
          data.active_input || (data.test_cases && data.test_cases[0]) || '',
          data.test_cases || [],
          analyzeNow
        );

        if (analyzeNow && response.response) {
          const assistantMsg: ChatMessage = {
            session_id: sessionId,
            user_id: 'default_user',
            role: 'assistant',
            content: response.response,
            intent: response.intent,
            structured_data: response.structured_data,
            next_actions: response.next_actions,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }

        if (response.dsa_context) {
          setSessionContext(response.dsa_context as DSASessionContext);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to submit problem setup');
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  const startNewSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const newSession = await createSession();
      setSessionId(newSession.session_id);
      setSessionContext(newSession);
      setMessages([]);
      localStorage.setItem(SESSION_STORAGE_KEY, newSession.session_id);
    } catch (err: any) {
      setError(err.message || 'Failed to create new session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (sid: string) => {
    try {
      setIsLoading(true);
      const [ctx, msgs] = await Promise.all([
        getSession(sid),
        getSessionMessages(sid),
      ]);
      setSessionId(sid);
      setSessionContext(ctx);
      setMessages(msgs);
      localStorage.setItem(SESSION_STORAGE_KEY, sid);
    } catch (err: any) {
      setError(err.message || 'Failed to load session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sessionId,
    sessionContext,
    messages,
    isLoading,
    error,
    sendMessage,
    saveProblemContext,
    startNewSession,
    loadSession,
  };
}
