import React from 'react';
import type { ProblemSummaryData } from '../../types/dsa';
import { BookOpen, Target, AlertCircle, Layers } from 'lucide-react';
import { renderSafeText } from '../../utils/safeText';

export const ProblemSummaryCard: React.FC<ProblemSummaryData> = ({
  title,
  statement,
  objective,
  inputs,
  outputs,
  constraints,
  edge_cases,
  pattern,
  expected_complexity,
}) => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg my-3 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-slate-100">{renderSafeText(title)}</h3>
            <span className="text-xs font-['JetBrains_Mono'] text-cyan-400">{renderSafeText(pattern)}</span>
          </div>
        </div>
        {expected_complexity && (
          <span className="px-2.5 py-1 text-xs font-['JetBrains_Mono'] rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
            {renderSafeText(expected_complexity)}
          </span>
        )}
      </div>

      <p className="text-sm text-slate-300 mb-4 leading-relaxed">{renderSafeText(statement)}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 font-medium text-slate-400 mb-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" />
            <span>Objective</span>
          </div>
          <p className="text-slate-200">{renderSafeText(objective)}</p>
          {inputs && inputs.length > 0 && (
            <div className="mt-2 text-[11px] text-slate-400 font-['JetBrains_Mono']">
              Inputs: {inputs.map(renderSafeText).join(', ')}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1.5 font-medium text-slate-400 mb-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Expected Output</span>
          </div>
          <p className="text-slate-200 font-['JetBrains_Mono']">{renderSafeText(outputs)}</p>
        </div>
      </div>

      {constraints && constraints.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Constraints</h4>
          <div className="flex flex-wrap gap-1.5">
            {constraints.map((c, i) => (
              <span key={i} className="px-2 py-0.5 text-xs font-['JetBrains_Mono'] rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                {renderSafeText(c)}
              </span>
            ))}
          </div>
        </div>
      )}

      {edge_cases && edge_cases.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Critical Edge Cases</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {edge_cases.map((ec, i) => (
              <span key={i} className="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {renderSafeText(ec)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
