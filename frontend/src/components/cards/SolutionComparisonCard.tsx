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
    <div className="panel-brutal p-5 my-3 text-ink">
      <div className="flex items-center gap-2 border-b-2 border-accent pb-3 mb-4">
        <div className="border-2 border-accent bg-accent-soft text-accent-bright p-2 shadow-hard-sm">
          <GitCompare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-display text-lg text-ink">Approach Comparison</h3>
          <span className="text-xs text-muted">Side-by-side trade-off evaluation</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3.5 border-2 border-accent bg-paper shadow-hard-sm">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Your Approach
          </div>
          <div className="text-sm font-medium text-ink mb-2">{renderSafeText(user_approach)}</div>
          <div className="flex gap-2 font-mono text-xs flex-wrap">
            <span className="border-2 border-accent px-2 py-1 font-medium bg-paper-elevated text-warn">
              Time: {renderSafeText(user_time)}
            </span>
            <span className="border-2 border-accent px-2 py-1 font-medium bg-paper-elevated text-accent-bright">
              Space: {renderSafeText(user_space)}
            </span>
          </div>
        </div>

        <div className="p-3.5 border-2 border-accent bg-accent-soft shadow-hard-sm">
          <div className="text-xs font-semibold text-success uppercase tracking-wider mb-2">
            Optimal Approach
          </div>
          <div className="text-sm font-medium text-ink mb-2">{renderSafeText(optimal_approach)}</div>
          <div className="flex gap-2 font-mono text-xs flex-wrap">
            <span className="border-2 border-accent px-2 py-1 font-medium bg-paper-elevated text-success font-bold">
              Time: {renderSafeText(optimal_time)}
            </span>
            <span className="border-2 border-accent px-2 py-1 font-medium bg-paper-elevated text-accent-bright">
              Space: {renderSafeText(optimal_space)}
            </span>
          </div>
        </div>
      </div>

      {key_differences && key_differences.length > 0 && (
        <div className="mb-3 text-xs">
          <div className="font-semibold text-muted uppercase tracking-wider mb-1.5">Key Differences:</div>
          <ul className="space-y-1 text-ink">
            {key_differences.map((diff, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-accent-bright">•</span>
                <span>{renderSafeText(diff)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendation && (
        <div className="p-3 border-2 border-accent bg-accent-soft shadow-hard-sm text-xs">
          <div className="font-semibold text-accent-bright mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Recommendation
          </div>
          <p className="text-ink leading-relaxed">{renderSafeText(recommendation)}</p>
        </div>
      )}
    </div>
  );
};
