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
          className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-paper-elevated hover:bg-accent-soft text-ink border-2 border-accent shadow-hard-sm hover:shadow-hard hover:-translate-x-px hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-3 h-3 text-accent-bright group-hover:rotate-12 transition-transform" strokeWidth={2.25} />
          <span>{action.label}</span>
          <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
        </button>
      ))}
    </div>
  );
};
