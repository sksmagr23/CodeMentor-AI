import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { CodeEditor } from './CodeEditor';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
}) => {
  return (
    <div className={`markdown-content space-y-2 text-ink text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-display text-ink mt-3 mb-1.5 border-b-2 border-accent pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-accent-bright font-display mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-accent-bright">{children}</strong>
          ),
          em: ({ children }) => <em className="text-muted italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 pl-1 text-ink">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 pl-1 text-ink">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent bg-accent-soft pl-3 py-1 my-2 text-ink">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border-2 border-accent">
              <table className="min-w-full divide-y-2 divide-ink text-xs text-ink">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 bg-accent-soft font-semibold text-left text-ink border-b-2 border-accent">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-accent/20">{children}</td>
          ),
          hr: () => <hr className="border-accent border-t-2 my-3" />,
          code({ className: codeClass, children, ...props }) {
            const match = /language-(\w+)/.exec(codeClass || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !match && !codeString.includes('\n');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 bg-accent-soft text-accent-bright font-mono text-[11px] border border-accent"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            const lang = match ? match[1] : 'cpp';
            const lineCount = codeString.split('\n').length;
            const calculatedHeight = Math.min(Math.max(lineCount * 21 + 45, 120), 380);

            return (
              <div className="my-3">
                <CodeEditor
                  value={codeString}
                  language={lang}
                  readOnly={true}
                  height={`${calculatedHeight}px`}
                  title={`Code (${lang.toUpperCase()})`}
                />
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
