import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Code2, Maximize2, X } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const monacoLang = MONACO_LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase() || 'cpp';

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
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

  return (
    <>
      <div
        className={`rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg flex flex-col ${className}`}
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs select-none">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-['JetBrains_Mono'] font-medium text-slate-300">
              {title || `Code (${monacoLang.toUpperCase()})`}
            </span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-['JetBrains_Mono'] text-cyan-400 uppercase">
              {monacoLang}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              type="button"
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
              title="Copy Code"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {allowFullscreen && (
              <button
                onClick={() => setIsFullscreen(true)}
                type="button"
                className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                title="View Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="w-full relative" style={{ height }}>
          <Editor
            height="100%"
            language={monacoLang}
            value={value}
            onChange={(val) => onChange && onChange(val || '')}
            theme="vs-dark"
            options={{
              readOnly,
              domReadOnly: readOnly,
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 8, bottom: 8 },
              overviewRulerBorder: false,
              renderLineHighlight: readOnly ? 'none' : 'line',
              contextmenu: !readOnly,
              tabSize: 4,
            }}
            loading={
              <div className="flex items-center justify-center h-full text-slate-500 text-xs font-['JetBrains_Mono']">
                Loading editor...
              </div>
            }
          />
        </div>
      </div>

      {/* FULLSCREEN POPUP MODAL */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-6xl h-[88vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 select-none">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-sm font-semibold text-slate-100">
                    {title || 'Full Code View'}
                  </h3>
                  <span className="text-[11px] font-['JetBrains_Mono'] text-cyan-400 uppercase">
                    {monacoLang} {readOnly ? '• Read-Only' : '• Editable'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  type="button"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700"
                  title="Close (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Editor Body */}
            <div className="flex-1 w-full relative bg-slate-950">
              <Editor
                height="100%"
                language={monacoLang}
                value={value}
                onChange={(val) => onChange && onChange(val || '')}
                theme="vs-dark"
                options={{
                  readOnly,
                  domReadOnly: readOnly,
                  minimap: { enabled: true },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                  overviewRulerBorder: false,
                  renderLineHighlight: readOnly ? 'none' : 'line',
                  contextmenu: !readOnly,
                  tabSize: 4,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
