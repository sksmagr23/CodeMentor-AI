import React, { useState } from 'react';
import { Terminal, Plus, History, Copy, Check } from 'lucide-react';

interface HeaderProps {
  sessionId?: string | null;
  onNewSession: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sessionId,
  onNewSession,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [copied, setCopied] = useState(false);

  const copySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 md:px-6 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
          <Terminal className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 tracking-tight">
            CodeMentor <span className="text-cyan-400">AI</span>
          </h1>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            DSA Assistant
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {sessionId && (
          <button
            onClick={copySessionId}
            title="Click to copy Session ID"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-['JetBrains_Mono'] transition-colors"
          >
            <span className="text-slate-500">ID:</span>
            <span>{sessionId.slice(0, 8)}...</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 text-slate-500" />
            )}
          </button>
        )}

        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-sm shadow-cyan-600/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Session</span>
        </button>

        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isSidebarOpen
              ? 'bg-slate-800 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Past Sessions"
        >
          <History className="w-3.5 h-3.5" />
          <span className="hidden md:inline">History</span>
        </button>
      </div>
    </header>
  );
};
