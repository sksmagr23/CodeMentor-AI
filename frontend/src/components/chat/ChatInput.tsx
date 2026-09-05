import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  hasProblemContext: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  hasProblemContext,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const chips = [
    { label: 'Explain Approach', prompt: 'Explain my approach' },
    { label: 'Why is it wrong?', prompt: 'Why is my solution wrong?' },
    { label: 'Show Dry Run', prompt: 'Show me the dry run' },
    { label: 'Show Optimal', prompt: 'Show optimal approach' },
  ];

  return (
    <div className="border-t-2 border-accent bg-paper-elevated p-3 sm:p-4">
      {hasProblemContext && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[11px]">
          <span className="text-muted flex items-center gap-1 pl-1 shrink-0 font-medium">
            <Sparkles className="w-3 h-3 text-accent-bright" strokeWidth={2.25} /> Ask
          </span>
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onSend(chip.prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 border-2 border-accent bg-paper hover:bg-accent-soft text-ink whitespace-nowrap transition-colors disabled:opacity-40 shadow-hard-sm"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about DSA, request analysis, or paste your solution…"
          rows={1}
          disabled={isLoading}
          className="input-brutal w-full resize-none pl-4 pr-4 py-3 text-sm max-h-32 font-sans leading-relaxed"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-brutal btn-brutal-blue shrink-0 p-3 disabled:opacity-30"
          aria-label="Send"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Send className="w-4 h-4" strokeWidth={2.5} />
          )}
        </button>
      </form>
    </div>
  );
};
