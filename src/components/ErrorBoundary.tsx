'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#795548] flex items-center justify-center p-4 font-[var(--font-pixel)]">
          <div className="mc-card bg-[#E2E8F0] p-6 sm:p-12 max-w-lg w-full text-center">
            <div className="text-6xl mb-4">??</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#333] mb-4">?????</h1>
            <p className="text-gray-600 mb-4 text-sm">
              {this.state.error?.message || '????'}
            </p>
            <button
              onClick={this.handleReset}
              className="mc-btn bg-[#4CAF50] text-white px-6 py-3"
            >
              ??
            </button>
            <a
              href="/"
              className="mc-btn bg-white text-black px-6 py-3 ml-2"
            >
              ????
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
