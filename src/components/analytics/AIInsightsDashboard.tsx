import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Clock, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import PerformanceOverview from './PerformanceOverview';
import StrugglingAreasPanel from './StrugglingAreasPanel';
import RecommendationsPanel from './RecommendationsPanel';
import PredictiveAnalytics from './PredictiveAnalytics';

interface AIInsightsDashboardProps {
  childId: string;
  dateRange?: { start: Date; end: Date };
}

export default function AIInsightsDashboard({ childId, dateRange }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [learningData, setLearningData] = useState<any>(null);

  useEffect(() => {
    fetchLearningData();
  }, [childId, dateRange]);

  const fetchLearningData = async () => {
    try {
      const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = dateRange?.end || new Date();

      const [sessions, exercises, quizzes, achievements] = await Promise.all([
        supabase.from('learning_sessions').select('*').eq('child_id', childId)
          .gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString()),
        supabase.from('user_progress').select('*').eq('user_id', childId)
          .gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString()),
        supabase.from('quiz_answers').select('*').eq('user_id', childId)
          .gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString()),
        supabase.from('user_achievements').select('*').eq('user_id', childId)
      ]);

      setLearningData({
        sessions: sessions.data || [],
        exercises: exercises.data || [],
        quizzes: quizzes.data || [],
        achievements: achievements.data || [],
        timeframe: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      });
    } catch (error) {
      console.error('Error fetching learning data:', error);
    }
  };

  const generateInsights = async () => {
    if (!learningData) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('learning-insights-ai', {
        body: { childId, learningData, analysisType: 'comprehensive' }
      });

      if (error) throw error;
      setInsights(data.insights);
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-500" />
            AI Learning Insights
          </h2>
          <p className="text-muted-foreground mt-1">
            Powered by advanced AI analysis
          </p>
        </div>
        <Button onClick={generateInsights} disabled={loading || !learningData}>
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </Button>
      </div>

      {insights && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="struggles">Struggles</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PerformanceOverview insights={insights} />
          </TabsContent>

          <TabsContent value="struggles">
            <StrugglingAreasPanel strugglingAreas={insights.strugglingAreas} />
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendationsPanel recommendations={insights.recommendations} />
          </TabsContent>

          <TabsContent value="predictions">
            <PredictiveAnalytics predictions={insights.predictions} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}