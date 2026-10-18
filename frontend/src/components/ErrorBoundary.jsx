import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#0f0e13] font-sans text-white min-h-screen flex flex-col items-center justify-center p-6 selection:bg-violet-500/30">
          <div className="w-full max-w-md bg-[#14121c]/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle size={28} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h2>
            <p className="text-white/60 text-sm mb-6">
              An unexpected error occurred while rendering the page.
            </p>
            {this.state.error?.message && (
              <div className="bg-[#0a090d] border border-white/5 rounded-xl p-3 text-xs text-rose-300 font-mono mb-6 text-left break-all max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw size={16} />
              <span>Return to Login</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
