import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface VariableImpactChartProps {
  data: any[];
  metricType: 'open_rate' | 'click_rate';
}

export function VariableImpactChart({ data, metricType }: VariableImpactChartProps) {
  const chartData = data
    .filter(item => item.metric_type === metricType)
    .map(item => ({
      name: `${item.variable.variable_name}: ${item.value.value_label}`,
      impact: parseFloat(item.impact_score || 0),
      performance: parseFloat(item.avg_performance || 0),
      sampleSize: item.sample_size
    }))
    .sort((a, b) => b.impact - a.impact);

  const getColor = (impact: number) => {
    if (impact > 2) return '#10b981'; // green
    if (impact > 0) return '#3b82f6'; // blue
    if (impact > -2) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const topPerformer = chartData[0];
  const bottomPerformer = chartData[chartData.length - 1];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {metricType === 'open_rate' ? 'Open Rate' : 'Click Rate'} Impact Analysis
        </h3>
        <div className="flex gap-4">
          {topPerformer && (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm">
                Best: <strong>{topPerformer.name}</strong> (+{topPerformer.impact.toFixed(2)}%)
              </span>
            </div>
          )}
          {bottomPerformer && (
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-sm">
                Worst: <strong>{bottomPerformer.name}</strong> ({bottomPerformer.impact.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
          <YAxis label={{ value: 'Impact (%)', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border rounded shadow-lg">
                    <p className="font-semibold">{data.name}</p>
                    <p className="text-sm">Impact: {data.impact.toFixed(2)}%</p>
                    <p className="text-sm">Avg Performance: {data.performance.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground">Sample: {data.sampleSize}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="impact" name="Impact Score (%)">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.impact)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}