import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Code2 } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  title?: string;
  className?: string;
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
}) => {
  const [copied, setCopied] = useState(false);

  const monacoLang = MONACO_LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase() || 'cpp';

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg flex flex-col ${className}`}
    >
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-['JetBrains_Mono'] font-medium text-slate-300">
            {title || `Snippet (${monacoLang.toUpperCase()})`}
          </span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-['JetBrains_Mono'] text-cyan-400 uppercase">
            {monacoLang}
          </span>
        </div>

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
            padding: { top: 10, bottom: 10 },
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
  );
};
