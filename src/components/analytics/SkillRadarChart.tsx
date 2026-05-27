import { Card } from '@/components/ui/card';
import { Target } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface SkillData {
  skill: string;
  current: number;
  benchmark: number;
  fullMark: number;
}

interface Props {
  data: SkillData[];
  loading?: boolean;
}

export default function SkillRadarChart({ data, loading }: Props) {
  if (loading) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-purple-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-purple-400 font-medium mb-2">{payload[0]?.payload?.skill}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-purple-500/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">Compétences</h3>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ fill: '#94a3b8', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
            />
            <Radar
              name="Niveau actuel"
              dataKey="current"
              stroke="#a855f7"
              fill="#a855f7"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Radar
              name="Moyenne d'âge"
              dataKey="benchmark"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.2}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.slice(0, 4).map((skill, idx) => {
          const diff = skill.current - skill.benchmark;
          const isAbove = diff > 0;
          return (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
              <span className="text-sm text-slate-300 truncate">{skill.skill}</span>
              <span className={`text-xs font-medium ${isAbove ? 'text-green-400' : 'text-orange-400'}`}>
                {isAbove ? '+' : ''}{diff}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
