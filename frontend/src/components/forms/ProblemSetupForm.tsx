import React, { useState } from 'react';
import type { ProblemSetupData } from '../../types/dsa';
import { Code2, Play, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface ProblemSetupFormProps extends ProblemSetupData {
  onSubmit?: (data: {
    problem: string;
    solution: string;
    language: string;
    active_input?: string;
    test_cases?: string[];
  }) => Promise<void>;
  isLoading?: boolean;
}

export const ProblemSetupForm: React.FC<ProblemSetupFormProps> = ({
  problem: initialProblem = '',
  solution: initialSolution = '',
  language: initialLanguage = 'cpp',
  active_input: initialInput = '',
  test_cases: initialTestCases = [],
  onSubmit,
  isLoading = false,
}) => {
  const [problem, setProblem] = useState(initialProblem);
  const [solution, setSolution] = useState(initialSolution);
  const [language, setLanguage] = useState(initialLanguage || 'cpp');
  const [testCases, setTestCases] = useState<string[]>(() => {
    if (initialTestCases && initialTestCases.length > 0) return initialTestCases;
    if (initialInput) return [initialInput];
    return [''];
  });
  const [error, setError] = useState<string | null>(null);

  const handleAddTestCase = () => {
    setTestCases((prev) => [...prev, '']);
  };

  const handleUpdateTestCase = (idx: number, val: string) => {
    setTestCases((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleRemoveTestCase = (idx: number) => {
    setTestCases((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length === 0 ? [''] : next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim() && !solution.trim()) {
      setError('Please provide either a problem statement or solution code to proceed.');
      return;
    }
    setError(null);
    if (onSubmit) {
      const cleanCases = testCases.map((tc) => tc.trim()).filter(Boolean);
      await onSubmit({
        problem: problem.trim(),
        solution: solution.trim(),
        language,
        active_input: cleanCases.length > 0 ? cleanCases[0] : '',
        test_cases: cleanCases,
      });
    }
  };

  return (
    <div className="rounded-xl border border-cyan-500/40 bg-slate-900/95 p-5 shadow-2xl my-3 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800/90 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] text-base font-semibold text-slate-100">
              Problem & Solution Setup
            </h3>
            <span className="text-xs text-slate-400">
              Provide problem statement, solution code, or both for analysis
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Problem Statement */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Problem Statement <span className="text-slate-500 font-normal lowercase">(optional if code provided)</span>
          </label>
          <textarea
            rows={3}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
            className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              disabled={isLoading}
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
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
              {testCases.map((tc, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tc}
                    onChange={(e) => handleUpdateTestCase(idx, e.target.value)}
                    placeholder="e.g. nums = [2,7,11,15], target = 9"
                    className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none font-['JetBrains_Mono']"
                    disabled={isLoading}
                  />
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTestCase(idx)}
                      className="p-1.5 rounded hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove test case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Solution Code <span className="text-slate-500 font-normal lowercase">(optional if problem provided)</span>
          </label>
          <textarea
            rows={7}
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder={`// Enter your solution function or class snippet\n// No main() or compiler scaffolding required`}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3.5 font-['JetBrains_Mono'] text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing Solution...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Save & Analyze</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
