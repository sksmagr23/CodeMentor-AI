import React from 'react';
import type { SolutionComparisonData } from '../../types/dsa';
import { GitCompare, CheckCircle2 } from 'lucide-react';
import { renderSafeText } from '../../utils/safeText';

export const SolutionComparisonCard: React.FC<SolutionComparisonData> = ({
  user_approach,
  user_time,
  user_space,
  optimal_approach,
  optimal_time,
  optimal_space,
  key_differences,
  recommendation,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg my-3 text-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <GitCompare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-slate-100">Approach Comparison</h3>
          <span className="text-xs text-slate-400">Side-by-side trade-off evaluation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Your Approach
          </div>
          <div className="text-sm font-medium text-slate-200 mb-2">{renderSafeText(user_approach)}</div>
          <div className="flex gap-2 font-['JetBrains_Mono'] text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              Time: {renderSafeText(user_time)}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
              Space: {renderSafeText(user_space)}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            Optimal Approach
          </div>
          <div className="text-sm font-medium text-slate-100 mb-2">{renderSafeText(optimal_approach)}</div>
          <div className="flex gap-2 font-['JetBrains_Mono'] text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              Time: {renderSafeText(optimal_time)}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Space: {renderSafeText(optimal_space)}
            </span>
          </div>
        </div>
      </div>

      {key_differences && key_differences.length > 0 && (
        <div className="mb-3 text-xs">
          <div className="font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Key Differences:</div>
          <ul className="space-y-1 text-slate-300">
            {key_differences.map((diff, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-purple-400">•</span>
                <span>{renderSafeText(diff)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendation && (
        <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/20 text-xs">
          <div className="font-semibold text-purple-400 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Recommendation
          </div>
          <p className="text-slate-300 leading-relaxed">{renderSafeText(recommendation)}</p>
        </div>
      )}
    </div>
  );
};
