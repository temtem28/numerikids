import { Card } from '@/components/ui/card';
import { Trophy, Star, Zap, Target, Award, Medal, Crown, Flame } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'badge' | 'milestone' | 'streak' | 'level' | 'special';
  earnedAt: string;
  xpReward?: number;
  iconType?: string;
}

interface Props {
  achievements: Achievement[];
  loading?: boolean;
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
  medal: Medal,
  crown: Crown,
  flame: Flame
};

const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
  badge: { bg: 'bg-purple-500/20', border: 'border-purple-500/50', icon: 'text-purple-400' },
  milestone: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/50', icon: 'text-cyan-400' },
  streak: { bg: 'bg-orange-500/20', border: 'border-orange-500/50', icon: 'text-orange-400' },
  level: { bg: 'bg-green-500/20', border: 'border-green-500/50', icon: 'text-green-400' },
  special: { bg: 'bg-pink-500/20', border: 'border-pink-500/50', icon: 'text-pink-400' }
};

export default function AchievementTimeline({ achievements, loading }: Props) {
  if (loading) {
    return (
      <Card className="bg-slate-900/50 backdrop-blur-xl border-yellow-500/20 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  const sortedAchievements = [...achievements].sort(
    (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-yellow-500/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h3 className="text-xl font-bold text-white">Accomplissements récents</h3>
        </div>
        <span className="text-sm text-slate-400">
          {achievements.length} total
        </span>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Aucun accomplissement pour le moment</p>
          <p className="text-sm text-slate-500 mt-1">
            Continuez à apprendre pour débloquer des récompenses !
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-500/50 via-purple-500/50 to-cyan-500/50" />

          <div className="space-y-4">
            {sortedAchievements.slice(0, 8).map((achievement, idx) => {
              const colors = typeColors[achievement.type] || typeColors.badge;
              const Icon = iconMap[achievement.iconType || 'trophy'] || Trophy;
              const earnedDate = new Date(achievement.earnedAt);

              return (
                <div key={achievement.id} className="relative flex gap-4 pl-2">
                  {/* Timeline dot */}
                  <div className={`
                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                    ${colors.bg} border ${colors.border}
                  `}>
                    <Icon className={`w-4 h-4 ${colors.icon}`} />
                  </div>

                  {/* Content */}
                  <div className={`
                    flex-1 p-3 rounded-lg ${colors.bg} border ${colors.border}
                    transform transition-all hover:scale-[1.02]
                  `}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-white">{achievement.title}</h4>
                        <p className="text-sm text-slate-400 mt-0.5">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.xpReward && (
                        <span className="flex items-center gap-1 text-sm font-medium text-yellow-400">
                          <Zap className="w-3 h-3" />
                          +{achievement.xpReward} XP
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {formatDistanceToNow(earnedDate, { addSuffix: true, locale: fr })}
                      {' • '}
                      {format(earnedDate, 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {achievements.length > 8 && (
            <div className="mt-4 text-center">
              <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                Voir tous les accomplissements ({achievements.length - 8} de plus)
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
