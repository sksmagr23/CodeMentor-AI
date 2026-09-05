import React, { useEffect, useState } from 'react';
import type { SessionSummary } from '../../types/dsa';
import { listSessions, deleteSession } from '../../services/api';
import { useToast } from '../../context/ToastContext';
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
  const toast = useToast();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to list sessions:', err);
      toast.error('Could not load history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSessions();
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    try {
      await deleteSession(sid);
      setSessions((prev) => prev.filter((s) => s.session_id !== sid));
      toast.success('Session deleted');
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('Delete failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 animate-fade-in">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close overlay" />
      <div className="relative w-full max-w-sm bg-paper-elevated border-l-2 border-accent flex flex-col h-full shadow-hard-lg animate-slide-in-right">
        <div className="h-14 px-4 border-b-2 border-accent flex items-center justify-between bg-paper">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent-bright" strokeWidth={2.25} />
            <h3 className="font-display text-lg text-ink">Session History</h3>
          </div>
          <button onClick={onClose} className="icon-btn w-8 h-8" aria-label="Close">
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-graph-fine">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted font-mono">Loading sessions…</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted">No past sessions found.</div>
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
                  className={`group relative p-3 border-2 border-accent text-xs cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-accent-soft shadow-hard'
                      : 'bg-paper-elevated hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-ink truncate flex-1">
                      {sess.problem_title || 'DSA Session'}
                    </h4>
                    <button
                      onClick={(e) => handleDelete(e, sess.session_id)}
                      className="opacity-0 group-hover:opacity-100 p-1 border border-transparent hover:border-accent hover:bg-danger/10 text-muted hover:text-danger transition-all"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                    <span>{sess.message_count} messages</span>
                    <span className="uppercase text-accent-bright">{sess.language || 'cpp'}</span>
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
