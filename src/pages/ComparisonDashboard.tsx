import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ChildProgressCard } from '@/components/comparison/ChildProgressCard';
import { SiblingLeaderboard } from '@/components/comparison/SiblingLeaderboard';
import { FamilyGoalsTracker } from '@/components/comparison/FamilyGoalsTracker';
import { CollaborativeChallenges } from '@/components/comparison/CollaborativeChallenges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Users, TrendingUp, Trophy, Target, Loader2 } from 'lucide-react';

export default function ComparisonDashboard() {
  const { children } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [childrenStats, setChildrenStats] = useState<any[]>([]);
  const [familyGoals, setFamilyGoals] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    loadComparisonData();
  }, [children]);

  const loadComparisonData = async () => {
    if (!children || children.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const childIds = children.map(c => c.id);

      // Load stats for each child
      const statsPromises = childIds.map(async (childId) => {
        const [progressData, streakData, achievementsData, sessionsData] = await Promise.all([
          supabase.from('user_progress').select('*').eq('user_id', childId).single(),
          supabase.from('streaks').select('*').eq('user_id', childId).single(),
          supabase.from('user_achievements').select('*').eq('user_id', childId),
          supabase.from('learning_sessions').select('duration_minutes').eq('child_id', childId)
        ]);

        return {
          childId,
          totalXP: progressData.data?.total_xp || 0,
          streak: streakData.data?.current_streak || 0,
          completedLessons: progressData.data?.lessons_completed || 0,
          totalMinutes: sessionsData.data?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0,
          achievements: achievementsData.data?.length || 0
        };
      });

      const stats = await Promise.all(statsPromises);
      setChildrenStats(stats);

      // Load family goals
      setFamilyGoals([
        {
          id: '1',
          title: 'Compléter 50 leçons ensemble',
          description: 'Travaillez en famille pour compléter 50 leçons ce mois-ci',
          targetValue: 50,
          currentValue: stats.reduce((sum, s) => sum + s.completedLessons, 0),
          unit: 'leçons'
        },
        {
          id: '2',
          title: '1000 minutes d\'apprentissage',
          description: 'Atteignez 1000 minutes de temps d\'apprentissage combiné',
          targetValue: 1000,
          currentValue: Math.round(stats.reduce((sum, s) => sum + s.totalMinutes, 0)),
          unit: 'minutes'
        }
      ]);

      // Load challenges
      setChallenges([
        {
          id: '1',
          title: 'Sprint d\'apprentissage du weekend',
          description: 'Complétez 3 leçons chacun ce weekend',
          type: 'collaborative',
          participants: children.map(c => ({ childId: c.id, name: c.name, contribution: 0 })),
          targetValue: children.length * 3,
          currentValue: 0,
          reward: '500 pièces chacun',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active'
        }
      ]);

      setLoading(false);
    } catch (error: any) {
      console.error('Error loading comparison data:', error);
      toast({ title: 'Erreur', description: 'Échec du chargement des données de comparaison', variant: 'destructive' });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Progression familiale">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!children || children.length === 0) {
    return (
      <DashboardLayout title="Progression familiale">
        <div className="p-6">
          <Card className="bg-slate-900/50 border-cyan-500/20">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-xl font-semibold mb-2 text-white">Aucun enfant ajouté</h3>
              <p className="text-slate-400">Ajoutez des enfants à votre foyer pour voir les données de comparaison.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const xpLeaderboard = children.map((child, index) => {
    const stats = childrenStats.find(s => s.childId === child.id);
    return {
      childId: child.id,
      name: child.name,
      avatarUrl: child.avatar_url,
      score: stats?.totalXP || 0,
      rank: index + 1
    };
  }).sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }));

  const streakLeaderboard = children.map((child, index) => {
    const stats = childrenStats.find(s => s.childId === child.id);
    return {
      childId: child.id,
      name: child.name,
      avatarUrl: child.avatar_url,
      score: stats?.streak || 0,
      rank: index + 1
    };
  }).sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }));

  return (
    <DashboardLayout title="Progression familiale" subtitle="Comparez les progrès et célébrez les réussites ensemble">
      <div className="p-6 space-y-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-cyan-500/20">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="leaderboards">Classements</TabsTrigger>
            <TabsTrigger value="goals">Objectifs & Défis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => {
                const stats = childrenStats.find(s => s.childId === child.id) || {
                  totalXP: 0,
                  streak: 0,
                  completedLessons: 0,
                  totalMinutes: 0,
                  achievements: 0
                };
                return <ChildProgressCard key={child.id} child={child} stats={stats} />;
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FamilyGoalsTracker goals={familyGoals} />
              <CollaborativeChallenges challenges={challenges} />
            </div>
          </TabsContent>

          <TabsContent value="leaderboards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SiblingLeaderboard entries={xpLeaderboard} title="Classement XP" metric="XP" />
              <SiblingLeaderboard entries={streakLeaderboard} title="Classement Séries" metric="jours" />
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <FamilyGoalsTracker goals={familyGoals} />
            <CollaborativeChallenges challenges={challenges} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
