import React from "react";
import type { UIPlan, UIComponentIntent } from "../types/ui";
import { ProblemSummaryCard } from "./cards/ProblemSummaryCard";
import { ApproachComplexityCard } from "./cards/ApproachComplexityCard";
import { BugAnalysisCard } from "./cards/BugAnalysisCard";
import { DryRunMarkdownCard } from "./cards/DryRunMarkdownCard";
import { SolutionComparisonCard } from "./cards/SolutionComparisonCard";
import { CodeViewerCard } from "./cards/CodeViewerCard";
import { Layers } from "lucide-react";

interface DynamicWorkspaceProps {
  uiPlan?: UIPlan | null;
  onViewFullCard?: (intent: UIComponentIntent) => void;
}

export const DynamicWorkspace: React.FC<DynamicWorkspaceProps> = ({ uiPlan, onViewFullCard }) => {
  if (!uiPlan || !uiPlan.components || uiPlan.components.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0f0f11] text-gray-500 font-mono text-xs border border-dashed border-[#27272a]">
        <Layers className="w-6 h-6 text-gray-700 mb-2" />
        <span>No Active Analysis Visual Cards</span>
        <span className="text-[10px] text-gray-600 mt-1">Submit your workspace code and problem statement to begin.</span>
      </div>
    );
  }

  const sortedComponents = [...uiPlan.components].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const renderComponent = (intent: UIComponentIntent, index: number) => {
    const props = intent.props || {};
    const handleViewFull = onViewFullCard ? () => onViewFullCard(intent) : undefined;

    switch (intent.type) {
      case "problem_summary":
        return <ProblemSummaryCard key={index} {...props} onViewFull={handleViewFull} />;

      case "approach_card":
      case "complexity_card":
        return <ApproachComplexityCard key={index} {...props} onViewFull={handleViewFull} />;

      case "bug_analysis":
      case "counterexample":
        return <BugAnalysisCard key={index} {...props} onViewFull={handleViewFull} />;

      case "dry_run_markdown":
        return <DryRunMarkdownCard key={index} {...props} onViewFull={handleViewFull} />;

      case "code_viewer":
        return <CodeViewerCard key={index} {...props} onViewFull={handleViewFull} />;

      case "solution_comparison":
      case "corrected_code":
      case "optimization_card":
        return <SolutionComparisonCard key={index} {...props} onViewFull={handleViewFull} />;

      default:
        return (
          <div key={index} className="bg-[#18181b] border border-[#27272a] p-4 text-xs font-mono text-gray-400 mb-6">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span className="uppercase">{intent.type}</span>
            </div>
            <pre className="text-[11px] overflow-x-auto text-gray-500">{JSON.stringify(props, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0f0f11] custom-scrollbar">
      {uiPlan.rationale && (
        <div className="mb-4 px-4 py-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
          <span className="font-bold text-indigo-400 uppercase text-[10px] block mb-0.5">Workspace Composition Rationale:</span>
          {uiPlan.rationale}
        </div>
      )}
      {sortedComponents.map(renderComponent)}
    </div>
  );
};
