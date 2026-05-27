import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to monitoring service (if configured)
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // In production, you would send this to a service like Sentry, LogRocket, etc.
    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Store in localStorage for debugging (limited to last 5 errors)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('numerikids_error_logs') || '[]');
      existingLogs.unshift(errorLog);
      localStorage.setItem('numerikids_error_logs', JSON.stringify(existingLogs.slice(0, 5)));
    } catch {
      // Silent fail for localStorage issues
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo } = this.state;
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Unknown Error'}`);
    const body = encodeURIComponent(`
Bonjour,

J'ai rencontré une erreur sur NumériKids.

**Message d'erreur:**
${error?.message || 'Non disponible'}

**URL:**
${window.location.href}

**Navigateur:**
${navigator.userAgent}

**Date:**
${new Date().toLocaleString('fr-FR')}

**Détails techniques:**
${error?.stack || 'Non disponible'}

Merci de votre aide!
    `);
    
    window.open(`mailto:support@numerikids.fr?subject=${subject}&body=${body}`, '_blank');
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, showDetails } = this.state;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            {/* Main Error Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-6 border-b border-red-500/20">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Oups!</h1>
                    <p className="text-red-300 text-sm">Une erreur inattendue s'est produite</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-slate-300 mb-2">
                    Ne t'inquiète pas, ce n'est pas de ta faute!
                  </p>
                  <p className="text-slate-400 text-sm">
                    Notre équipe a été notifiée et travaille sur une solution.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={this.handleReload}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Accueil
                  </Button>
                </div>

                {/* Report Bug Button */}
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Signaler ce problème
                </Button>

                {/* Technical Details (Collapsible) */}
                {error && (
                  <div className="border-t border-slate-700/50 pt-4">
                    <button
                      onClick={this.toggleDetails}
                      className="flex items-center justify-between w-full text-sm text-slate-500 hover:text-slate-400 transition-colors"
                    >
                      <span>Détails techniques</span>
                      {showDetails ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {showDetails && (
                      <div className="mt-3 p-3 bg-slate-800/50 rounded-lg overflow-auto max-h-48">
                        <p className="text-xs font-mono text-red-400 mb-2">
                          {error.message}
                        </p>
                        {error.stack && (
                          <pre className="text-xs font-mono text-slate-500 whitespace-pre-wrap break-all">
                            {error.stack.split('\n').slice(0, 5).join('\n')}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Helpful Tips */}
            <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">
                Conseils utiles:
              </h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Essaie de rafraîchir la page</li>
                <li>• Vérifie ta connexion internet</li>
                <li>• Vide le cache de ton navigateur</li>
                <li>• Essaie un autre navigateur</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
