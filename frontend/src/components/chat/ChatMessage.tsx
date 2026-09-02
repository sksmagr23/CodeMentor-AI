import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/dsa';
import { renderStructuredData } from '../../registry/componentRegistry';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { ActionChips } from './ActionChips';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  isLatest: boolean;
  onActionClick: (actionPrompt: string) => void;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onActionClick,
  isLoading,
}) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shrink-0 mt-0.5">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[88%] md:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
              : 'bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-tl-sm shadow-md'
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap font-sans">{message.content}</div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {!isUser && message.structured_data && (
          <div className="w-full">
            {renderStructuredData(message.structured_data, {
              isLoading,
            })}
          </div>
        )}

        {!isUser && message.next_actions && message.next_actions.length > 0 && (
          <ActionChips
            actions={message.next_actions}
            onActionClick={onActionClick}
            disabled={isLoading}
          />
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-md shrink-0 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
