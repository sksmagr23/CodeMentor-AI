import React from 'react';
import type { OptimizationData } from '../../types/dsa';
import { Sparkles, ArrowRight } from 'lucide-react';
import { CodeEditor } from '../common/CodeEditor';
import { renderSafeText } from '../../utils/safeText';

export const OptimizationCard: React.FC<OptimizationData> = ({
  approach_name,
  time_complexity,
  space_complexity,
  previous_complexity,
  explanation,
  optimal_code,
  language = 'cpp',
  tradeoffs,
}) => {
  const lineCount = (optimal_code || '').split('\n').length;
  const height = Math.min(Math.max(lineCount * 21 + 45, 140), 340);

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-slate-900/90 p-5 shadow-lg my-3 text-slate-200">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-emerald-200">
              Optimal Solution
            </h3>
            <span className="text-xs font-['JetBrains_Mono'] text-emerald-400">
              {renderSafeText(approach_name)}
            </span>
          </div>
        </div>

        {previous_complexity && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-['JetBrains_Mono']">
            <span className="text-slate-400">{renderSafeText(previous_complexity)}</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300 font-bold">{renderSafeText(time_complexity)}</span>
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
        {renderSafeText(explanation)}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4 font-['JetBrains_Mono'] text-xs">
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-slate-400 block mb-0.5">Optimal Time:</span>
          <span className="text-sm font-bold text-emerald-400">
            {renderSafeText(time_complexity)}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-slate-400 block mb-0.5">Optimal Space:</span>
          <span className="text-sm font-bold text-cyan-400">
            {renderSafeText(space_complexity)}
          </span>
        </div>
      </div>

      {optimal_code && (
        <div className="mb-4">
          <CodeEditor
            value={optimal_code}
            language={language}
            readOnly={true}
            height={`${height}px`}
            title="Optimal Implementation"
          />
        </div>
      )}

      {tradeoffs && tradeoffs.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 text-xs">
          <span className="font-semibold text-slate-400 block mb-1">
            Trade-offs & Considerations:
          </span>
          <ul className="space-y-1 text-slate-300">
            {tradeoffs.map((t, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-emerald-500">•</span>
                <span>{renderSafeText(t)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
