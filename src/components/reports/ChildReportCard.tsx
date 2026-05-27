import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Clock, BookOpen, Trophy, Zap, Flame, Target,
  TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Star
} from 'lucide-react';

interface ChildReport {
  childId: string;
  childName: string;
  childAge?: number;
  avatarUrl?: string;
  currentXP: number;
  currentCoins: number;
  currentStreak: number;
  longestStreak: number;
  periodStats: {
    totalTimeMinutes: number;
    dailyTimeBreakdown: Record<string, number>;
    averageTimePerDay: number;
    lessonsCompleted: number;
    quizzesTaken: number;
    avgQuizScore: number;
    xpEarned: number;
    achievementsEarned: number;
  };
  performance: {
    strengths: { subject: string; avgScore: number }[];
    struggles: { subject: string; avgScore: number }[];
    overallProgress: 'excellent' | 'good' | 'needs_improvement' | 'no_data';
  };
  recommendations: string[];
}

interface ChildReportCardProps {
  child: ChildReport;
}

export default function ChildReportCard({ child }: ChildReportCardProps) {
  const level = Math.floor(child.currentXP / 100) + 1;
  const xpProgress = child.currentXP % 100;

  const getProgressBadge = () => {
    switch (child.performance.overallProgress) {
      case 'excellent':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Star className="w-3 h-3 mr-1" />
            Excellent
          </Badge>
        );
      case 'good':
        return (
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Bon
          </Badge>
        );
      case 'needs_improvement':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            À améliorer
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            Pas de données
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {child.avatarUrl ? (
                <img 
                  src={child.avatarUrl} 
                  alt={child.childName}
                  className="w-16 h-16 rounded-full border-4 border-white/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white border-4 border-white/20">
                  {child.childName.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                Nv.{level}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">{child.childName}</h3>
              <p className="text-slate-400 text-sm">
                {child.childAge ? `${child.childAge} ans • ` : ''}
                {child.currentXP} XP total
              </p>
              <div className="flex items-center gap-2 mt-1">
                {getProgressBadge()}
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Flame className="w-6 h-6 text-orange-400" />
              <span className="text-2xl font-bold text-white">{child.currentStreak}</span>
            </div>
            <p className="text-xs text-slate-400">jours de série</p>
            <p className="text-xs text-slate-500">Record: {child.longestStreak}</p>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progression niveau {level}</span>
            <span>{xpProgress}/100 XP</span>
          </div>
          <Progress value={xpProgress} className="h-2 bg-slate-700" />
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Period Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-cyan-400 mb-2" />
            <p className="text-2xl font-bold text-white">{child.periodStats.totalTimeMinutes}m</p>
            <p className="text-xs text-slate-400">Temps total</p>
            <p className="text-xs text-cyan-400 mt-1">
              ~{child.periodStats.averageTimePerDay}m/jour
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <BookOpen className="w-6 h-6 mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{child.periodStats.lessonsCompleted}</p>
            <p className="text-xs text-slate-400">Leçons</p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <Target className="w-6 h-6 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{child.periodStats.avgQuizScore}%</p>
            <p className="text-xs text-slate-400">Score quiz</p>
            <p className="text-xs text-slate-500 mt-1">
              {child.periodStats.quizzesTaken} quiz
            </p>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 text-center">
            <Zap className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
            <p className="text-2xl font-bold text-white">{child.periodStats.xpEarned}</p>
            <p className="text-xs text-slate-400">XP gagné</p>
          </div>
        </div>

        {/* Strengths & Struggles */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-green-400">Points forts</h4>
            </div>
            {child.performance.strengths.length > 0 ? (
              <div className="space-y-2">
                {child.performance.strengths.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{s.subject}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${s.avgScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-green-400">{s.avgScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Pas encore de données suffisantes</p>
            )}
          </div>

          {/* Struggles */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-yellow-400" />
              <h4 className="font-semibold text-yellow-400">À améliorer</h4>
            </div>
            {child.performance.struggles.length > 0 ? (
              <div className="space-y-2">
                {child.performance.struggles.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{s.subject}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${s.avgScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-yellow-400">{s.avgScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Aucune difficulté identifiée</p>
            )}
          </div>
        </div>

        {/* Achievements */}
        {child.periodStats.achievementsEarned > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-purple-400" />
              <h4 className="font-semibold text-purple-400">
                {child.periodStats.achievementsEarned} badge{child.periodStats.achievementsEarned > 1 ? 's' : ''} gagné{child.periodStats.achievementsEarned > 1 ? 's' : ''}
              </h4>
            </div>
            <p className="text-sm text-slate-400">
              Félicitations ! Continue comme ça !
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-cyan-400" />
            <h4 className="font-semibold text-white">Recommandations</h4>
          </div>
          <ul className="space-y-2">
            {child.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-300">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Daily Activity Mini Chart */}
        {Object.keys(child.periodStats.dailyTimeBreakdown).length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-3">Activité quotidienne</h4>
            <div className="flex items-end gap-1 h-20">
              {Object.entries(child.periodStats.dailyTimeBreakdown)
                .slice(-7)
                .map(([date, minutes], idx) => {
                  const maxMinutes = Math.max(...Object.values(child.periodStats.dailyTimeBreakdown));
                  const height = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-t"
                        style={{ height: `${Math.max(height, 5)}%` }}
                        title={`${date}: ${minutes}m`}
                      />
                      <span className="text-[10px] text-slate-500">
                        {date.split('-')[2]}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
