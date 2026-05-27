import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, Brain, Target } from 'lucide-react';

export default function LearningMetrics() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgError: 0,
    totalAdjustments: 0,
    modelVersion: 1,
    improvementRate: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: feedbackData } = await supabase
      .from('learning_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (feedbackData && feedbackData.length > 0) {
      const avgError = feedbackData.reduce((sum, f) => sum + (f.prediction_error || 0), 0) / feedbackData.length;
      const totalAdj = feedbackData.reduce((sum, f) => sum + Math.abs(f.adjustment_applied || 0), 0);
      const maxVersion = Math.max(...feedbackData.map(f => f.model_version || 1));
      
      const recentErrors = feedbackData.slice(0, 10).map(f => f.prediction_error || 0);
      const olderErrors = feedbackData.slice(10, 20).map(f => f.prediction_error || 0);
      const recentAvg = recentErrors.reduce((a, b) => a + b, 0) / recentErrors.length;
      const olderAvg = olderErrors.reduce((a, b) => a + b, 0) / olderErrors.length;
      const improvement = olderAvg > 0 ? ((olderAvg - recentAvg) / olderAvg * 100) : 0;

      setStats({
        avgError,
        totalAdjustments: totalAdj,
        modelVersion: maxVersion,
        improvementRate: improvement
      });
    }

    setFeedback(feedbackData || []);
  };

  const chartData = feedback.slice(0, 20).reverse().map((f, i) => ({
    index: i + 1,
    error: f.prediction_error || 0,
    adjustment: (f.adjustment_applied || 0) * 100
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Learning System Metrics</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Avg Prediction Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgError.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Lower is better</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Model Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v{stats.modelVersion}</div>
            <p className="text-xs text-muted-foreground mt-1">Current iteration</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Improvement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{stats.improvementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Error reduction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdjustments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative learning</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Progress Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" label={{ value: 'Feedback Events', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Error / Adjustment', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="error" stroke="#ef4444" name="Prediction Error %" />
              <Line type="monotone" dataKey="adjustment" stroke="#3b82f6" name="Adjustment Applied" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
