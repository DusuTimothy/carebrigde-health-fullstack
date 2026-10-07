import React from 'react';
import Button from './Button.jsx';

/* Catches render errors so the demo never shows a blank white page. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-accent-soft px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-error-soft text-error-ink">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink">Something went wrong</h1>
            <p className="mt-1 max-w-md text-sm text-ink-secondary">
              An unexpected error interrupted this page. Your data is safe — try reloading, or reset the demo data.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => window.location.reload()}>Reload page</Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  localStorage.removeItem('carebridge_db_v2');
                } catch {
                  /* ignore */
                }
                window.location.reload();
              }}
            >
              Reset demo data
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}