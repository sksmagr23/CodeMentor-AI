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
    <div className="panel-brutal p-5 my-3 text-ink">
      <div className="flex flex-wrap items-center justify-between border-b-2 border-accent pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="border-2 border-accent bg-accent-soft text-success p-2 shadow-hard-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg text-ink">
              Optimal Solution
            </h3>
            <span className="text-xs font-mono text-success">
              {renderSafeText(approach_name)}
            </span>
          </div>
        </div>

        {previous_complexity && (
          <div className="flex items-center gap-2 border-2 border-accent px-2 py-1 text-xs font-medium font-mono bg-paper shadow-hard-sm">
            <span className="text-muted">{renderSafeText(previous_complexity)}</span>
            <ArrowRight className="w-3 h-3 text-success" />
            <span className="text-success font-bold">{renderSafeText(time_complexity)}</span>
          </div>
        )}
      </div>

      <p className="text-xs sm:text-sm text-ink mb-4 leading-relaxed bg-paper p-3 border-2 border-accent shadow-hard-sm">
        {renderSafeText(explanation)}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4 font-mono text-xs">
        <div className="p-2.5 border-2 border-accent bg-paper shadow-hard-sm">
          <span className="text-muted block mb-0.5">Optimal Time:</span>
          <span className="text-sm font-bold text-success">
            {renderSafeText(time_complexity)}
          </span>
        </div>
        <div className="p-2.5 border-2 border-accent bg-paper shadow-hard-sm">
          <span className="text-muted block mb-0.5">Optimal Space:</span>
          <span className="text-sm font-bold text-accent-bright">
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
        <div className="p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm text-xs">
          <span className="font-semibold text-muted block mb-1">
            Trade-offs & Considerations:
          </span>
          <ul className="space-y-1 text-ink">
            {tradeoffs.map((t, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-success">•</span>
                <span>{renderSafeText(t)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
