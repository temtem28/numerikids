import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, Award } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ReportData {
  children: {
    childId: string;
    childName: string;
    periodStats: {
      avgQuizScore: number;
      lessonsCompleted: number;
      xpEarned: number;
      achievementsEarned: number;
    };
    performance: {
      strengths: { subject: string; avgScore: number }[];
      struggles: { subject: string; avgScore: number }[];
    };
  }[];
  summary: {
    averageQuizScore: number;
  };
}

interface ReportScoresChartProps {
  data: ReportData;
}

export default function ReportScoresChart({ data }: ReportScoresChartProps) {
  // Collect all subjects from all children
  const allSubjects = new Set<string>();
  data.children.forEach(child => {
    child.performance.strengths.forEach(s => allSubjects.add(s.subject));
    child.performance.struggles.forEach(s => allSubjects.add(s.subject));
  });

  // Create radar data
  const radarData = Array.from(allSubjects).map(subject => {
    const entry: any = { subject };
    data.children.forEach(child => {
      const strength = child.performance.strengths.find(s => s.subject === subject);
      const struggle = child.performance.struggles.find(s => s.subject === subject);
      entry[child.childName] = strength?.avgScore || struggle?.avgScore || 50;
    });
    return entry;
  });

  // If no subject data, show default categories
  const defaultRadarData = radarData.length > 0 ? radarData : [
    { subject: 'Logique' },
    { subject: 'Programmation' },
    { subject: 'Créativité' },
    { subject: 'Quiz' },
    { subject: 'Vitesse' }
  ].map(item => {
    const entry: any = { ...item };
    data.children.forEach(child => {
      entry[child.childName] = child.periodStats.avgQuizScore || 50;
    });
    return entry;
  });

  const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{payload[0]?.payload?.subject}</p>
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
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Target className="w-5 h-5 text-green-400" />
          Performance par compétence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={defaultRadarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#475569" />
              <PolarAngleAxis 
                dataKey="subject" 
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
              {data.children.map((child, idx) => (
                <Radar
                  key={child.childId}
                  name={child.childName}
                  dataKey={child.childName}
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-green-400">{data.summary.averageQuizScore}%</p>
            <p className="text-xs text-slate-400">Score moyen</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-bold text-cyan-400">
              {data.children.reduce((sum, c) => sum + c.periodStats.lessonsCompleted, 0)}
            </p>
            <p className="text-xs text-slate-400">Leçons</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-bold text-purple-400">
              {data.children.reduce((sum, c) => sum + c.periodStats.achievementsEarned, 0)}
            </p>
            <p className="text-xs text-slate-400">Badges</p>
          </div>
        </div>

        {/* Individual scores */}
        <div className="mt-4 space-y-2">
          {data.children.map((child, idx) => (
            <div key={child.childId} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="text-sm text-slate-300">{child.childName}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">
                  Score: <span className="text-white font-medium">{child.periodStats.avgQuizScore}%</span>
                </span>
                <span className="text-slate-400">
                  XP: <span className="text-yellow-400 font-medium">+{child.periodStats.xpEarned}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
