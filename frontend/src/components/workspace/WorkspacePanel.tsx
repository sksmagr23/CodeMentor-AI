import React, { useState } from 'react';
import type { DSASessionContext } from '../../types/dsa';
import { Code2, Edit3, Layers } from 'lucide-react';

interface WorkspacePanelProps {
  sessionContext?: DSASessionContext | null;
  onOpenSetupForm: () => void;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  sessionContext,
  onOpenSetupForm,
}) => {
  const [activeTab, setActiveTab] = useState<'problem' | 'code'>('problem');

  const hasProblem = Boolean(sessionContext?.problem);
  const hasSolution = Boolean(sessionContext?.solution);

  if (!hasProblem && !hasSolution) {
    return (
      <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active DSA Context</span>
          </div>

          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-5 text-center my-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 text-cyan-400 mx-auto flex items-center justify-center mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-['Space_Grotesk'] text-sm font-semibold text-slate-200 mb-1">
              No Active Problem
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Set up a DSA problem and your solution code to enable automatic context, edge case debugging, and on-demand dry runs.
            </p>
            <button
              onClick={onOpenSetupForm}
              className="w-full py-2 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors"
            >
              Set Up Problem & Code
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-['JetBrains_Mono']">
          CodeMentor AI • Persistent Session
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/70 flex flex-col shrink-0 max-h-[40vh] md:max-h-full overflow-hidden">
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-200 uppercase tracking-wider">
            Active Context
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-['JetBrains_Mono'] text-cyan-400 uppercase">
            {sessionContext?.language || 'cpp'}
          </span>
        </div>

        <button
          onClick={onOpenSetupForm}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 text-cyan-300 text-xs border border-slate-800 transition-colors"
          title="Edit Problem or Code"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit</span>
        </button>
      </div>

      <div className="flex border-b border-slate-800/80 bg-slate-950/40 text-xs font-medium">
        <button
          onClick={() => setActiveTab('problem')}
          className={`flex-1 py-2 px-3 text-center transition-colors border-b-2 ${
            activeTab === 'problem'
              ? 'border-cyan-500 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Problem Statement
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-2 px-3 text-center transition-colors border-b-2 ${
            activeTab === 'code'
              ? 'border-cyan-500 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Solution Code
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-3">
        {activeTab === 'problem' ? (
          <div>
            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {sessionContext?.problem}
            </p>

            {sessionContext?.active_input && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 font-sans block mb-1">
                  Active Sample Input:
                </span>
                <code className="text-xs font-['JetBrains_Mono'] text-amber-300">
                  {sessionContext.active_input}
                </code>
              </div>
            )}
          </div>
        ) : (
          <div>
            <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-['JetBrains_Mono'] text-[11px] text-slate-200 overflow-x-auto leading-relaxed">
              <code>{sessionContext?.solution}</code>
            </pre>
          </div>
        )}
      </div>
    </aside>
  );
};
