import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../design-system';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('Unhandled UI error:', error, info.componentStack);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-6 text-[#0F172A] font-sans antialiased">
          <div
            role="alert"
            className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-[#0F172A]">Something went wrong</h1>
              <p className="text-sm text-[#475569] leading-relaxed">
                An unexpected error interrupted this screen. Reload the page to continue.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={this.handleReload}
              iconLeft={<RefreshCw className="w-4 h-4" aria-hidden="true" />}
            >
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
