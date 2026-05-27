import { supabase } from '@/lib/supabase';

export interface ReportOptions {
  childIds: string[];
  startDate: string;
  endDate: string;
  format: 'csv' | 'pdf';
  includeCharts: boolean;
  includeAchievements: boolean;
  includeInsights: boolean;
}

export async function generateCSVReport(options: ReportOptions) {
  const { childIds, startDate, endDate } = options;
  
  // Fetch all data
  const [sessions, exercises, quizzes, achievements] = await Promise.all([
    fetchSessions(childIds, startDate, endDate),
    fetchExercises(childIds, startDate, endDate),
    fetchQuizzes(childIds, startDate, endDate),
    options.includeAchievements ? fetchAchievements(childIds) : Promise.resolve([])
  ]);

  let csv = 'Type,Child,Date,Activity,Duration (min),Score,Points,XP\n';
  
  sessions.forEach(s => {
    csv += `Session,${s.child_name},${s.date},${s.lesson_title},${s.duration},N/A,${s.points_earned},${s.xp_earned}\n`;
  });
  
  exercises.forEach(e => {
    csv += `Exercise,${e.child_name},${e.date},${e.exercise_title},${e.time_spent},${e.score}%,N/A,N/A\n`;
  });
  
  quizzes.forEach(q => {
    csv += `Quiz,${q.child_name},${q.date},${q.quiz_title},${q.time_taken},${q.score}%,N/A,N/A\n`;
  });

  downloadCSV(csv, `activity-report-${startDate}-to-${endDate}.csv`);
}

async function fetchSessions(childIds: string[], startDate: string, endDate: string) {
  const { data } = await supabase
    .from('learning_sessions')
    .select('*, children(name)')
    .in('child_id', childIds)
    .gte('started_at', startDate)
    .lte('started_at', endDate);
  
  return (data || []).map(s => ({
    child_name: s.children?.name || 'Unknown',
    date: new Date(s.started_at).toLocaleDateString(),
    lesson_title: s.lesson_title,
    duration: Math.round((s.duration || 0) / 60),
    points_earned: s.points_earned || 0,
    xp_earned: s.xp_earned || 0
  }));
}

async function fetchExercises(childIds: string[], startDate: string, endDate: string) {
  const { data } = await supabase
    .from('exercise_completions')
    .select('*, children(name)')
    .in('child_id', childIds)
    .gte('completed_at', startDate)
    .lte('completed_at', endDate);
  
  return (data || []).map(e => ({
    child_name: e.children?.name || 'Unknown',
    date: new Date(e.completed_at).toLocaleDateString(),
    exercise_title: e.exercise_title,
    time_spent: Math.round((e.time_spent || 0) / 60),
    score: e.score || 0
  }));
}

async function fetchQuizzes(childIds: string[], startDate: string, endDate: string) {
  const { data } = await supabase
    .from('quiz_attempts')
    .select('*, children(name)')
    .in('child_id', childIds)
    .gte('completed_at', startDate)
    .lte('completed_at', endDate);
  
  return (data || []).map(q => ({
    child_name: q.children?.name || 'Unknown',
    date: new Date(q.completed_at).toLocaleDateString(),
    quiz_title: q.quiz_title,
    time_taken: Math.round((q.time_taken || 0) / 60),
    score: q.score || 0
  }));
}

async function fetchAchievements(childIds: string[]) {
  const { data } = await supabase
    .from('achievements')
    .select('*, children(name)')
    .in('child_id', childIds);
  
  return data || [];
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
