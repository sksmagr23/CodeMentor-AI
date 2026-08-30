import React, { useState } from 'react';
import type { ProblemSetupData } from '../../types/dsa';
import { Code2, Play, AlertCircle, Sparkles } from 'lucide-react';

interface ProblemSetupFormProps extends ProblemSetupData {
  onSubmit?: (data: {
    problem: string;
    solution: string;
    language: string;
    active_input: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const ProblemSetupForm: React.FC<ProblemSetupFormProps> = ({
  problem: initialProblem = '',
  solution: initialSolution = '',
  language: initialLanguage = 'cpp',
  active_input: initialInput = '',
  onSubmit,
  isLoading = false,
}) => {
  const [problem, setProblem] = useState(initialProblem);
  const [solution, setSolution] = useState(initialSolution);
  const [language, setLanguage] = useState(initialLanguage || 'cpp');
  const [activeInput, setActiveInput] = useState(initialInput);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) {
      setError('Problem statement is required for DSA solution analysis.');
      return;
    }
    if (!solution.trim()) {
      setError('Solution code is required for analysis.');
      return;
    }
    setError(null);
    if (onSubmit) {
      await onSubmit({
        problem: problem.trim(),
        solution: solution.trim(),
        language,
        active_input: activeInput.trim(),
      });
    }
  };

  const loadExampleTwoSum = () => {
    setProblem(
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.'
    );
    setLanguage('cpp');
    setSolution(`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.find(complement) != seen.end()) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`);
    setActiveInput('nums = [2, 7, 11, 15], target = 9');
    setError(null);
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
              Submit your DSA problem and solution code for conceptual analysis
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={loadExampleTwoSum}
          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Example (Two Sum)</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Problem Statement <span className="text-red-400">*</span>
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
              <option value="cpp">C++ (std::vector, LeetCode style)</option>
              <option value="python">Python 3</option>
              <option value="java">Java</option>
              <option value="javascript">JavaScript / TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Optional Sample Input
            </label>
            <input
              type="text"
              value={activeInput}
              onChange={(e) => setActiveInput(e.target.value)}
              placeholder="e.g. nums = [2,7,11,15], target = 9"
              className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Solution Code <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={8}
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
