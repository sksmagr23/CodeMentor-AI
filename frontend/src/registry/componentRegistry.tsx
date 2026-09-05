import React from 'react';
import type { StructuredData } from '../types/dsa';
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
  isLoading?: boolean;
}

const UnsupportedCard: React.FC<{ type: string; data: any }> = ({ type, data }) => (
  <div className="panel-brutal p-4 my-3 text-ink text-xs">
    <div className="flex items-center gap-2 text-warn font-medium mb-1">
      <div className="border-2 border-accent bg-accent-soft text-warn p-1.5 shadow-hard-sm">
        <AlertTriangle className="w-4 h-4" />
      </div>
      <span>Structured Output: {type}</span>
    </div>
    <pre className="mt-2 p-2 border-2 border-accent bg-paper text-ink font-mono overflow-x-auto shadow-hard-sm">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  </div>
);

/**
 * Centralized DSA Component Registry.
 * Dispatches structured_data.type to corresponding verified React component.
 */
export const componentRegistry: Record<string, React.ComponentType<any>> = {
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
  _handlers: RegistryHandlers = {}
): React.ReactNode {
  if (!structuredData || !structuredData.type) {
    return null;
  }

  const Component = componentRegistry[structuredData.type];
  if (!Component) {
    return <UnsupportedCard type={structuredData.type} data={structuredData} />;
  }

  return (
    <ErrorBoundary fallbackTitle={`Error rendering card: ${structuredData.type}`}>
      <Component {...(structuredData as any)} />
    </ErrorBoundary>
  );
}
