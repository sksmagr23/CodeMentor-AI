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
        <div className="border-2 border-accent bg-paper-elevated shadow-hard p-4 my-3 text-ink text-xs">
          <div className="flex items-center gap-2 font-semibold text-danger mb-1">
            <div className="border-2 border-accent bg-accent-soft text-danger p-1.5 shadow-hard-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span>{this.props.fallbackTitle || 'Rendering Error in Component'}</span>
          </div>
          <p className="text-muted text-xs">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
