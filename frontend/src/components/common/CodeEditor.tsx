import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Code2, Maximize2, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  title?: string;
  className?: string;
  allowFullscreen?: boolean;
}

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  cpp: 'cpp',
  'c++': 'cpp',
  python: 'python',
  py: 'python',
  java: 'java',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  go: 'go',
  rust: 'rust',
  rs: 'rust',
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'cpp',
  readOnly = false,
  height = '240px',
  title,
  className = '',
  allowFullscreen = true,
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const monacoLang = MONACO_LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase() || 'cpp';

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied', 'Code copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const editorOptions = {
    readOnly,
    domReadOnly: readOnly,
    minimap: { enabled: false as const },
    fontSize: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    lineNumbers: 'on' as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 8, bottom: 8 },
    overviewRulerBorder: false,
    renderLineHighlight: (readOnly ? 'none' : 'line') as 'none' | 'line',
    contextmenu: !readOnly,
    tabSize: 4,
  };

  return (
    <>
      <div className={`border-2 border-accent bg-paper-elevated overflow-hidden shadow-hard flex flex-col ${className}`}>
        <div className="flex items-center justify-between px-3 py-1.5 bg-paper border-b-2 border-accent text-xs select-none">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-accent-bright" strokeWidth={2.25} />
            <span className="font-mono font-medium text-ink">
              {title || `Code (${monacoLang.toUpperCase()})`}
            </span>
            <span className="px-1.5 py-0.5 border border-accent bg-accent-soft font-mono text-[10px] text-accent-bright uppercase">
              {monacoLang}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              type="button"
              className="flex items-center gap-1 text-[11px] text-muted hover:text-ink px-2 py-0.5 border border-transparent hover:border-accent hover:bg-paper-elevated transition-colors"
              title="Copy Code"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-success" strokeWidth={2.5} />
                  <span className="text-success">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" strokeWidth={2.25} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {allowFullscreen && (
              <button
                onClick={() => setIsFullscreen(true)}
                type="button"
                className="p-1 text-muted hover:text-accent-bright hover:bg-accent-soft border border-transparent hover:border-accent transition-colors"
                title="View Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={2.25} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full relative border-t-0" style={{ height }}>
          <Editor
            height="100%"
            language={monacoLang}
            value={value}
            onChange={(val) => onChange && onChange(val || '')}
            theme="vs-dark"
            options={editorOptions}
            loading={
              <div className="flex items-center justify-center h-full text-muted text-xs font-mono">
                Loading editor…
              </div>
            }
          />
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-ink/50 animate-fade-in">
          <div className="w-full max-w-6xl h-[88vh] flex flex-col border-2 border-accent bg-paper-elevated shadow-hard-lg overflow-hidden animate-pop-in">
            <div className="flex items-center justify-between px-4 py-3 bg-paper border-b-2 border-accent select-none">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 border-2 border-accent bg-accent-soft text-accent-bright">
                  <Code2 className="w-4 h-4" strokeWidth={2.25} />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink">
                    {title || 'Full Code View'}
                  </h3>
                  <span className="text-[11px] font-mono text-accent-bright uppercase">
                    {monacoLang} {readOnly ? '· Read-Only' : '· Editable'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  type="button"
                  className="btn-brutal btn-brutal-white flex items-center gap-1.5 px-3 py-1 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" strokeWidth={2.5} />
                      <span className="text-success font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" strokeWidth={2.25} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  type="button"
                  className="icon-btn w-8 h-8"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full relative bg-paper-elevated">
              <Editor
                height="100%"
                language={monacoLang}
                value={value}
                onChange={(val) => onChange && onChange(val || '')}
                theme="vs-dark"
                options={{
                  ...editorOptions,
                  minimap: { enabled: true },
                  fontSize: 13,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
