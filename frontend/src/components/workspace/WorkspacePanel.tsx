import React, { useState, useEffect } from 'react';
import type { DSASessionContext } from '../../types/dsa';
import {
  Code2,
  Edit3,
  Layers,
  Check,
  X,
  Plus,
  Trash2,
  Copy,
  Play,
  Save,
} from 'lucide-react';
import { CodeEditor } from '../common/CodeEditor';

interface WorkspacePanelProps {
  sessionContext?: DSASessionContext | null;
  onSaveContext?: (data: {
    problem: string;
    solution: string;
    language: string;
    active_input?: string;
    test_cases?: string[];
    analyzeImmediately?: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  sessionContext,
  onSaveContext,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'code' | 'testcases'>('problem');

  const [editProblem, setEditProblem] = useState('');
  const [editSolution, setEditSolution] = useState('');
  const [editLanguage, setEditLanguage] = useState('cpp');
  const [editTestCases, setEditTestCases] = useState<string[]>(['']);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const hasProblem = Boolean(sessionContext?.problem);
  const hasSolution = Boolean(sessionContext?.solution);

  useEffect(() => {
    if (sessionContext) {
      setEditProblem(sessionContext.problem || '');
      setEditSolution(sessionContext.solution || '');
      setEditLanguage(sessionContext.language || 'cpp');

      const existingCases = sessionContext.test_cases && sessionContext.test_cases.length > 0
        ? sessionContext.test_cases
        : sessionContext.active_input
        ? [sessionContext.active_input]
        : [''];
      setEditTestCases(existingCases);
    }
  }, [sessionContext]);

  const handleStartEdit = () => {
    setEditProblem(sessionContext?.problem || '');
    setEditSolution(sessionContext?.solution || '');
    setEditLanguage(sessionContext?.language || 'cpp');
    const existingCases = sessionContext?.test_cases && sessionContext.test_cases.length > 0
      ? sessionContext.test_cases
      : sessionContext?.active_input
      ? [sessionContext.active_input]
      : [''];
    setEditTestCases(existingCases);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAddTestCase = () => {
    setEditTestCases((prev) => [...prev, '']);
  };

  const handleUpdateTestCase = (index: number, val: string) => {
    setEditTestCases((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveTestCase = (index: number) => {
    setEditTestCases((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length === 0 ? [''] : next;
    });
  };

  const handleSave = async (analyzeImmediately: boolean = false) => {
    if (!onSaveContext) return;
    const cleanCases = editTestCases.map((tc) => tc.trim()).filter(Boolean);
    const activeIn = cleanCases.length > 0 ? cleanCases[0] : '';

    await onSaveContext({
      problem: editProblem.trim(),
      solution: editSolution.trim(),
      language: editLanguage,
      active_input: activeIn,
      test_cases: cleanCases,
      analyzeImmediately,
    });
    setIsEditing(false);
  };


  const handleCopyTestCase = (tc: string, idx: number) => {
    navigator.clipboard.writeText(tc);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // -------------------------------------------------------------
  // EDIT MODE (In-Place Editor inside the Right Panel)
  // -------------------------------------------------------------
  if (isEditing) {
    return (
      <aside className="w-full md:w-80 lg:w-105 border-b md:border-b-0 md:border-l border-slate-800 bg-slate-950 flex flex-col shrink-0 max-h-[50vh] md:max-h-full overflow-hidden z-10 shadow-2xl">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-100 uppercase tracking-wider">
              Edit DSA Context
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCancelEdit}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Form Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5 text-xs">
          {/* Problem Statement */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Problem Statement <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={editProblem}
              onChange={(e) => setEditProblem(e.target.value)}
              placeholder="e.g. Given an array of integers nums and an integer target..."
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Programming Language
            </label>
            <select
              value={editLanguage}
              onChange={(e) => setEditLanguage(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Solution Code <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <CodeEditor
              value={editSolution}
              onChange={setEditSolution}
              language={editLanguage}
              readOnly={false}
              height="200px"
              title="Solution Editor"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Sample Test Cases (Optional)
              </label>
              <button
                type="button"
                onClick={handleAddTestCase}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>Add Test Case</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {editTestCases.map((tc, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-[10px] font-['JetBrains_Mono'] text-slate-500 w-4">
                    #{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={tc}
                    onChange={(e) => handleUpdateTestCase(idx, e.target.value)}
                    placeholder={`e.g. nums = [2, 7, 11, 15], target = 9`}
                    className="flex-1 rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-[11px] font-['JetBrains_Mono'] text-amber-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                  />
                  {editTestCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(idx)}
                      className="p-1 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove testcase"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
              title="Save context to panel without sending chat message"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Context</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium shadow-md transition-all disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Save & Analyze</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (!hasProblem && !hasSolution) {
    return (
      <aside className="w-full md:w-80 lg:w-105 border-b md:border-b-0 md:border-l border-slate-800 bg-slate-950/60 p-5 flex flex-col justify-between shrink-0">
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
              onClick={handleStartEdit}
              className="w-full py-2 px-3 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Set Up Problem & Code</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-['JetBrains_Mono'] flex items-center justify-between">
          <span>CodeMentor AI</span>
          <span>Persistent Context</span>
        </div>
      </aside>
    );
  }

  const allTestCases = sessionContext?.test_cases && sessionContext.test_cases.length > 0
    ? sessionContext.test_cases
    : sessionContext?.active_input
    ? [sessionContext.active_input]
    : [];

  return (
    <aside className="w-full md:w-80 lg:w-105 border-b md:border-b-0 md:border-l border-slate-800 bg-slate-950/70 flex flex-col shrink-0 max-h-[45vh] md:max-h-full overflow-hidden">
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
          onClick={handleStartEdit}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-850 hover:bg-slate-800 text-cyan-300 text-xs border border-slate-800 transition-colors"
          title="Edit Problem or Code in-place"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit</span>
        </button>
      </div>

      <div className="flex border-b border-slate-800/80 bg-slate-950/40 text-xs font-medium">
        <button
          onClick={() => setActiveTab('problem')}
          className={`flex-1 py-2 px-2 text-center transition-colors border-b-2 ${
            activeTab === 'problem'
              ? 'border-cyan-500 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Problem
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 py-2 px-2 text-center transition-colors border-b-2 ${
            activeTab === 'code'
              ? 'border-cyan-500 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setActiveTab('testcases')}
          className={`flex-1 py-2 px-2 text-center transition-colors border-b-2 ${
            activeTab === 'testcases'
              ? 'border-cyan-500 text-cyan-300 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Test Cases ({allTestCases.length})
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 space-y-3">
        {activeTab === 'problem' && (
          <div>
            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {sessionContext?.problem}
            </p>

            {allTestCases.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Sample Inputs:
                </span>
                {allTestCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                  >
                    <code className="text-xs font-['JetBrains_Mono'] text-amber-300 truncate mr-2">
                      {tc}
                    </code>
                    <button
                      onClick={() => handleCopyTestCase(tc, idx)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                      title="Copy testcase"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div>
            <CodeEditor
              value={sessionContext?.solution || '// No code provided'}
              language={sessionContext?.language || 'cpp'}
              readOnly={true}
              height="340px"
              title="Active Solution"
            />
          </div>
        )}

        {activeTab === 'testcases' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs text-slate-400 font-medium">Configured Test Cases</span>
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>Add / Edit</span>
              </button>
            </div>

            {allTestCases.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 rounded-lg bg-slate-900/40 border border-dashed border-slate-800">
                No test cases configured. Click "Add / Edit" to specify test cases.
              </div>
            ) : (
              allTestCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-['JetBrains_Mono']"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Test Case #{idx + 1}</span>
                    <button
                      onClick={() => handleCopyTestCase(tc, idx)}
                      className="hover:text-slate-300 transition-colors"
                      title="Copy"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                  <div className="text-amber-300 break-all">{tc}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
