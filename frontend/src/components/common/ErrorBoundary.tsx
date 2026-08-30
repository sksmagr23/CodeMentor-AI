import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-900/60 bg-red-950/20 p-4 my-3 text-red-200 text-xs">
          <div className="flex items-center gap-2 font-semibold text-red-400 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>{this.props.fallbackTitle || 'Rendering Error in Component'}</span>
          </div>
          <p className="text-slate-400 text-xs">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
