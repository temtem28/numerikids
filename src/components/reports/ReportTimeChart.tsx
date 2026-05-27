import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReportData {
  children: {
    childId: string;
    childName: string;
    periodStats: {
      dailyTimeBreakdown: Record<string, number>;
      totalTimeMinutes: number;
    };
  }[];
}

interface ReportTimeChartProps {
  data: ReportData;
}

export default function ReportTimeChart({ data }: ReportTimeChartProps) {
  // Aggregate daily time across all children
  const dailyData: Record<string, Record<string, number>> = {};
  
  data.children.forEach(child => {
    Object.entries(child.periodStats.dailyTimeBreakdown).forEach(([date, minutes]) => {
      if (!dailyData[date]) {
        dailyData[date] = {};
      }
      dailyData[date][child.childName] = minutes;
    });
  });

  // Convert to chart format
  const chartData = Object.entries(dailyData)
    .map(([date, childData]) => ({
      date,
      displayDate: format(parseISO(date), 'dd/MM', { locale: fr }),
      ...childData,
      total: Object.values(childData).reduce((sum, v) => sum + v, 0)
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14); // Last 14 days

  const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value} min
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Clock className="w-5 h-5 text-cyan-400" />
          Temps d'apprentissage
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#475569' }}
                />
                <YAxis 
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#475569' }}
                  label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
                />
                {data.children.map((child, idx) => (
                  <Bar 
                    key={child.childId}
                    dataKey={child.childName}
                    fill={colors[idx % colors.length]}
                    radius={[4, 4, 0, 0]}
                    stackId="stack"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Pas de données pour cette période</p>
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {data.children.reduce((sum, c) => sum + c.periodStats.totalTimeMinutes, 0)}m
            </p>
            <p className="text-xs text-slate-400">Temps total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {chartData.length > 0 
                ? Math.round(data.children.reduce((sum, c) => sum + c.periodStats.totalTimeMinutes, 0) / chartData.length)
                : 0}m
            </p>
            <p className="text-xs text-slate-400">Moyenne/jour</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
