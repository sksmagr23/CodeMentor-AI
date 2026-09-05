import React, { useState, useRef, useEffect } from 'react';
import { Plus, History, Home, Layout, LogOut, ChevronDown, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BrandLogo } from '../common/BrandLogo';

interface HeaderProps {
  sessionId?: string | null;
  currentView: 'home' | 'workspace';
  onNavigate: (view: 'home' | 'workspace') => void;
  onNewSession: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onNewSession,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const toast = useToast();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className="h-12 sm:h-14 border-b-2 border-accent bg-paper-elevated px-3 sm:px-4 md:px-6 flex items-center justify-between shrink-0 z-30 select-none">
      <div className="flex items-center gap-3 sm:gap-5 min-w-0">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 sm:gap-3 text-left group min-w-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 border-accent overflow-hidden shadow-hard-sm group-hover:-translate-y-0.5 group-hover:shadow-hard transition-all shrink-0">
            <BrandLogo size={36} className="w-full h-full" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="font-display text-lg sm:text-xl text-ink tracking-tight leading-none truncate">
              CodeMentor <span className="text-accent-bright italic">AI</span>
            </h1>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1 pl-4 border-l-2 border-accent shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-2 transition-colors ${
              currentView === 'home'
                ? 'bg-accent text-ink border-accent shadow-hard-sm'
                : 'bg-paper-elevated text-muted border-transparent hover:border-accent hover:text-ink'
            }`}
          >
            <Home className="w-3.5 h-3.5" strokeWidth={2.25} />
            <span>Home</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => onNavigate('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-2 transition-colors ${
                currentView === 'workspace'
                  ? 'bg-accent text-ink border-accent shadow-hard-sm'
                  : 'bg-paper-elevated text-muted border-transparent hover:border-accent hover:text-ink'
              }`}
            >
              <Layout className="w-3.5 h-3.5" strokeWidth={2.25} />
              <span>Workspace</span>
            </button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated && (
          <>
            <button
              onClick={onNewSession}
              className="btn-brutal btn-brutal-blue flex items-center gap-1.5 px-3 py-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span className="hidden sm:inline">New</span>
            </button>

            <button
              onClick={onToggleSidebar}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-2 border-accent transition-all shadow-hard-sm ${
                isSidebarOpen
                  ? 'bg-accent text-paper'
                  : 'bg-paper-elevated text-ink hover:bg-accent-soft'
              }`}
              title="Past Sessions"
            >
              <History className="w-3.5 h-3.5" strokeWidth={2.25} />
              <span className="hidden md:inline">History</span>
            </button>
          </>
        )}

        {!isAuthenticated ? (
          <button
            onClick={openAuthModal}
            className="btn-brutal btn-brutal-yellow flex items-center gap-2 px-4 py-1.5 text-xs font-semibold"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 pl-2 border-2 border-accent bg-paper-elevated hover:bg-accent-soft transition-colors shadow-hard-sm"
            >
              <img
                src={user?.avatarUrl}
                alt={user?.name}
                className="w-6 h-6 object-cover border border-accent"
              />
              <span className="hidden sm:inline text-xs font-medium text-ink max-w-24 truncate">
                {user?.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted" strokeWidth={2.5} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 panel-brutal p-1.5 z-50 animate-pop-in text-xs">
                <div className="px-3 py-2 border-b-2 border-accent mb-1">
                  <div className="font-semibold text-ink truncate">{user?.name}</div>
                  <div className="text-[11px] text-muted truncate font-mono">{user?.email}</div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('workspace');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-ink hover:bg-accent-soft hover:text-accent-bright transition-colors"
                >
                  <Layout className="w-4 h-4" strokeWidth={2.25} />
                  <span>Workspace</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onToggleSidebar();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-ink hover:bg-accent-soft hover:text-accent-bright transition-colors"
                >
                  <History className="w-4 h-4" strokeWidth={2.25} />
                  <span>Session History</span>
                </button>

                <div className="border-t-2 border-accent my-1 pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                      onNavigate('home');
                      toast.info('Signed out', 'See you next session.');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-danger hover:bg-danger/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2.25} />
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
