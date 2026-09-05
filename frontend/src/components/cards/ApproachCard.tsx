import React from 'react';
import type { ApproachCardData } from '../../types/dsa';
import { Cpu, CheckCircle2, AlertTriangle, XCircle, Clock, HardDrive, Check, HelpCircle } from 'lucide-react';
import { renderSafeText } from '../../utils/safeText';

export const ApproachCard: React.FC<ApproachCardData> = ({
  algorithm,
  logic,
  data_structures,
  correctness_classification,
  strengths,
  weaknesses,
  time_complexity,
  space_complexity,
  time_complexity_reasoning,
  space_complexity_reasoning,
}) => {
  const getClassificationBadge = () => {
    switch (correctness_classification) {
      case 'correct_and_optimal':
        return (
          <span className="flex items-center gap-1 border-2 border-accent px-2 py-1 text-xs font-medium bg-accent-soft text-success">
            <CheckCircle2 className="w-3.5 h-3.5" /> Correct & Optimal
          </span>
        );
      case 'correct_but_suboptimal':
        return (
          <span className="flex items-center gap-1 border-2 border-accent px-2 py-1 text-xs font-medium bg-paper text-warn">
            <AlertTriangle className="w-3.5 h-3.5" /> Correct but Suboptimal
          </span>
        );
      case 'correct_idea_buggy_implementation':
        return (
          <span className="flex items-center gap-1 border-2 border-accent px-2 py-1 text-xs font-medium bg-paper text-warn">
            <AlertTriangle className="w-3.5 h-3.5" /> Right Idea, Buggy Implementation
          </span>
        );
      case 'incorrect_approach':
        return (
          <span className="flex items-center gap-1 border-2 border-accent px-2 py-1 text-xs font-medium bg-paper text-danger">
            <XCircle className="w-3.5 h-3.5" /> Incorrect Approach
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 border-2 border-accent px-2 py-1 text-xs font-medium bg-paper-elevated text-muted">
            <HelpCircle className="w-3.5 h-3.5" /> Conceptual Analysis
          </span>
        );
    }
  };

  return (
    <div className="panel-brutal p-5 my-3 text-ink">
      <div className="flex flex-wrap items-center justify-between border-b-2 border-accent pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="border-2 border-accent bg-accent-soft text-accent-bright p-2 shadow-hard-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display text-lg text-ink">{renderSafeText(algorithm)}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {data_structures?.map((ds, i) => (
                <span key={i} className="text-xs font-mono border-2 border-accent px-2 py-1 font-medium bg-paper text-ink">
                  {renderSafeText(ds)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>{getClassificationBadge()}</div>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Algorithmic Logic</h4>
        <p className="text-sm text-ink leading-relaxed bg-paper p-3 border-2 border-accent shadow-hard-sm">
          {renderSafeText(logic)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 font-mono">
        <div className="p-3 border-2 border-accent bg-paper shadow-hard-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <Clock className="w-3.5 h-3.5 text-warn" />
            <span>Time Complexity</span>
          </div>
          <div className="text-base font-semibold text-warn">{renderSafeText(time_complexity)}</div>
          {time_complexity_reasoning && (
            <div className="text-xs text-muted mt-1 font-sans">{renderSafeText(time_complexity_reasoning)}</div>
          )}
        </div>

        <div className="p-3 border-2 border-accent bg-paper shadow-hard-sm">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <HardDrive className="w-3.5 h-3.5 text-accent-bright" />
            <span>Space Complexity</span>
          </div>
          <div className="text-base font-semibold text-accent-bright">{renderSafeText(space_complexity)}</div>
          {space_complexity_reasoning && (
            <div className="text-xs text-muted mt-1 font-sans">{renderSafeText(space_complexity_reasoning)}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {strengths && strengths.length > 0 && (
          <div className="p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm">
            <div className="font-semibold text-success mb-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Strengths
            </div>
            <ul className="space-y-1 text-ink">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-success">•</span>
                  <span>{renderSafeText(s)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses && weaknesses.length > 0 && (
          <div className="p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm">
            <div className="font-semibold text-danger mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Limitations / Weaknesses
            </div>
            <ul className="space-y-1 text-ink">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-danger">•</span>
                  <span>{renderSafeText(w)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
