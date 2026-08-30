import React from 'react';
import type { NextAction } from '../../types/dsa';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ActionChipsProps {
  actions: NextAction[];
  onActionClick: (actionPrompt: string) => void;
  disabled?: boolean;
}

export const ActionChips: React.FC<ActionChipsProps> = ({
  actions,
  onActionClick,
  disabled = false,
}) => {
  if (!actions || actions.length === 0) return null;

  const seenLabels = new Set<string>();
  const uniqueActions = actions.filter((act) => {
    const key = act.label.trim().toLowerCase();
    if (seenLabels.has(key)) return false;
    seenLabels.add(key);
    return true;
  });

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-2">
      {uniqueActions.map((action, idx) => (
        <button
          key={idx}
          onClick={() => onActionClick(action.action_prompt)}
          disabled={disabled}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 hover:text-white border border-cyan-500/20 hover:border-cyan-500/40 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <Sparkles className="w-3 h-3 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>{action.label}</span>
          <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </button>
      ))}
    </div>
  );
};
