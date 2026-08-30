import React, { useEffect, useState } from 'react';
import type { SessionSummary } from '../../types/dsa';
import { listSessions, deleteSession } from '../../services/api';
import { X, MessageSquare, Trash2 } from 'lucide-react';

interface SessionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSessionId?: string | null;
  onSelectSession: (sessionId: string) => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  isOpen,
  onClose,
  currentSessionId,
  onSelectSession,
}) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to list sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    try {
      await deleteSession(sid);
      setSessions((prev) => prev.filter((s) => s.session_id !== sid));
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-slate-950 border-l border-slate-800 flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h3 className="font-['Space_Grotesk'] text-sm font-semibold text-slate-100">
              Session History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No past sessions found.</div>
          ) : (
            sessions.map((sess) => {
              const isCurrent = sess.session_id === currentSessionId;
              return (
                <div
                  key={sess.session_id}
                  onClick={() => {
                    onSelectSession(sess.session_id);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-slate-900 border-cyan-500/50 shadow-md'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-slate-200 truncate flex-1">
                      {sess.problem_title || 'DSA Session'}
                    </h4>
                    <button
                      onClick={(e) => handleDelete(e, sess.session_id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-all"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-['JetBrains_Mono']">
                    <span>{sess.message_count} messages</span>
                    <span className="uppercase">{sess.language || 'cpp'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
