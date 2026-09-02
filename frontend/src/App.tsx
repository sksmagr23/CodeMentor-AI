import React, { useState, useEffect, useRef } from 'react';
import { useChatSession } from './hooks/useChatSession';
import { Header } from './components/workspace/Header';
import { WorkspacePanel } from './components/workspace/WorkspacePanel';
import { SessionSidebar } from './components/workspace/SessionSidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import { ChatInput } from './components/chat/ChatInput';

export const App: React.FC = () => {
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem('codementor_split_ratio');
    return saved ? Math.min(Math.max(parseFloat(saved), 25), 75) : 58;
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
      if (isDragging) {
        setIsDragging(false);
      }
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
    <div className="flex flex-col h-screen w-screen bg-[#0B0F17] text-slate-100 font-sans overflow-hidden antialiased">
      <Header
        sessionId={sessionId}
        onNewSession={startNewSession}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />

      <div ref={containerRef} className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        <main
          className="flex flex-col bg-slate-950/40 relative overflow-hidden h-full"
          style={{ width: window.innerWidth >= 768 ? `${leftWidth}%` : '100%' }}
        >
          {error && (
            <div className="bg-red-950/80 border-b border-red-500/30 px-4 py-2 text-xs text-red-300 flex items-center justify-between">
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
          className={`hidden md:flex items-center justify-center w-1.5 hover:w-2 bg-slate-850 hover:bg-cyan-500/50 cursor-col-resize transition-all shrink-0 select-none z-20 group ${
            isDragging ? 'bg-cyan-500 w-2 ring-2 ring-cyan-500/30' : ''
          }`}
          title="Drag to resize panels"
        >
          <div className="w-0.5 h-8 rounded-full bg-slate-600 group-hover:bg-cyan-300 transition-colors" />
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

      <SessionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentSessionId={sessionId}
        onSelectSession={loadSession}
      />
    </div>
  );
};

export default App;
