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
    <div className={`markdown-content space-y-2 text-slate-200 text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-slate-100 font-['Space_Grotesk'] mt-3 mb-1.5 border-b border-slate-800 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold text-cyan-300 font-['Space_Grotesk'] mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-cyan-200">{children}</strong>
          ),
          em: ({ children }) => <em className="text-slate-300 italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 pl-1 text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 pl-1 text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-cyan-500/60 bg-cyan-950/20 pl-3 py-1 my-2 text-slate-300 rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-xs text-slate-300">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 bg-slate-900 font-semibold text-left text-slate-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-slate-800/60">{children}</td>
          ),
          hr: () => <hr className="border-slate-800 my-3" />,
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !match && !codeString.includes('\n');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-['JetBrains_Mono'] text-[11px] border border-slate-700/60"
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
