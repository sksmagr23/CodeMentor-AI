import React, { useState } from 'react';
import { useChatSession } from './hooks/useChatSession';
import { Header } from './components/workspace/Header';
import { WorkspacePanel } from './components/workspace/WorkspacePanel';
import { SessionSidebar } from './components/workspace/SessionSidebar';
import { ChatContainer } from './components/chat/ChatContainer';
import { ChatInput } from './components/chat/ChatInput';

const App: React.FC = () => {
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

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F17] text-slate-100 font-sans overflow-hidden antialiased select-none">
      <Header
        sessionId={sessionId}
        onNewSession={startNewSession}
        onToggleSidebar={() => setIsSidebarOpen(true)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <main className="flex flex-col flex-1 bg-slate-950/40 relative overflow-hidden">
          {error && (
            <div className="bg-red-950/80 border-b border-red-500/30 px-4 py-2 text-xs text-red-300 flex items-center justify-between">
              <span>{error}</span>
            </div>
          )}

          <ChatContainer
            messages={messages}
            isLoading={isLoading}
            onActionClick={(actionPrompt) => sendMessage(actionPrompt)}
            onSetupSubmit={saveProblemContext}
          />

          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            hasProblemContext={Boolean(sessionContext?.problem)}
          />
        </main>

        <WorkspacePanel
          sessionContext={sessionContext}
          onSaveContext={saveProblemContext}
          isLoading={isLoading}
        />
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
