import React from 'react';
import type { BugAnalysisData } from '../../types/dsa';
import { Bug, AlertOctagon, Wrench, Code2 } from 'lucide-react';

export const BugAnalysisCard: React.FC<BugAnalysisData> = ({
  issue,
  why_it_fails,
  failing_condition,
  counterexample,
  expected_output,
  actual_output,
  fix,
  corrected_code,
  language = 'cpp',
}) => {
  return (
    <div className="rounded-xl border border-red-900/60 bg-slate-900/90 p-5 shadow-lg my-3 text-slate-200">
      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3 mb-4">
        <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
          <Bug className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-red-200">Bug & Failure Analysis</h3>
          <span className="text-xs text-red-400/90">{issue}</span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
            <span>Why the Solution Fails</span>
          </div>
          <p className="text-slate-300 leading-relaxed">{why_it_fails}</p>
          {failing_condition && (
            <div className="mt-2 text-xs font-['JetBrains_Mono'] text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
              Condition: {failing_condition}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 font-['JetBrains_Mono'] text-xs">
          <div className="text-slate-400 mb-2 font-sans font-medium">Failing Test Case:</div>
          <div className="bg-slate-900 p-2.5 rounded text-amber-300 mb-2 border border-slate-800">
            {counterexample}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-red-950/30 border border-red-500/20 text-red-300">
              <span className="text-red-400 font-sans block text-[11px]">Actual Output:</span>
              {actual_output}
            </div>
            <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
              <span className="text-emerald-400 font-sans block text-[11px]">Expected Output:</span>
              {expected_output}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>How to Fix</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">{fix}</p>
        </div>

        {corrected_code && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1 font-medium">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Corrected Implementation
              </span>
              <span className="font-['JetBrains_Mono'] text-slate-500 uppercase">{language}</span>
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-['JetBrains_Mono'] text-xs text-emerald-300 overflow-x-auto">
              <code>{corrected_code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
