import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, TrendingDown, Brain, Lightbulb, 
  CheckCircle, AlertTriangle, Star, Target 
} from 'lucide-react';

interface ReportData {
  children: {
    childId: string;
    childName: string;
    performance: {
      strengths: { subject: string; avgScore: number }[];
      struggles: { subject: string; avgScore: number }[];
      overallProgress: 'excellent' | 'good' | 'needs_improvement' | 'no_data';
    };
    recommendations: string[];
  }[];
}

interface ReportStrengthsPanelProps {
  data: ReportData;
}

export default function ReportStrengthsPanel({ data }: ReportStrengthsPanelProps) {
  // Aggregate strengths and struggles across all children
  const allStrengths: Record<string, { count: number; totalScore: number; children: string[] }> = {};
  const allStruggles: Record<string, { count: number; totalScore: number; children: string[] }> = {};
  const allRecommendations: string[] = [];

  data.children.forEach(child => {
    child.performance.strengths.forEach(s => {
      if (!allStrengths[s.subject]) {
        allStrengths[s.subject] = { count: 0, totalScore: 0, children: [] };
      }
      allStrengths[s.subject].count += 1;
      allStrengths[s.subject].totalScore += s.avgScore;
      allStrengths[s.subject].children.push(child.childName);
    });

    child.performance.struggles.forEach(s => {
      if (!allStruggles[s.subject]) {
        allStruggles[s.subject] = { count: 0, totalScore: 0, children: [] };
      }
      allStruggles[s.subject].count += 1;
      allStruggles[s.subject].totalScore += s.avgScore;
      allStruggles[s.subject].children.push(child.childName);
    });

    child.recommendations.forEach(rec => {
      if (!allRecommendations.includes(rec)) {
        allRecommendations.push(rec);
      }
    });
  });

  const sortedStrengths = Object.entries(allStrengths)
    .map(([subject, data]) => ({
      subject,
      avgScore: Math.round(data.totalScore / data.count),
      children: data.children
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  const sortedStruggles = Object.entries(allStruggles)
    .map(([subject, data]) => ({
      subject,
      avgScore: Math.round(data.totalScore / data.count),
      children: data.children
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5);

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-cyan-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Strengths */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Points forts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedStrengths.length > 0 ? (
            sortedStrengths.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">{item.subject}</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    {item.avgScore}%
                  </Badge>
                </div>
                <Progress value={item.avgScore} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400">
                  {item.children.join(', ')}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Pas encore de données</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Struggles */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingDown className="w-5 h-5 text-yellow-400" />
            À améliorer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedStruggles.length > 0 ? (
            sortedStruggles.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-white">{item.subject}</span>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    {item.avgScore}%
                  </Badge>
                </div>
                <Progress value={item.avgScore} className="h-2 bg-slate-700" />
                <p className="text-xs text-slate-400">
                  {item.children.join(', ')}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50 text-green-400" />
              <p className="text-sm">Aucune difficulté identifiée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {allRecommendations.length > 0 ? (
            allRecommendations.slice(0, 5).map((rec, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <div className="p-1 bg-cyan-500/20 rounded">
                  <Brain className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Continuez ainsi !</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Progress Summary */}
      <Card className="lg:col-span-3 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Résumé de la progression</h3>
                <p className="text-slate-400">
                  {data.children.length} enfant{data.children.length > 1 ? 's' : ''} suivi{data.children.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {data.children.map(child => {
                const progressColors = {
                  excellent: 'bg-green-500/20 text-green-400 border-green-500/30',
                  good: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                  needs_improvement: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                  no_data: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                };
                const progressLabels = {
                  excellent: 'Excellent',
                  good: 'Bon',
                  needs_improvement: 'À améliorer',
                  no_data: 'Pas de données'
                };

                return (
                  <Badge 
                    key={child.childId}
                    className={`${progressColors[child.performance.overallProgress]} px-3 py-1`}
                  >
                    {child.childName}: {progressLabels[child.performance.overallProgress]}
                  </Badge>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
