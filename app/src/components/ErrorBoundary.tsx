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
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2 font-display">Something went wrong</h2>
          <p className="text-[#6B7280] mb-4">We're working on it. Please try refreshing.</p>
          <button onClick={() => this.setState({ hasError: false })} className="px-6 py-2 bg-[#5E17EB] text-white rounded-full font-medium hover:bg-[#4a12c0] transition-colors">
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
