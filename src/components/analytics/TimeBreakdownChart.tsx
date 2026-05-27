import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

interface TimeData {
  subject: string;
  minutes: number;
  color: string;
}

interface Props {
  data: TimeData[];
  loading?: boolean;
}

const COLORS = ['#06b6d4', '#a855f7', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6'];

export default function TimeBreakdownChart({ data, loading }: Props) {
  if (loading) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-green-500/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </Card>
    );
  }

  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const percentage = ((item.value / totalMinutes) * 100).toFixed(1);
      return (
        <div className="bg-slate-800 border border-green-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{item.name}</p>
          <p className="text-sm text-slate-300">
            {item.value} min ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-green-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Temps par sujet</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-400">
            {hours}h {mins}m
          </p>
          <p className="text-xs text-slate-400">Temps total</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="minutes"
              nameKey="subject"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color || COLORS[idx % COLORS.length] }}
            />
            <span className="text-sm text-slate-300 truncate">{item.subject}</span>
            <span className="text-xs text-slate-400 ml-auto">{item.minutes}m</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
