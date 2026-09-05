import React, { useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/dsa';
import { ChatMessage } from './ChatMessage';
import { Sparkles, Code2, HelpCircle } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface ChatContainerProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onActionClick: (actionPrompt: string) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  isLoading,
  onActionClick,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 bg-graph-fine">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto animate-view-enter">
          <div className="w-16 h-16 border-2 border-accent overflow-hidden shadow-hard mb-5">
            <BrandLogo size={64} className="w-full h-full" />
          </div>

          <h2 className="font-display text-3xl text-ink mb-2">
            CodeMentor <span className="text-accent-bright italic">AI</span>
          </h2>
          <p className="text-muted text-sm max-w-md mb-8 leading-relaxed">
            Ask questions, analyze approaches, debug edge cases, and request dry runs.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 max-w-lg">
            <button
              onClick={() => onActionClick('I want to analyze my solution for a DSA problem')}
              className="btn-brutal btn-brutal-blue flex items-center gap-2 px-4 py-2.5 text-xs"
            >
              <Code2 className="w-4 h-4" strokeWidth={2.25} />
              <span>Analyze My Solution</span>
            </button>

            <button
              onClick={() => onActionClick('Can you explain a DSA problem?')}
              className="btn-brutal btn-brutal-white flex items-center gap-2 px-4 py-2.5 text-xs"
            >
              <Sparkles className="w-4 h-4 text-warn" strokeWidth={2.25} />
              <span>Explain a Problem</span>
            </button>

            <button
              onClick={() => onActionClick('What is dynamic programming and when do we use it?')}
              className="btn-brutal btn-brutal-white flex items-center gap-2 px-4 py-2.5 text-xs"
            >
              <HelpCircle className="w-4 h-4 text-accent-bright" strokeWidth={2.25} />
              <span>Ask a Question</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              message={msg}
              isLatest={idx === messages.length - 1}
              onActionClick={onActionClick}
              isLoading={isLoading}
            />
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 my-4 animate-fade-in">
              <div className="w-8 h-8 border-2 border-accent overflow-hidden shadow-hard-sm shrink-0">
                <BrandLogo size={32} className="w-full h-full" />
              </div>
              <div className="flex items-center gap-1.5 p-3 border-2 border-accent bg-paper-elevated text-muted text-xs shadow-hard-sm">
                <div className="w-2 h-2 bg-accent animate-bounce-dot" />
                <div className="w-2 h-2 bg-accent animate-bounce-dot [animation-delay:0.15s]" />
                <div className="w-2 h-2 bg-accent animate-bounce-dot [animation-delay:0.3s]" />
                <span className="ml-1.5 font-mono">Reasoning…</span>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
