import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/dsa';
import { renderStructuredData } from '../../registry/componentRegistry';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { ActionChips } from './ActionChips';
import { User } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

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
    <div className={`flex gap-3 my-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 border-2 border-accent overflow-hidden shadow-hard-sm shrink-0 mt-0.5">
          <BrandLogo size={32} className="w-full h-full" />
        </div>
      )}

      <div className={`max-w-[88%] md:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 text-sm leading-relaxed border-2 shadow-hard-sm ${
            isUser
              ? 'bg-accent text-ink border-accent'
              : 'bg-paper-elevated text-ink border-accent'
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
            {renderStructuredData(message.structured_data, { isLoading })}
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
        <div className="w-8 h-8 border-2 border-accent bg-paper-elevated text-ink flex items-center justify-center shadow-hard-sm shrink-0 mt-0.5">
          <User className="w-4 h-4" strokeWidth={2.25} />
        </div>
      )}
    </div>
  );
};
