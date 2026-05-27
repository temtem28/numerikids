import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ActivityTimelineView } from './ActivityTimelineView';
import { WeeklySummaryReport } from './WeeklySummaryReport';
import { ReportExportModal } from './ReportExportModal';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';


interface DetailedActivityViewProps {
  children: any[];
}

export function DetailedActivityView({ children }: DetailedActivityViewProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [activities, setActivities] = useState<any[]>([]);
  const [weekData, setWeekData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);


  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children]);

  useEffect(() => {
    if (selectedChildId) {
      fetchActivities();
      fetchWeeklyData();
    }
  }, [selectedChildId, timeRange]);

  const fetchActivities = async () => {
    setLoading(true);
    const startDate = getStartDate();
    
    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('child_id', selectedChildId)
      .gte('started_at', startDate.toISOString())
      .order('started_at', { ascending: false });

    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('child_id', selectedChildId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    const combined = [
      ...(sessions || []).map(s => ({
        id: s.id,
        type: 'lesson',
        title: s.lesson_title,
        time: new Date(s.started_at),
        duration: s.duration_seconds,
        icon: 'lesson' as const,
      })),
      ...(logs || []).map(l => ({
        id: l.id,
        type: l.activity_type,
        title: l.activity_data?.title || l.activity_type,
        time: new Date(l.created_at),
        points: l.points_earned,
        icon: getIconType(l.activity_type),
      })),
    ].sort((a, b) => b.time.getTime() - a.time.getTime());

    setActivities(combined);
    setLoading(false);
  };

  const fetchWeeklyData = async () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());

    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('*')
      .eq('child_id', selectedChildId)
      .gte('started_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString())
      .eq('status', 'completed');

    const { data: quizzes } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('child_id', selectedChildId)
      .gte('created_at', weekStart.toISOString());

    const totalMinutes = Math.round((sessions || []).reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);
    const lessonsCompleted = sessions?.length || 0;
    const averageScore = quizzes?.length ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length) : 0;

    setWeekData({
      totalMinutes,
      lessonsCompleted,
      averageScore,
      pointsEarned: 0,
      dailyActivity: [],
      progressTrend: [],
      favoriteSubjects: [],
      peakHours: [],
    });
  };

  const getStartDate = () => {
    switch (timeRange) {
      case 'today': return subDays(new Date(), 1);
      case 'week': return subDays(new Date(), 7);
      case 'month': return subDays(new Date(), 30);
    }
  };

  const getIconType = (activityType: string) => {
    if (activityType.includes('achievement')) return 'achievement' as const;
    if (activityType.includes('streak')) return 'streak' as const;
    if (activityType.includes('quiz')) return 'quiz' as const;
    return 'exercise' as const;
  };

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Sélectionner un enfant" />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child.id} value={child.id}>{child.pseudo}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setExportModalOpen(true)} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exporter le rapport
        </Button>
      </div>


      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="summary">Résumé</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activités de {selectedChild?.pseudo}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Chargement...</p>
              ) : activities.length > 0 ? (
                <ActivityTimelineView activities={activities} />
              ) : (
                <p className="text-center text-gray-500 py-8">Aucune activité</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          {weekData && (
            <WeeklySummaryReport childName={selectedChild?.pseudo || ''} weekData={weekData} />
          )}
        </TabsContent>
      </Tabs>

      <ReportExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        children={children.map(c => ({ id: c.id, name: c.pseudo }))}
      />
    </div>
  );
}

