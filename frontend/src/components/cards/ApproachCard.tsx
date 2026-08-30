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
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Correct & Optimal
          </span>
        );
      case 'correct_but_suboptimal':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Correct but Suboptimal
          </span>
        );
      case 'correct_idea_buggy_implementation':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Right Idea, Buggy Implementation
          </span>
        );
      case 'incorrect_approach':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/30">
            <XCircle className="w-3.5 h-3.5" /> Incorrect Approach
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <HelpCircle className="w-3.5 h-3.5" /> Conceptual Analysis
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg my-3 text-slate-200">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-slate-100">{renderSafeText(algorithm)}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {data_structures?.map((ds, i) => (
                <span key={i} className="text-xs font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {renderSafeText(ds)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>{getClassificationBadge()}</div>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Algorithmic Logic</h4>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
          {renderSafeText(logic)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 font-['JetBrains_Mono']">
        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Time Complexity</span>
          </div>
          <div className="text-base font-semibold text-amber-300">{renderSafeText(time_complexity)}</div>
          {time_complexity_reasoning && (
            <div className="text-xs text-slate-400 mt-1 font-sans">{renderSafeText(time_complexity_reasoning)}</div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>Space Complexity</span>
          </div>
          <div className="text-base font-semibold text-cyan-300">{renderSafeText(space_complexity)}</div>
          {space_complexity_reasoning && (
            <div className="text-xs text-slate-400 mt-1 font-sans">{renderSafeText(space_complexity_reasoning)}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {strengths && strengths.length > 0 && (
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
            <div className="font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Strengths
            </div>
            <ul className="space-y-1 text-slate-300">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500">•</span>
                  <span>{renderSafeText(s)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {weaknesses && weaknesses.length > 0 && (
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/20">
            <div className="font-semibold text-red-400 mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Limitations / Weaknesses
            </div>
            <ul className="space-y-1 text-slate-300">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-red-400">•</span>
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
