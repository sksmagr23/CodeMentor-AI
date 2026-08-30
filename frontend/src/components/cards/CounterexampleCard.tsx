import React from 'react';
import type { CounterexampleData } from '../../types/dsa';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export const CounterexampleCard: React.FC<CounterexampleData> = ({
  input,
  expected_output,
  actual_output,
  reason,
}) => {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-5 shadow-lg my-3 text-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 mb-4">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-['Space_Grotesk'] text-base font-semibold text-amber-200">Failing Counterexample</h3>
          <span className="text-xs text-slate-400">Input case demonstrating the algorithmic discrepancy</span>
        </div>
      </div>

      <div className="space-y-3 font-['JetBrains_Mono'] text-xs">
        <div>
          <div className="text-slate-400 font-sans mb-1 text-xs">Input:</div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
            {input}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20">
            <div className="flex items-center gap-1.5 text-red-400 font-sans font-medium mb-1">
              <XCircle className="w-3.5 h-3.5" /> Your Code's Output:
            </div>
            <div className="text-red-300 font-bold">{actual_output}</div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
            <div className="flex items-center gap-1.5 text-emerald-400 font-sans font-medium mb-1">
              <CheckCircle className="w-3.5 h-3.5" /> Expected Correct Output:
            </div>
            <div className="text-emerald-300 font-bold">{expected_output}</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 font-sans">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Why it Fails:</div>
          <p className="text-sm text-slate-300 leading-relaxed">{reason}</p>
        </div>
      </div>
    </div>
  );
};
