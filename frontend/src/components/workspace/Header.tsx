import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Plus, History, Copy, Check, Home, Layout, LogOut, ChevronDown, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  sessionId?: string | null;
  currentView: 'home' | 'workspace';
  onNavigate: (view: 'home' | 'workspace') => void;
  onNewSession: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sessionId,
  currentView,
  onNavigate,
  onNewSession,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const copySessionId = () => {
    if (!sessionId) return;
    navigator.clipboard.writeText(sessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none">
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-['Space_Grotesk'] text-base font-bold text-slate-100 tracking-tight">
              CodeMentor <span className="text-cyan-400">AI</span>
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              DSA Pair Programmer
            </span>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              currentView === 'home'
                ? 'bg-slate-900 text-cyan-300 border border-slate-800'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentView === 'workspace'
                  ? 'bg-slate-900 text-cyan-300 border border-slate-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2.5">
        {currentView === 'workspace' && sessionId && (
          <button
            onClick={copySessionId}
            title="Click to copy Session ID"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-['JetBrains_Mono'] transition-colors"
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

        {isAuthenticated && (
          <>
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
          </>
        )}

        {!isAuthenticated ? (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-semibold border border-slate-950 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <img
                src={user?.avatarUrl}
                alt={user?.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-700"
              />
              <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-25 truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn text-xs">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <div className="font-semibold text-slate-200 truncate">{user?.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('workspace');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  <Layout className="w-4 h-4" />
                  <span>DSA Workspace</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onToggleSidebar();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-purple-300 transition-colors"
                >
                  <History className="w-4 h-4" />
                  <span>Session History</span>
                </button>

                <div className="border-t border-slate-800 my-1 pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      onNavigate('home');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
