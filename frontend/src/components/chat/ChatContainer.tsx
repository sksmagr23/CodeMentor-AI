import React, { useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/dsa';
import { ChatMessage } from './ChatMessage';
import { Sparkles, Terminal, Code2, HelpCircle } from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-600/20 mb-4">
            <Terminal className="w-7 h-7" />
          </div>

          <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-slate-100 mb-1">
            CodeMentor AI
          </h2>
          <p className="text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
            Your conversational DSA mentor. Ask questions, analyze algorithmic approaches, debug edge cases, and view on-demand dry runs.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 max-w-lg">
            <button
              onClick={() => onActionClick("I want to analyze my solution for a DSA problem")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all shadow-md hover:border-cyan-500/60"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Analyze My Solution</span>
            </button>

            <button
              onClick={() => onActionClick("Can you explain a DSA problem?")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all shadow-md hover:border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explain a DSA Problem</span>
            </button>

            <button
              onClick={() => onActionClick("What is dynamic programming and when do we use it?")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-all shadow-md hover:border-slate-700"
            >
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Ask a DSA Question</span>
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
            <div className="flex items-center gap-3 my-4">
              <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md animate-pulse">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-slate-400 font-['JetBrains_Mono']">Reasoning...</span>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={bottomRef} />
    </div>
  );
};
