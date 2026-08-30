import React, { useState } from 'react';
import type { CodeViewerData } from '../../types/dsa';
import { Code2, Copy, Check } from 'lucide-react';

export const CodeViewer: React.FC<CodeViewerData> = ({
  title = 'Code Implementation',
  code,
  language = 'cpp',
  explanation,
  time_complexity,
  space_complexity,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg my-3 text-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">{title}</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-['JetBrains_Mono'] text-[11px] uppercase">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {(time_complexity || space_complexity) && (
            <div className="flex items-center gap-2 text-[11px] font-['JetBrains_Mono'] text-slate-400">
              {time_complexity && <span>Time: <strong className="text-amber-300">{time_complexity}</strong></span>}
              {space_complexity && <span>Space: <strong className="text-cyan-300">{space_complexity}</strong></span>}
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <pre className="p-4 bg-slate-950 font-['JetBrains_Mono'] text-xs text-slate-200 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>

      {explanation && (
        <div className="px-4 py-3 bg-slate-900 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          {explanation}
        </div>
      )}
    </div>
  );
};
