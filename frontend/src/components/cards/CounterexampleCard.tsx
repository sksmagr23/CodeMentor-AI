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
    <div className="panel-brutal p-5 my-3 text-ink">
      <div className="flex items-center gap-2 border-b-2 border-accent pb-3 mb-4">
        <div className="border-2 border-accent bg-accent-soft text-warn p-2 shadow-hard-sm">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display text-lg text-ink">Failing Counterexample</h3>
          <span className="text-xs text-muted">Input case demonstrating the algorithmic discrepancy</span>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        <div>
          <div className="text-muted font-sans mb-1 text-xs">Input:</div>
          <div className="p-2.5 border-2 border-accent bg-paper text-warn shadow-hard-sm">
            {input}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm">
            <div className="flex items-center gap-1.5 text-danger font-sans font-medium mb-1">
              <XCircle className="w-3.5 h-3.5" /> Your Code's Output:
            </div>
            <div className="text-danger font-bold">{actual_output}</div>
          </div>

          <div className="p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm">
            <div className="flex items-center gap-1.5 text-success font-sans font-medium mb-1">
              <CheckCircle className="w-3.5 h-3.5" /> Expected Correct Output:
            </div>
            <div className="text-success font-bold">{expected_output}</div>
          </div>
        </div>

        <div className="p-3 border-2 border-accent bg-paper shadow-hard-sm font-sans">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Why it Fails:</div>
          <p className="text-sm text-ink leading-relaxed">{reason}</p>
        </div>
      </div>
    </div>
  );
};
