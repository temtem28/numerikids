import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Code, Blocks, Brain } from 'lucide-react';
import SkillProgressionChart from './SkillProgressionChart';
import SagaProgressChart from './SagaProgressChart';
import ExerciseTimeChart from './ExerciseTimeChart';
import AIHelpAnalytics from './AIHelpAnalytics';
import { useToast } from '@/hooks/use-toast';

export default function ComprehensiveAnalytics({ childId }: { childId?: string }) {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [childId]);

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch lesson analytics
    const { data: lessons } = await supabase
      .from('lesson_analytics')
      .select('*')
      .eq('child_id', childId || user.id);

    // Fetch AI help requests
    const { data: helpRequests } = await supabase
      .from('ai_help_requests')
      .select('*')
      .eq('child_id', childId || user.id);

    // Process data for charts
    const sagaProgress = processSagaData(lessons || []);
    const exerciseTime = processExerciseTime(lessons || []);
    const skillData = calculateSkillProgression(lessons || []);
    const helpTopics = processHelpTopics(helpRequests || []);

    setAnalyticsData({ sagaProgress, exerciseTime, skillData, helpTopics });
    setLoading(false);
  };

  const processSagaData = (lessons: any[]) => {
    const sagas = ['Cyber Aventure', 'Aventure Code', 'Robot Academy'];
    return sagas.map((saga, idx) => ({
      sagaName: saga,
      completed: lessons.filter(l => l.saga_name === saga && l.completed).length,
      total: 10,
      color: ['bg-gradient-to-r from-cyan-500 to-blue-500', 'bg-gradient-to-r from-purple-500 to-pink-500', 'bg-gradient-to-r from-green-500 to-emerald-500'][idx]
    }));
  };

  const processExerciseTime = (lessons: any[]) => {
    const types = [
      { type: 'Python', key: 'python', icon: Code, color: 'text-cyan-400' },
      { type: 'Scratch', key: 'scratch', icon: Blocks, color: 'text-purple-400' },
      { type: 'Quiz', key: 'quiz', icon: Brain, color: 'text-pink-400' }
    ];
    
    return types.map(t => ({
      ...t,
      minutes: Math.floor(lessons.filter(l => l.exercise_type === t.key).reduce((sum, l) => sum + (l.time_spent_seconds || 0), 0) / 60)
    }));
  };

  const calculateSkillProgression = (lessons: any[]) => {
    return [
      { skill: 'Logique', current: 75, benchmark: 65, color: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
      { skill: 'Algorithmique', current: 68, benchmark: 60, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
      { skill: 'Résolution de problèmes', current: 82, benchmark: 70, color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
    ];
  };

  const processHelpTopics = (requests: any[]) => {
    const topics: { [key: string]: number } = {};
    requests.forEach(r => {
      topics[r.topic || 'Autre'] = (topics[r.topic || 'Autre'] || 0) + 1;
    });
    
    const total = requests.length;
    return Object.entries(topics)
      .map(([topic, count]) => ({ topic, count, percentage: (count / total) * 100 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const exportReport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-progress-report', {
        body: { childId, analyticsData }
      });

      if (error) throw error;

      toast({ title: 'Rapport exporté!', description: 'Le rapport a été téléchargé avec succès.' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible d\'exporter le rapport', variant: 'destructive' });
    }
    setExporting(false);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Analyses détaillées
        </h2>
        <Button onClick={exportReport} disabled={exporting} className="bg-gradient-to-r from-cyan-500 to-purple-500">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
          Exporter le rapport
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SagaProgressChart sagaData={analyticsData.sagaProgress} />
        <ExerciseTimeChart exerciseData={analyticsData.exerciseTime} />
        <SkillProgressionChart skills={analyticsData.skillData} />
        <AIHelpAnalytics helpTopics={analyticsData.helpTopics} />
      </div>
    </div>
  );
}
