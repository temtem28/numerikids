import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface ChildProfile {
  id: string;
  name: string;
  age: number | null;
  avatar_url: string | null;
  xp_points: number;
  coins: number;
  streak_days: number;
  grade_level: string | null;
  parent_id: string;
  household_id: string | null;
  last_active: string | null;
}

interface ChildGoal {
  id: string;
  goal_type: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  deadline: string | null;
  status: string;
  reward_coins: number | null;
}

interface ChildSession {
  token: string;
  child: ChildProfile;
  goals: ChildGoal[];
  level: number;
  xpToNextLevel: number;
  xpProgress: number;
}

interface ChildSessionContextType {
  session: ChildSession | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateGoalProgress: (goalId: string, newValue: number) => void;
}

const ChildSessionContext = createContext<ChildSessionContextType | undefined>(undefined);

// Calculate level from XP
function calculateLevel(xp: number): { level: number; xpToNextLevel: number; xpProgress: number } {
  // Each level requires progressively more XP
  // Level 1: 0-100, Level 2: 100-250, Level 3: 250-450, etc.
  let level = 1;
  let totalXpForLevel = 0;
  let xpForCurrentLevel = 100;
  
  while (xp >= totalXpForLevel + xpForCurrentLevel) {
    totalXpForLevel += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = Math.floor(xpForCurrentLevel * 1.5);
  }
  
  const xpInCurrentLevel = xp - totalXpForLevel;
  const xpProgress = (xpInCurrentLevel / xpForCurrentLevel) * 100;
  
  return {
    level,
    xpToNextLevel: xpForCurrentLevel - xpInCurrentLevel,
    xpProgress
  };
}

export function ChildSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ChildSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const validateSession = async () => {
    const token = localStorage.getItem('childSessionToken');
    const storedProfile = localStorage.getItem('childProfile');

    if (!token || !storedProfile) {
      setLoading(false);
      return;
    }

    try {
      let childId: string;
      try {
        childId = JSON.parse(storedProfile).id;
      } catch {
        localStorage.removeItem('childSessionToken');
        localStorage.removeItem('childProfile');
        setSession(null);
        setLoading(false);
        return;
      }

      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .eq('is_active', true)
        .single();

      if (childError || !childData) {
        localStorage.removeItem('childSessionToken');
        localStorage.removeItem('childProfile');
        setSession(null);
        setLoading(false);
        return;
      }

      const { data: goalsData } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('child_id', childData.id)
        .in('status', ['active', 'in_progress']);

      const goals = goalsData || [];
      const levelInfo = calculateLevel(childData.xp_points || 0);

      setSession({
        token,
        child: childData,
        goals,
        ...levelInfo
      });
    } catch (err) {
      console.error('Session validation error:', err);
      setError('Erreur de validation de session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    validateSession();
  }, []);

  const logout = async () => {
    localStorage.removeItem('childSessionToken');
    localStorage.removeItem('childProfile');
    setSession(null);
  };

  const refreshSession = async () => {
    setLoading(true);
    await validateSession();
  };

  const updateGoalProgress = (goalId: string, newValue: number) => {
    if (!session) return;
    
    setSession({
      ...session,
      goals: session.goals.map(goal => 
        goal.id === goalId ? { ...goal, current_value: newValue } : goal
      )
    });
  };

  return (
    <ChildSessionContext.Provider value={{ 
      session, 
      loading, 
      error, 
      logout, 
      refreshSession,
      updateGoalProgress 
    }}>
      {children}
    </ChildSessionContext.Provider>
  );
}

export function useChildSession() {
  const context = useContext(ChildSessionContext);
  if (context === undefined) {
    throw new Error('useChildSession must be used within a ChildSessionProvider');
  }
  return context;
}
