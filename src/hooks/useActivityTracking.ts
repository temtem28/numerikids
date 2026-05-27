import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useActivityTracking(childId: string | null) {
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  const startSession = async (lessonId: string, lessonTitle: string, moduleName: string) => {
    if (!childId) return null;

    const { data, error } = await supabase
      .from('learning_sessions')
      .insert({
        child_id: childId,
        lesson_id: lessonId,
        lesson_title: lessonTitle,
        module_name: moduleName,
        status: 'in_progress',
      })
      .select()
      .single();

    if (data) {
      setCurrentSession(data.id);
      return data.id;
    }
    return null;
  };

  const endSession = async (sessionId: string, status: 'completed' | 'abandoned' = 'completed') => {
    const { data: session } = await supabase
      .from('learning_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    if (session) {
      const duration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
      
      await supabase
        .from('learning_sessions')
        .update({
          completed_at: new Date().toISOString(),
          duration_seconds: duration,
          status,
        })
        .eq('id', sessionId);
    }

    setCurrentSession(null);
  };

  const logExercise = async (exerciseId: string, exerciseType: string, timeSpent: number, score: number, completed: boolean) => {
    if (!childId) return;

    await supabase.from('exercise_completions').insert({
      child_id: childId,
      session_id: currentSession,
      exercise_id: exerciseId,
      exercise_type: exerciseType,
      time_spent_seconds: timeSpent,
      score,
      completed,
    });
  };

  const logQuiz = async (quizId: string, quizTitle: string, totalQuestions: number, correctAnswers: number, timeSpent: number, answers: any) => {
    if (!childId) return;

    const score = (correctAnswers / totalQuestions) * 100;

    await supabase.from('quiz_attempts').insert({
      child_id: childId,
      session_id: currentSession,
      quiz_id: quizId,
      quiz_title: quizTitle,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      score,
      time_spent_seconds: timeSpent,
      answers,
    });
  };

  const logActivity = async (activityType: string, activityData: any, pointsEarned: number = 0) => {
    if (!childId) return;

    await supabase.from('activity_logs').insert({
      child_id: childId,
      activity_type: activityType,
      activity_data: activityData,
      points_earned: pointsEarned,
    });
  };

  return {
    currentSession,
    startSession,
    endSession,
    logExercise,
    logQuiz,
    logActivity,
  };
}
