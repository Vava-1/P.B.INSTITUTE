import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() { return { hasError: true }; }

  componentDidCatch(error: Error) { console.error("[ErrorBoundary]", error); }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="text-5xl mb-4">:)</div>
          <h2 className="text-2xl font-bold text-foreground mb-2 font-display">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">We're working on it. Please try refreshing.</p>
          <button onClick={() => this.setState({ hasError: false })} className="px-6 py-2 bg-brand text-white rounded-full font-medium hover:bg-brand-dark transition-colors">
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
