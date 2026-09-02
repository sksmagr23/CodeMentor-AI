export type DSAIntent =
  | 'general_chat'
  | 'explain_problem'
  | 'explain_approach'
  | 'analyze_solution'
  | 'debug_solution'
  | 'counterexample'
  | 'dry_run'
  | 'show_fix'
  | 'optimize_solution'
  | 'compare_solutions'
  | 'show_code'
  | 'explain_complexity';

export type StructuredDataType =
  | 'problem_summary'
  | 'approach_card'
  | 'bug_analysis_card'
  | 'counterexample_card'
  | 'complexity_card'
  | 'solution_comparison_card'
  | 'optimization_card'
  | 'code_viewer'
  | 'dry_run_image';

export interface NextAction {
  label: string;
  action_prompt: string;
}

export interface ProblemSummaryData {
  type: 'problem_summary';
  title: string;
  statement: string;
  objective: string;
  inputs: string[];
  outputs: string;
  constraints: string[];
  edge_cases: string[];
  pattern: string;
  expected_complexity?: string;
}

export interface ApproachCardData {
  type: 'approach_card';
  algorithm: string;
  logic: string;
  data_structures: string[];
  correctness_classification: string;
  strengths: string[];
  weaknesses: string[];
  time_complexity: string;
  space_complexity: string;
  time_complexity_reasoning?: string;
  space_complexity_reasoning?: string;
}

export interface BugAnalysisData {
  type: 'bug_analysis_card';
  issue: string;
  why_it_fails: string;
  failing_condition: string;
  counterexample: string;
  expected_output: string;
  actual_output: string;
  fix: string;
  corrected_code?: string;
  language?: string;
}

export interface CounterexampleData {
  type: 'counterexample_card';
  input: string;
  expected_output: string;
  actual_output: string;
  reason: string;
}

export interface ComplexityCardData {
  type: 'complexity_card';
  time_complexity: string;
  space_complexity: string;
  time_breakdown: string[];
  space_breakdown: string[];
  bottleneck: string;
  best_case?: string;
  worst_case?: string;
}

export interface OptimizationData {
  type: 'optimization_card';
  approach_name: string;
  time_complexity: string;
  space_complexity: string;
  previous_complexity?: string;
  explanation: string;
  optimal_code: string;
  language?: string;
  tradeoffs?: string[];
}

export interface SolutionComparisonData {
  type: 'solution_comparison_card';
  user_approach: string;
  user_time: string;
  user_space: string;
  optimal_approach: string;
  optimal_time: string;
  optimal_space: string;
  key_differences: string[];
  recommendation: string;
}

export interface CodeViewerData {
  type: 'code_viewer';
  title?: string;
  code: string;
  language: string;
  explanation?: string;
  time_complexity?: string;
  space_complexity?: string;
}

export interface DryRunImageData {
  type: 'dry_run_image';
  title: string;
  problem_title: string;
  input_used: string;
  algorithm?: string;
  steps: string[];
  explanation: string;
  image_url: string;
}

export type StructuredData =
  | ProblemSummaryData
  | ApproachCardData
  | BugAnalysisData
  | CounterexampleData
  | ComplexityCardData
  | OptimizationData
  | SolutionComparisonData
  | CodeViewerData
  | DryRunImageData
  | ({ type: string } & Record<string, any>);

export interface AgentResponse {
  session_id: string;
  response: string;
  intent: string;
  structured_data?: StructuredData | null;
  next_actions: NextAction[];
  dsa_context?: DSASessionContext | null;
  new_session?: boolean;
}

export interface DSASessionContext {
  session_id: string;
  user_id: string;
  problem?: string | null;
  solution?: string | null;
  language: string;
  active_input?: string | null;
  test_cases?: string[];
  problem_understanding?: any;
  user_approach?: any;
  current_analysis?: any;
  generated_solutions?: any[];
  current_workspace_state?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  session_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string | null;
  structured_data?: StructuredData | null;
  next_actions?: NextAction[];
  created_at: string;
}

export interface SessionSummary {
  session_id: string;
  user_id: string;
  problem_title?: string | null;
  language?: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}
