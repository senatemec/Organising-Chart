import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }
      return (
        <div className="modal-overlay animate-fade-in" onClick={this.handleReset}>
          <div 
            className="glass-panel w-full max-w-md rounded-2xl border border-red-200 p-6 bg-white shadow-2xl space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {this.props.title || 'Unable to Display Event Details'}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {this.state.error?.message || 'A temporary issue prevented this window from rendering.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="btn-primary text-xs py-2 px-5 font-bold inline-flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
