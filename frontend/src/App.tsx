import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { useChatSession } from './hooks/useChatSession';
import { Header } from './components/workspace/Header';
import { WorkspacePanel } from './components/workspace/WorkspacePanel';
import { SessionSidebar } from './components/workspace/SessionSidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import { ChatInput } from './components/chat/ChatInput';
import { HomePage } from './components/home/HomePage';
import { GoogleAuthModal } from './components/auth/GoogleAuthModal';

export const App: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const toast = useToast();
  const {
    sessionId,
    sessionContext,
    messages,
    isLoading,
    error,
    sendMessage,
    saveProblemContext,
    startNewSession,
    loadSession,
  } = useChatSession();

  const [currentView, setCurrentView] = useState<'home' | 'workspace'>('home');
  const [viewKey, setViewKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem('codementor_split_ratio');
    return saved ? Math.min(Math.max(parseFloat(saved), 25), 75) : 58;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const switchView = (view: 'home' | 'workspace') => {
    setCurrentView(view);
    setViewKey((k) => k + 1);
  };

  const handleNavigate = (view: 'home' | 'workspace') => {
    if (view === 'workspace' && !isAuthenticated) {
      openAuthModal();
      return;
    }
    switchView(view);
  };

  const handleLaunchWorkspace = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    switchView('workspace');
    toast.info('Workspace ready', 'Drop a problem on the right and start chatting.');
  };

  const handleStartNewSession = async () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    await startNewSession();
    switchView('workspace');
    toast.success('New session', 'Fresh context — paste a problem to begin.');
  };

  const handleSelectSessionFromHistory = (sid: string) => {
    loadSession(sid);
    setIsSidebarOpen(false);
    switchView('workspace');
    toast.info('Session restored', 'Picking up where you left off.');
  };

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - rect.left) / rect.width) * 100;
      const clampedWidth = Math.min(Math.max(newLeftWidth, 25), 75);
      setLeftWidth(clampedWidth);
      localStorage.setItem('codementor_split_ratio', clampedWidth.toString());
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col h-screen w-screen bg-graph text-ink font-sans overflow-hidden">
      <Header
        sessionId={sessionId}
        currentView={currentView}
        onNavigate={handleNavigate}
        onNewSession={handleStartNewSession}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />

      {currentView === 'home' ? (
        <div key={`home-${viewKey}`} className="flex-1 overflow-hidden animate-view-enter">
          <HomePage
            onLaunchWorkspace={handleLaunchWorkspace}
            onStartNewSession={handleStartNewSession}
            onOpenHistory={() => setIsSidebarOpen(true)}
            onSelectSession={handleSelectSessionFromHistory}
          />
        </div>
      ) : (
        <div
          key={`ws-${viewKey}`}
          ref={containerRef}
          className="flex flex-col md:flex-row flex-1 overflow-hidden relative animate-view-enter"
        >
          <main
            className="flex flex-col bg-paper/80 relative overflow-hidden h-full border-r-0 md:border-r-2 border-accent"
            style={{ width: window.innerWidth >= 768 ? `${leftWidth}%` : '100%' }}
          >
            {error && (
              <div className="bg-danger text-white border-b-2 border-accent px-4 py-2 text-xs flex items-center justify-between font-medium">
                <span>{error}</span>
              </div>
            )}

            <ChatContainer
              messages={messages}
              isLoading={isLoading}
              onActionClick={(actionPrompt) => sendMessage(actionPrompt)}
            />

            <ChatInput
              onSend={sendMessage}
              isLoading={isLoading}
              hasProblemContext={Boolean(sessionContext?.problem)}
            />
          </main>

          <div
            onMouseDown={() => setIsDragging(true)}
            className={`hidden md:flex items-center justify-center w-2 bg-paper hover:bg-accent cursor-col-resize transition-colors shrink-0 select-none z-20 border-x-2 border-accent group ${
              isDragging ? 'bg-accent' : ''
            }`}
            title="Drag to resize panels"
          >
            <div className={`w-0.5 h-10 bg-ink group-hover:bg-paper-elevated transition-colors ${isDragging ? 'bg-paper-elevated' : ''}`} />
          </div>

          <div
            className="flex flex-col h-full overflow-hidden shrink-0"
            style={{ width: window.innerWidth >= 768 ? `${100 - leftWidth}%` : '100%' }}
          >
            <WorkspacePanel
              sessionContext={sessionContext}
              onSaveContext={saveProblemContext}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      <SessionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentSessionId={sessionId}
        onSelectSession={handleSelectSessionFromHistory}
      />
      <GoogleAuthModal />
    </div>
  );
};

export default App;
