import React from 'react';
import type { BugAnalysisData } from '../../types/dsa';
import { Bug, AlertOctagon, Wrench } from 'lucide-react';
import { CodeEditor } from '../common/CodeEditor';
import { renderSafeText } from '../../utils/safeText';

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
  const lineCount = (corrected_code || '').split('\n').length;
  const height = Math.min(Math.max(lineCount * 21 + 45, 130), 320);

  return (
    <div className="panel-brutal p-5 my-3 text-ink">
      <div className="flex items-center gap-2.5 border-b-2 border-accent pb-3 mb-4">
        <div className="border-2 border-accent bg-accent-soft text-danger p-2 shadow-hard-sm">
          <Bug className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display text-lg text-ink">
            Bug & Failure Analysis
          </h3>
          <span className="text-xs text-danger">{renderSafeText(issue)}</span>
        </div>
      </div>

      <div className="space-y-3.5 text-xs sm:text-sm">
        <div className="p-3 border-2 border-accent bg-paper shadow-hard-sm">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            <AlertOctagon className="w-3.5 h-3.5 text-danger" />
            <span>Why the Solution Fails</span>
          </div>
          <p className="text-ink leading-relaxed">{renderSafeText(why_it_fails)}</p>
          {failing_condition && (
            <div className="mt-2 text-xs font-mono text-warn bg-paper p-2 border-2 border-accent">
              Condition: {renderSafeText(failing_condition)}
            </div>
          )}
        </div>

        <div>
          <span className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">
            Failing Test Case (Counterexample)
          </span>
          <div className="p-2.5 border-2 border-accent bg-paper font-mono text-xs text-warn mb-2 shadow-hard-sm">
            Input: {renderSafeText(counterexample)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 border-2 border-accent bg-paper-elevated text-danger shadow-hard-sm">
              <span className="text-danger font-sans block text-[11px] font-semibold">Actual Code Output:</span>
              {renderSafeText(actual_output)}
            </div>
            <div className="p-2 border-2 border-accent bg-paper-elevated text-success shadow-hard-sm">
              <span className="text-success font-sans block text-[11px] font-semibold">Expected Output:</span>
              {renderSafeText(expected_output)}
            </div>
          </div>
        </div>

        <div className="p-3 border-2 border-accent bg-accent-soft shadow-hard-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-success mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>How to Fix</span>
          </div>
          <p className="text-ink text-xs leading-relaxed">{renderSafeText(fix)}</p>
        </div>

        {corrected_code && (
          <div className="pt-1">
            <CodeEditor
              value={corrected_code}
              language={language}
              readOnly={true}
              height={`${height}px`}
              title="Corrected Implementation"
            />
          </div>
        )}
      </div>
    </div>
  );
};
