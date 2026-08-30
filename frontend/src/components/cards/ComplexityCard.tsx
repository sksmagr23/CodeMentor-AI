import React from 'react';
import type { ComplexityCardData } from '../../types/dsa';
import { Clock, HardDrive, Zap, Info } from 'lucide-react';
import { renderSafeText } from '../../utils/safeText';

export const ComplexityCard: React.FC<ComplexityCardData> = ({
  time_complexity,
  space_complexity,
  time_breakdown,
  space_breakdown,
  bottleneck,
  best_case,
  worst_case,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg my-3 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-slate-100">Complexity Derivation</h3>
            <span className="text-xs text-slate-400">Asymptotic analysis & bottleneck breakdown</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 font-['JetBrains_Mono']">
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Time Complexity</span>
          </div>
          <div className="text-xl font-bold text-amber-300">{renderSafeText(time_complexity)}</div>
          {worst_case && <span className="text-[10px] text-slate-500 block mt-0.5">Worst: {renderSafeText(worst_case)}</span>}
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Space Complexity</span>
          </div>
          <div className="text-xl font-bold text-cyan-300">{renderSafeText(space_complexity)}</div>
          {best_case && <span className="text-[10px] text-slate-500 block mt-0.5">Auxiliary: {renderSafeText(space_complexity)}</span>}
        </div>
      </div>

      {bottleneck && (
        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 mb-3 text-xs">
          <span className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
            <Info className="w-3.5 h-3.5" /> Primary Bottleneck:
          </span>
          <p className="text-slate-300">{renderSafeText(bottleneck)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {time_breakdown && time_breakdown.length > 0 && (
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="font-semibold text-slate-300 mb-1.5">Time Analysis Breakdown:</div>
            <ul className="space-y-1 text-slate-400">
              {time_breakdown.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-amber-400">•</span>
                  <span>{renderSafeText(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {space_breakdown && space_breakdown.length > 0 && (
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="font-semibold text-slate-300 mb-1.5">Memory & Auxiliary Space:</div>
            <ul className="space-y-1 text-slate-400">
              {space_breakdown.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-cyan-400">•</span>
                  <span>{renderSafeText(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
