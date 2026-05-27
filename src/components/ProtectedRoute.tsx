import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasChildSession } from '@/utils/childSession';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Si vrai, un élève connecté (PIN + profil dans localStorage) peut accéder sans session parent Supabase.
   */
  allowChildSession?: boolean;
}

export function ProtectedRoute({ children, allowChildSession = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [childGateReady, setChildGateReady] = useState(!allowChildSession);
  const [childOk, setChildOk] = useState(false);

  useEffect(() => {
    if (!allowChildSession) return;
    setChildOk(hasChildSession());
    setChildGateReady(true);
  }, [allowChildSession, loading, user]);

  if (loading || !childGateReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  if (allowChildSession && childOk) {
    return <>{children}</>;
  }

  if (allowChildSession) {
    return <Navigate to="/login-student" replace />;
  }

  return <Navigate to="/login" replace />;
}
