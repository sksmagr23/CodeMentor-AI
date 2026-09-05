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
    <div className="panel-brutal p-5 my-3 text-ink">
      <div className="flex items-center justify-between border-b-2 border-accent pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="border-2 border-accent bg-accent-soft text-accent-bright p-2 shadow-hard-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg text-ink">{renderSafeText(title)}</h3>
            <span className="text-xs font-mono text-accent-bright">{renderSafeText(pattern)}</span>
          </div>
        </div>
        {expected_complexity && (
          <span className="border-2 border-accent px-2 py-1 text-xs font-medium font-mono bg-accent-soft text-accent-bright">
            {renderSafeText(expected_complexity)}
          </span>
        )}
      </div>

      <p className="text-sm text-ink mb-4 leading-relaxed">{renderSafeText(statement)}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
        <div className="p-3 border-2 border-accent bg-paper shadow-hard-sm">
          <div className="flex items-center gap-1.5 font-medium text-muted mb-1">
            <Target className="w-3.5 h-3.5 text-accent-bright" />
            <span>Objective</span>
          </div>
          <p className="text-ink">{renderSafeText(objective)}</p>
          {inputs && inputs.length > 0 && (
            <div className="mt-2 text-[11px] text-muted font-mono">
              Inputs: {inputs.map(renderSafeText).join(', ')}
            </div>
          )}
        </div>

        <div className="p-3 border-2 border-accent bg-paper shadow-hard-sm">
          <div className="flex items-center gap-1.5 font-medium text-muted mb-1">
            <Layers className="w-3.5 h-3.5 text-accent-bright" />
            <span>Expected Output</span>
          </div>
          <p className="text-ink font-mono">{renderSafeText(outputs)}</p>
        </div>
      </div>

      {constraints && constraints.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Constraints</h4>
          <div className="flex flex-wrap gap-1.5">
            {constraints.map((c, i) => (
              <span key={i} className="border-2 border-accent px-2 py-1 text-xs font-medium font-mono bg-paper-elevated text-ink">
                {renderSafeText(c)}
              </span>
            ))}
          </div>
        </div>
      )}

      {edge_cases && edge_cases.length > 0 && (
        <div>
          <div className="flex items-center gap-1 text-xs font-semibold text-warn uppercase tracking-wider mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Critical Edge Cases</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {edge_cases.map((ec, i) => (
              <span key={i} className="border-2 border-accent px-2 py-1 text-xs font-medium bg-paper text-warn">
                {renderSafeText(ec)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
