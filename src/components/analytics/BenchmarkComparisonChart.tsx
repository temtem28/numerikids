import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface BenchmarkData {
  category: string;
  childScore: number;
  benchmark: number;
  percentile?: number;
}

interface Props {
  data: BenchmarkData[];
  childAge?: number;
  loading?: boolean;
}

export default function BenchmarkComparisonChart({ data, childAge, loading }: Props) {
  if (loading) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-orange-500/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const childScore = payload.find((p: any) => p.dataKey === 'childScore')?.value || 0;
      const benchmark = payload.find((p: any) => p.dataKey === 'benchmark')?.value || 0;
      const diff = childScore - benchmark;
      
      return (
        <div className="bg-slate-800 border border-orange-500/30 rounded-lg p-3 shadow-xl">
          <p className="text-orange-400 font-medium mb-2">{label}</p>
          <p className="text-sm text-cyan-400">Votre enfant: {childScore}%</p>
          <p className="text-sm text-slate-400">Moyenne {childAge || 8} ans: {benchmark}%</p>
          <div className={`mt-2 pt-2 border-t border-slate-700 text-sm font-medium ${
            diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'
          }`}>
            {diff > 0 ? '+' : ''}{diff}% par rapport à la moyenne
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate overall performance
  const avgChildScore = data.reduce((sum, d) => sum + d.childScore, 0) / data.length;
  const avgBenchmark = data.reduce((sum, d) => sum + d.benchmark, 0) / data.length;
  const overallDiff = avgChildScore - avgBenchmark;

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-orange-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">Comparaison par âge</h3>
        </div>
        <div className="flex items-center gap-2">
          {overallDiff > 5 ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : overallDiff < -5 ? (
            <TrendingDown className="w-5 h-5 text-red-400" />
          ) : (
            <Minus className="w-5 h-5 text-slate-400" />
          )}
          <span className={`text-sm font-medium ${
            overallDiff > 5 ? 'text-green-400' : overallDiff < -5 ? 'text-red-400' : 'text-slate-400'
          }`}>
            {overallDiff > 0 ? '+' : ''}{overallDiff.toFixed(1)}% global
          </span>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="category" 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
            />
            <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" />
            <Bar 
              dataKey="childScore" 
              name="Votre enfant" 
              fill="#06b6d4" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar 
              dataKey="benchmark" 
              name={`Moyenne ${childAge || 8} ans`}
              fill="#64748b" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
        <p className="text-sm text-slate-300">
          {overallDiff > 10 ? (
            <>Excellent ! Votre enfant dépasse largement la moyenne de son groupe d'âge.</>
          ) : overallDiff > 0 ? (
            <>Très bien ! Votre enfant est au-dessus de la moyenne pour son âge.</>
          ) : overallDiff > -10 ? (
            <>Votre enfant progresse normalement pour son âge. Continuez ainsi !</>
          ) : (
            <>Quelques domaines nécessitent plus d'attention. Consultez les recommandations.</>
          )}
        </p>
      </div>
    </Card>
  );
}
