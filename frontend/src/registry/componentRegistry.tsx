import React from 'react';
import type { StructuredData, ProblemSetupData } from '../types/dsa';
import { ProblemSetupForm } from '../components/forms/ProblemSetupForm';
import { ProblemSummaryCard } from '../components/cards/ProblemSummaryCard';
import { ApproachCard } from '../components/cards/ApproachCard';
import { BugAnalysisCard } from '../components/cards/BugAnalysisCard';
import { CounterexampleCard } from '../components/cards/CounterexampleCard';
import { ComplexityCard } from '../components/cards/ComplexityCard';
import { OptimizationCard } from '../components/cards/OptimizationCard';
import { SolutionComparisonCard } from '../components/cards/SolutionComparisonCard';
import { CodeViewer } from '../components/cards/CodeViewer';
import { ImageViewer } from '../components/cards/ImageViewer';
import { AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface RegistryHandlers {
  onSetupSubmit?: (data: {
    problem: string;
    solution: string;
    language: string;
    active_input?: string;
    test_cases?: string[];
  }) => Promise<void>;
  isLoading?: boolean;
}

const UnsupportedCard: React.FC<{ type: string; data: any }> = ({ type, data }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 my-3 text-slate-400 text-xs">
    <div className="flex items-center gap-2 text-amber-400 font-medium mb-1">
      <AlertTriangle className="w-4 h-4" />
      <span>Structured Output: {type}</span>
    </div>
    <pre className="mt-2 p-2 rounded bg-slate-950 text-slate-300 font-['JetBrains_Mono'] overflow-x-auto">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  </div>
);

/**
 * Centralized DSA Component Registry.
 * Dispatches structured_data.type to corresponding verified React component.
 */
export const componentRegistry: Record<string, React.ComponentType<any>> = {
  problem_setup_form: ProblemSetupForm,
  problem_summary: ProblemSummaryCard,
  approach_card: ApproachCard,
  bug_analysis_card: BugAnalysisCard,
  counterexample_card: CounterexampleCard,
  complexity_card: ComplexityCard,
  solution_comparison_card: SolutionComparisonCard,
  optimization_card: OptimizationCard,
  code_viewer: CodeViewer,
  dry_run_image: ImageViewer,
};

export function renderStructuredData(
  structuredData: StructuredData | null | undefined,
  handlers: RegistryHandlers = {}
): React.ReactNode {
  if (!structuredData || !structuredData.type) {
    return null;
  }

  const Component = componentRegistry[structuredData.type];
  if (!Component) {
    return <UnsupportedCard type={structuredData.type} data={structuredData} />;
  }

  if (structuredData.type === 'problem_setup_form') {
    const formData = structuredData as ProblemSetupData;
    return (
      <ProblemSetupForm
        {...formData}
        onSubmit={handlers.onSetupSubmit}
        isLoading={handlers.isLoading}
      />
    );
  }

  return (
    <ErrorBoundary fallbackTitle={`Error rendering card: ${structuredData.type}`}>
      <Component {...(structuredData as any)} />
    </ErrorBoundary>
  );
}
