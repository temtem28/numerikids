import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, Target, AlertCircle, CheckCircle } from 'lucide-react';

export default function PredictionDashboard() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictions();
    loadAccuracy();
  }, []);

  const loadPredictions = async () => {
    const { data } = await supabase
      .from('email_predictions')
      .select('*')
      .not('actual_open_rate', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);
    
    setPredictions(data || []);
    setLoading(false);
  };

  const loadAccuracy = async () => {
    const { data } = await supabase.functions.invoke('email-predictions', {
      body: { action: 'get_accuracy' }
    });
    setAccuracy(data);
  };

  const scatterData = predictions.map(p => ({
    predicted: p.predicted_open_rate * 100,
    actual: p.actual_open_rate * 100,
    name: new Date(p.created_at).toLocaleDateString()
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accuracy ? `${(accuracy.overall_accuracy * 100).toFixed(1)}%` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Based on {accuracy?.total_predictions || 0} predictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Rate MAE</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accuracy ? `${(accuracy.open_rate_mae * 100).toFixed(2)}%` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Mean absolute error</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click Rate MAE</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accuracy ? `${(accuracy.click_rate_mae * 100).toFixed(2)}%` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Mean absolute error</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accuracy ? `${(accuracy.avg_confidence * 100).toFixed(1)}%` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Model confidence</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Predicted vs Actual Open Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="predicted" name="Predicted" unit="%" />
              <YAxis dataKey="actual" name="Actual" unit="%" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Predictions" data={scatterData} fill="#8884d8" />
              <Line type="monotone" dataKey="predicted" stroke="#ff7300" strokeDasharray="5 5" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}