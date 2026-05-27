import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import type { ChildProgressLessonRow } from '@/types/database.types';
import { getChildSessionProfile, CHILD_SESSION_EVENT } from '@/utils/childSession';
import { loadLocalSagaProgress, addLocalCompletedLesson } from '@/utils/childLocalProgress';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  completedLessons: { [sagaId: string]: number[] };
  currentLesson: { [sagaId: string]: number };
  completeLesson: (sagaId: string, lessonId: number, xpReward?: number) => Promise<void>;
  setCurrentLesson: (sagaId: string, lessonId: number) => void;
  refreshProgress: () => Promise<void>;
  loading: boolean;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  completedLessons: {},
  currentLesson: {},
  completeLesson: async () => {},
  setCurrentLesson: () => {},
  refreshProgress: async () => {},
  loading: false,
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, currentChild } = useAuth();
  const [sessionChildProfile, setSessionChildProfile] = useState(() => getChildSessionProfile());
  const progressChild = user ? currentChild : sessionChildProfile;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<{ [sagaId: string]: number[] }>({});
  const [currentLesson, setCurrentLessonState] = useState<{ [sagaId: string]: number }>({});
  const [loading, setLoading] = useState(false);

  const refreshSessionChild = useCallback(() => {
    setSessionChildProfile(getChildSessionProfile());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onChange = () => refreshSessionChild();
    window.addEventListener('storage', onChange);
    window.addEventListener(CHILD_SESSION_EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener(CHILD_SESSION_EVENT, onChange);
    };
  }, [refreshSessionChild]);

  const loadProgress = useCallback(async () => {
    if (!progressChild) return;

    setLoading(true);
    try {
      if (!user) {
        setCompletedLessons(loadLocalSagaProgress(progressChild.id));
        return;
      }

      const { data, error } = await supabase
        .from('child_progress')
        .select('*')
        .eq('child_id', progressChild.id)
        .eq('completed', true);

      if (!error && data?.length) {
        const progressBySaga: { [sagaId: string]: number[] } = {};

        (data as ChildProgressLessonRow[]).forEach((row) => {
          const sagaId = row.saga_id || 'default';
          if (!progressBySaga[sagaId]) {
            progressBySaga[sagaId] = [];
          }
          const lid = row.lesson_id;
          if (lid != null) progressBySaga[sagaId].push(parseInt(String(lid), 10));
        });

        setCompletedLessons(progressBySaga);
      } else {
        if (error) console.warn('child_progress (serveur):', error.message);
        setCompletedLessons(loadLocalSagaProgress(progressChild.id));
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setCompletedLessons(loadLocalSagaProgress(progressChild.id));
    } finally {
      setLoading(false);
    }
  }, [progressChild, user]);

  useEffect(() => {
    if (progressChild) {
      loadProgress();
    } else {
      setCompletedLessons({});
      setCurrentLessonState({});
    }
  }, [progressChild?.id, user?.id, loadProgress]);

  const refreshProgress = async () => {
    await loadProgress();
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const completeLesson = async (sagaId: string, lessonId: number, xpReward: number = 50) => {
    if (!progressChild) {
      toast({
        title: 'Erreur',
        description: user ? 'Sélectionne un enfant sur le tableau de bord parent.' : 'Reconnecte-toi avec ton code PIN.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (!user) {
        addLocalCompletedLesson(progressChild.id, sagaId, lessonId);
        setCompletedLessons((prev) => ({
          ...prev,
          [sagaId]: [...(prev[sagaId] || []), lessonId].filter((v, i, a) => a.indexOf(v) === i),
        }));
        return;
      }

      const { error } = await supabase.from('child_progress').upsert(
        {
          child_id: progressChild.id,
          lesson_id: lessonId.toString(),
          saga_id: sagaId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: 'child_id,lesson_id' }
      );

      if (error) {
        console.warn('child_progress upsert:', error.message);
        addLocalCompletedLesson(progressChild.id, sagaId, lessonId);
      }

      setCompletedLessons((prev) => ({
        ...prev,
        [sagaId]: [...(prev[sagaId] || []), lessonId].filter((v, i, a) => a.indexOf(v) === i),
      }));
    } catch (error) {
      console.error('Error completing lesson:', error);
      addLocalCompletedLesson(progressChild.id, sagaId, lessonId);
      setCompletedLessons((prev) => ({
        ...prev,
        [sagaId]: [...(prev[sagaId] || []), lessonId].filter((v, i, a) => a.indexOf(v) === i),
      }));
    }
  };

  const setCurrentLesson = (sagaId: string, lessonId: number) => {
    setCurrentLessonState(prev => ({ ...prev, [sagaId]: lessonId }));
  };

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        completedLessons,
        currentLesson,
        completeLesson,
        setCurrentLesson,
        refreshProgress,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
