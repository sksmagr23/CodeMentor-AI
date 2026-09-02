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
  Maximize2,
  FileText,
  Terminal,
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

type ModalSection = 'problem' | 'code' | 'testcases' | null;

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  sessionContext,
  onSaveContext,
  isLoading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editProblem, setEditProblem] = useState('');
  const [editSolution, setEditSolution] = useState('');
  const [editLanguage, setEditLanguage] = useState('cpp');
  const [editTestCases, setEditTestCases] = useState<string[]>(['']);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedProblem, setCopiedProblem] = useState(false);

  // Full-screen pop-up modal state
  const [activeModal, setActiveModal] = useState<ModalSection>(null);

  // Sync state when session context changes
  useEffect(() => {
    if (sessionContext) {
      setEditProblem(sessionContext.problem || '');
      setEditSolution(sessionContext.solution || '');
      setEditLanguage(sessionContext.language || 'cpp');
      if (sessionContext.test_cases && sessionContext.test_cases.length > 0) {
        setEditTestCases(sessionContext.test_cases);
      } else if (sessionContext.active_input) {
        setEditTestCases([sessionContext.active_input]);
      } else {
        setEditTestCases(['']);
      }
    }
  }, [sessionContext]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const handleStartEdit = () => {
    setEditProblem(sessionContext?.problem || '');
    setEditSolution(sessionContext?.solution || '');
    setEditLanguage(sessionContext?.language || 'cpp');
    if (sessionContext?.test_cases && sessionContext.test_cases.length > 0) {
      setEditTestCases([...sessionContext.test_cases]);
    } else if (sessionContext?.active_input) {
      setEditTestCases([sessionContext.active_input]);
    } else {
      setEditTestCases(['']);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleAddTestCase = () => {
    setEditTestCases((prev) => [...prev, '']);
  };

  const handleUpdateTestCase = (idx: number, val: string) => {
    setEditTestCases((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleRemoveTestCase = (idx: number) => {
    setEditTestCases((prev) => {
      const next = prev.filter((_, i) => i !== idx);
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

  const handleCopyProblemText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedProblem(true);
    setTimeout(() => setCopiedProblem(false), 2000);
  };

  const hasContent = Boolean(
    sessionContext?.problem ||
    sessionContext?.solution ||
    sessionContext?.active_input ||
    (sessionContext?.test_cases && sessionContext.test_cases.length > 0)
  );

  return (
    <>
      <aside className="w-full h-full border-b md:border-b-0 md:border-l border-slate-800 bg-slate-950 flex flex-col shrink-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-['Space_Grotesk'] text-xs font-bold text-slate-100 uppercase tracking-wider">
              {isEditing ? 'Edit DSA Context' : 'Active DSA Context'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isEditing ? (
              <button
                onClick={handleCancelEdit}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition-colors font-medium"
                title="Edit Problem and Code"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{hasContent ? 'Edit' : 'Set Up'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Panel Content (Full Space / Minimal Waste) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* -------------------------------------------------------------
              EDIT MODE
             ------------------------------------------------------------- */}
          {isEditing ? (
            <div className="space-y-3">
              {/* Problem Statement */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Problem Statement</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveModal('problem')}
                    className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editProblem}
                  onChange={(e) => setEditProblem(e.target.value)}
                  placeholder="Paste problem statement or description..."
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Programming Language
                </label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="cpp">C++ (LeetCode Style)</option>
                  <option value="python">Python 3</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript / TypeScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              {/* Solution Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Solution Code</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveModal('code')}
                    className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
                <CodeEditor
                  value={editSolution}
                  onChange={setEditSolution}
                  language={editLanguage}
                  readOnly={false}
                  height="220px"
                  title="Solution Editor"
                  allowFullscreen={true}
                />
              </div>

              {/* Multiple Test Cases */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Test Cases ({editTestCases.length})</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveModal('testcases')}
                      className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTestCase}
                      className="flex items-center gap-1 px-2 py-0.5 text-[11px] rounded bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 border border-cyan-500/30 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {editTestCases.map((tc, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-slate-500 shrink-0 w-4 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={tc}
                        onChange={(e) => handleUpdateTestCase(idx, e.target.value)}
                        placeholder={`Test case ${idx + 1} (e.g. nums = [2,7,11,15], target = 9)`}
                        className="flex-1 rounded bg-slate-900 border border-slate-800 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                      />
                      {editTestCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
                          title="Remove test case"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSave(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Save & Analyze Now</span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSave(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Context Only</span>
                </button>
              </div>
            </div>
          ) : (
            /* -------------------------------------------------------------
               VIEW MODE (Full Space / No Wasted Padding)
               ------------------------------------------------------------- */
            <div className="space-y-3">
              {!hasContent ? (
                <div className="text-center py-10 px-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1">No Active DSA Context</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    Enter a problem statement, code snippet, or test cases to inspect and analyze them here.
                  </p>
                  <button
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-md transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Set Up Context</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Problem Statement Card */}
                  {sessionContext?.problem && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-850 border-b border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-['Space_Grotesk'] text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                            Problem Statement
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyProblemText(sessionContext.problem || '')}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
                            title="Copy Problem Text"
                          >
                            {copiedProblem ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setActiveModal('problem')}
                            className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                            title="View Fullscreen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed max-h-36 overflow-y-auto">
                        {sessionContext.problem}
                      </div>
                    </div>
                  )}

                  {/* Solution Code Card */}
                  {sessionContext?.solution && (
                    <div>
                      <CodeEditor
                        value={sessionContext.solution}
                        language={sessionContext.language || 'cpp'}
                        readOnly={true}
                        height="260px"
                        title="Active Solution"
                        allowFullscreen={true}
                      />
                    </div>
                  )}

                  {/* Multiple Test Cases Card */}
                  {sessionContext?.test_cases && sessionContext.test_cases.length > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-md">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-850 border-b border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-['Space_Grotesk'] text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                            Test Cases ({sessionContext.test_cases.length})
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveModal('testcases')}
                          className="p-1 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                          title="View Fullscreen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-2 space-y-1.5 max-h-40 overflow-y-auto">
                        {sessionContext.test_cases.map((tc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-slate-300"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[10px] text-cyan-400 font-bold">#{idx + 1}</span>
                              <span className="truncate">{tc}</span>
                            </div>
                            <button
                              onClick={() => handleCopyTestCase(tc, idx)}
                              className="p-1 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                              title="Copy test case"
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
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* -------------------------------------------------------------
          FULL-SCREEN DARK FOREGROUND POPUP MODAL
         ------------------------------------------------------------- */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl border border-slate-700 bg-slate-950 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 select-none">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {activeModal === 'problem' && <FileText className="w-4 h-4" />}
                  {activeModal === 'code' && <Code2 className="w-4 h-4" />}
                  {activeModal === 'testcases' && <Terminal className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-base font-semibold text-slate-100">
                    {activeModal === 'problem' && 'Full Problem Statement'}
                    {activeModal === 'code' && `Full Solution Code (${(isEditing ? editLanguage : sessionContext?.language || 'cpp').toUpperCase()})`}
                    {activeModal === 'testcases' && 'All Test Cases'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    CodeMentor AI Workspace Inspector
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeModal === 'problem' && (
                  <button
                    onClick={() => handleCopyProblemText(isEditing ? editProblem : sessionContext?.problem || '')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    {copiedProblem ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Problem</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors border border-slate-700"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-950 text-slate-200">
              {activeModal === 'problem' && (
                <div className="h-full">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm font-sans leading-relaxed whitespace-pre-wrap text-slate-200">
                    {(isEditing ? editProblem : sessionContext?.problem) || 'No problem statement provided.'}
                  </div>
                </div>
              )}

              {activeModal === 'code' && (
                <div className="h-full">
                  <CodeEditor
                    value={isEditing ? editSolution : sessionContext?.solution || ''}
                    onChange={isEditing ? setEditSolution : undefined}
                    language={isEditing ? editLanguage : sessionContext?.language || 'cpp'}
                    readOnly={!isEditing}
                    height="100%"
                    title="Solution Code View"
                    allowFullscreen={false}
                  />
                </div>
              )}

              {activeModal === 'testcases' && (
                <div className="space-y-2">
                  {((isEditing ? editTestCases : sessionContext?.test_cases) || []).map((tc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono text-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 text-xs font-bold border border-cyan-800">
                          Case {idx + 1}
                        </span>
                        <span>{tc || '(Empty testcase)'}</span>
                      </div>
                      <button
                        onClick={() => handleCopyTestCase(tc, idx)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
