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
import { useToast } from '../../context/ToastContext';

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
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editProblem, setEditProblem] = useState('');
  const [editSolution, setEditSolution] = useState('');
  const [editLanguage, setEditLanguage] = useState('cpp');
  const [editTestCases, setEditTestCases] = useState<string[]>(['']);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedProblem, setCopiedProblem] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalSection>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) setActiveModal(null);
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

  const handleCancelEdit = () => setIsEditing(false);

  const handleAddTestCase = () => setEditTestCases((prev) => [...prev, '']);

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
    toast.success(
      analyzeImmediately ? 'Saved & analyzing' : 'Context saved',
      analyzeImmediately ? 'Mentor is reviewing your solution.' : 'Problem context updated.'
    );
  };

  const handleCopyTestCase = (tc: string, idx: number) => {
    navigator.clipboard.writeText(tc);
    setCopiedIdx(idx);
    toast.success('Copied', 'Test case copied.');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyProblemText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedProblem(true);
    toast.success('Copied', 'Problem text copied.');
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
      <aside className="w-full h-full border-b-2 md:border-b-0 md:border-l-0 border-accent bg-paper-elevated flex flex-col shrink-0 overflow-hidden">
        <div className="px-3.5 py-2.5 border-b-2 border-accent flex items-center justify-between bg-paper shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-bright" strokeWidth={2.25} />
            <span className="font-display text-base text-ink">
              {isEditing ? 'Edit Context' : 'Active Context'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isEditing ? (
              <button
                onClick={handleCancelEdit}
                className="icon-btn w-8 h-8"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            ) : (
              <button
                onClick={handleStartEdit}
                className="btn-brutal btn-brutal-blue flex items-center gap-1 px-2.5 py-1 text-xs"
                title="Edit Problem and Code"
              >
                <Edit3 className="w-3.5 h-3.5" strokeWidth={2.25} />
                <span>{hasContent ? 'Edit' : 'Set Up'}</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-graph-fine">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-accent-bright" strokeWidth={2.25} />
                    <span>Problem Statement</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveModal('problem')}
                    className="p-1 text-muted hover:text-accent-bright transition-colors"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="w-3 h-3" strokeWidth={2.25} />
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editProblem}
                  onChange={(e) => setEditProblem(e.target.value)}
                  placeholder="Paste problem statement or description…"
                  className="input-brutal w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1">
                  Programming Language
                </label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="input-brutal w-full px-3 py-1.5 text-xs"
                >
                  <option value="cpp">C++ (LeetCode Style)</option>
                  <option value="python">Python 3</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript / TypeScript</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-accent-bright" strokeWidth={2.25} />
                    <span>Solution Code</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveModal('code')}
                    className="p-1 text-muted hover:text-accent-bright transition-colors"
                    title="View Fullscreen"
                  >
                    <Maximize2 className="w-3 h-3" strokeWidth={2.25} />
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

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-accent-bright" strokeWidth={2.25} />
                    <span>Test Cases ({editTestCases.length})</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveModal('testcases')}
                      className="p-1 text-muted hover:text-accent-bright transition-colors"
                      title="View Fullscreen"
                    >
                      <Maximize2 className="w-3 h-3" strokeWidth={2.25} />
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTestCase}
                      className="flex items-center gap-1 px-2 py-0.5 text-[11px] border-2 border-accent bg-accent-soft text-accent-bright hover:bg-accent hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" strokeWidth={2.5} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {editTestCases.map((tc, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono text-muted shrink-0 w-4 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={tc}
                        onChange={(e) => handleUpdateTestCase(idx, e.target.value)}
                        placeholder={`Test case ${idx + 1}`}
                        className="input-brutal flex-1 px-2.5 py-1 text-xs"
                      />
                      {editTestCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTestCase(idx)}
                          className="p-1 border-2 border-transparent hover:border-accent text-muted hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                          title="Remove test case"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSave(true)}
                  className="btn-brutal btn-brutal-blue w-full flex items-center justify-center gap-2 py-2.5 text-xs disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" strokeWidth={2.25} />
                  <span>Save & Analyze Now</span>
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSave(false)}
                  className="btn-brutal btn-brutal-white w-full flex items-center justify-center gap-1.5 py-2 text-xs disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" strokeWidth={2.25} />
                  <span>Save Context Only</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {!hasContent ? (
                <div className="text-center py-10 px-4 panel-brutal">
                  <div className="w-10 h-10 border-2 border-accent bg-accent-soft text-accent-bright flex items-center justify-center mx-auto mb-3 shadow-hard-sm">
                    <Layers className="w-5 h-5" strokeWidth={2.25} />
                  </div>
                  <h4 className="font-display text-lg text-ink mb-1">No Active Context</h4>
                  <p className="text-[11px] text-muted leading-relaxed mb-4">
                    Enter a problem statement, code snippet, or test cases to inspect here.
                  </p>
                  <button
                    onClick={handleStartEdit}
                    className="btn-brutal btn-brutal-blue inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    <span>Set Up Context</span>
                  </button>
                </div>
              ) : (
                <>
                  {sessionContext?.problem && (
                    <div className="border-2 border-accent bg-paper-elevated overflow-hidden shadow-hard">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-paper border-b-2 border-accent text-xs">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-accent-bright" strokeWidth={2.25} />
                          <span className="font-display text-sm text-ink">Problem</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyProblemText(sessionContext.problem || '')}
                            className="p-1 text-muted hover:text-ink transition-colors"
                            title="Copy Problem Text"
                          >
                            {copiedProblem ? (
                              <Check className="w-3.5 h-3.5 text-success" strokeWidth={2.5} />
                            ) : (
                              <Copy className="w-3.5 h-3.5" strokeWidth={2.25} />
                            )}
                          </button>
                          <button
                            onClick={() => setActiveModal('problem')}
                            className="p-1 text-muted hover:text-accent-bright transition-colors"
                            title="View Fullscreen"
                          >
                            <Maximize2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                          </button>
                        </div>
                      </div>
                      <div className="p-3 text-xs text-ink whitespace-pre-wrap font-sans leading-relaxed max-h-36 overflow-y-auto">
                        {sessionContext.problem}
                      </div>
                    </div>
                  )}

                  {sessionContext?.solution && (
                    <CodeEditor
                      value={sessionContext.solution}
                      language={sessionContext.language || 'cpp'}
                      readOnly={true}
                      height="260px"
                      title="Active Solution"
                      allowFullscreen={true}
                    />
                  )}

                  {sessionContext?.test_cases && sessionContext.test_cases.length > 0 && (
                    <div className="border-2 border-accent bg-paper-elevated overflow-hidden shadow-hard">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-paper border-b-2 border-accent text-xs">
                        <div className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-accent-bright" strokeWidth={2.25} />
                          <span className="font-display text-sm text-ink">
                            Test Cases ({sessionContext.test_cases.length})
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveModal('testcases')}
                          className="p-1 text-muted hover:text-accent-bright transition-colors"
                          title="View Fullscreen"
                        >
                          <Maximize2 className="w-3.5 h-3.5" strokeWidth={2.25} />
                        </button>
                      </div>

                      <div className="p-2 space-y-1.5 max-h-40 overflow-y-auto">
                        {sessionContext.test_cases.map((tc, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-2 border-accent bg-paper text-xs font-mono text-ink"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[10px] text-accent-bright font-bold">#{idx + 1}</span>
                              <span className="truncate">{tc}</span>
                            </div>
                            <button
                              onClick={() => handleCopyTestCase(tc, idx)}
                              className="p-1 text-muted hover:text-ink transition-colors shrink-0"
                              title="Copy test case"
                            >
                              {copiedIdx === idx ? (
                                <Check className="w-3 h-3 text-success" strokeWidth={2.5} />
                              ) : (
                                <Copy className="w-3 h-3" strokeWidth={2.25} />
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

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-ink/50 animate-fade-in">
          <div className="w-full max-w-5xl h-[85vh] flex flex-col border-2 border-accent bg-paper-elevated shadow-hard-lg overflow-hidden animate-pop-in">
            <div className="flex items-center justify-between px-5 py-3.5 bg-paper border-b-2 border-accent select-none">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 border-2 border-accent bg-accent-soft text-accent-bright">
                  {activeModal === 'problem' && <FileText className="w-4 h-4" strokeWidth={2.25} />}
                  {activeModal === 'code' && <Code2 className="w-4 h-4" strokeWidth={2.25} />}
                  {activeModal === 'testcases' && <Terminal className="w-4 h-4" strokeWidth={2.25} />}
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink">
                    {activeModal === 'problem' && 'Full Problem Statement'}
                    {activeModal === 'code' &&
                      `Solution (${(isEditing ? editLanguage : sessionContext?.language || 'cpp').toUpperCase()})`}
                    {activeModal === 'testcases' && 'All Test Cases'}
                  </h3>
                  <span className="text-xs text-muted font-mono">Workspace Inspector</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeModal === 'problem' && (
                  <button
                    onClick={() =>
                      handleCopyProblemText(isEditing ? editProblem : sessionContext?.problem || '')
                    }
                    className="btn-brutal btn-brutal-white flex items-center gap-1 px-3 py-1.5 text-xs"
                  >
                    {copiedProblem ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-success" strokeWidth={2.5} />
                        <span className="text-success">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" strokeWidth={2.25} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setActiveModal(null)}
                  className="icon-btn w-9 h-9"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-graph-fine text-ink">
              {activeModal === 'problem' && (
                <div className="p-4 border-2 border-accent bg-paper-elevated shadow-hard text-sm font-sans leading-relaxed whitespace-pre-wrap">
                  {(isEditing ? editProblem : sessionContext?.problem) ||
                    'No problem statement provided.'}
                </div>
              )}

              {activeModal === 'code' && (
                <CodeEditor
                  value={isEditing ? editSolution : sessionContext?.solution || ''}
                  onChange={isEditing ? setEditSolution : undefined}
                  language={isEditing ? editLanguage : sessionContext?.language || 'cpp'}
                  readOnly={!isEditing}
                  height="100%"
                  title="Solution Code View"
                  allowFullscreen={false}
                />
              )}

              {activeModal === 'testcases' && (
                <div className="space-y-2">
                  {((isEditing ? editTestCases : sessionContext?.test_cases) || []).map((tc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 border-2 border-accent bg-paper-elevated shadow-hard-sm text-sm font-mono"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 border-2 border-accent bg-accent-soft text-accent-bright text-xs font-bold">
                          Case {idx + 1}
                        </span>
                        <span>{tc || '(Empty testcase)'}</span>
                      </div>
                      <button
                        onClick={() => handleCopyTestCase(tc, idx)}
                        className="btn-brutal btn-brutal-white flex items-center gap-1 px-2.5 py-1 text-xs"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-success" strokeWidth={2.5} />
                            <span className="text-success">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" strokeWidth={2.25} />
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
