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
    <div className="panel-brutal p-5 my-3 text-ink">
      <div className="flex items-center justify-between border-b-2 border-accent pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="border-2 border-accent bg-accent-soft text-accent-bright p-2 shadow-hard-sm">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg text-ink">Complexity Derivation</h3>
            <span className="text-xs text-muted">Asymptotic analysis & bottleneck breakdown</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
        <div className="p-3 border-2 border-accent bg-paper text-center shadow-hard-sm">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted mb-1">
            <Clock className="w-3.5 h-3.5 text-warn" />
            <span>Time Complexity</span>
          </div>
          <div className="text-xl font-bold text-warn">{renderSafeText(time_complexity)}</div>
          {worst_case && <span className="text-[10px] text-muted block mt-0.5">Worst: {renderSafeText(worst_case)}</span>}
        </div>

        <div className="p-3 border-2 border-accent bg-paper text-center shadow-hard-sm">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted mb-1">
            <HardDrive className="w-3.5 h-3.5 text-accent-bright" />
            <span>Space Complexity</span>
          </div>
          <div className="text-xl font-bold text-accent-bright">{renderSafeText(space_complexity)}</div>
          {best_case && <span className="text-[10px] text-muted block mt-0.5">Auxiliary: {renderSafeText(space_complexity)}</span>}
        </div>
      </div>

      {bottleneck && (
        <div className="p-3 border-2 border-accent bg-paper mb-3 text-xs shadow-hard-sm">
          <span className="font-semibold text-warn flex items-center gap-1 mb-1">
            <Info className="w-3.5 h-3.5" /> Primary Bottleneck:
          </span>
          <p className="text-ink">{renderSafeText(bottleneck)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {time_breakdown && time_breakdown.length > 0 && (
          <div className="p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm">
            <div className="font-semibold text-ink mb-1.5">Time Analysis Breakdown:</div>
            <ul className="space-y-1 text-muted">
              {time_breakdown.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-warn">•</span>
                  <span>{renderSafeText(item)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {space_breakdown && space_breakdown.length > 0 && (
          <div className="p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm">
            <div className="font-semibold text-ink mb-1.5">Memory & Auxiliary Space:</div>
            <ul className="space-y-1 text-muted">
              {space_breakdown.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1">
                  <span className="text-accent-bright">•</span>
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
