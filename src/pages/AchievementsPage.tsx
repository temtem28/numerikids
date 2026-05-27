import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Lock, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  category: string;
  xp_reward: number;
  rarity: string;
  unlocked?: boolean;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: achievementsData } = await supabase
      .from('achievements')
      .select('*')
      .order('xp_reward', { ascending: true });

    if (user) {
      const { data: unlockedData } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      const unlockedIds = new Set(unlockedData?.map(a => a.achievement_id) || []);
      
      if (achievementsData) {
        setAchievements(achievementsData.map(a => ({
          ...a,
          unlocked: unlockedIds.has(a.id)
        })));
      }
    } else if (achievementsData) {
      setAchievements(achievementsData);
    }
    
    setLoading(false);
  };

  const rarityColors = {
    common: 'bg-gray-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-yellow-500'
  };

  const categories = ['all', 'lesson', 'streak', 'challenge', 'skill', 'special'];

  const filterByCategory = (category: string) => {
    if (category === 'all') return achievements;
    return achievements.filter(a => a.category === category);
  };

  if (loading) {
    return (
      <DashboardLayout title="Succès">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Succès" subtitle="Débloquez des badges en complétant des leçons et des défis">
      <div className="p-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-slate-900/50 border border-cyan-500/20">
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="capitalize">
                {cat === 'all' ? 'Tous' : cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByCategory(category).map((achievement) => (
                  <Card key={achievement.id} className={`bg-slate-900/50 border-cyan-500/20 ${achievement.unlocked ? '' : 'opacity-60'}`}>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-6xl mb-3 relative">
                          {achievement.badge_icon}
                          {!achievement.unlocked && (
                            <Lock className="absolute top-0 right-0 w-6 h-6 text-slate-500" />
                          )}
                        </div>
                        <h3 className="font-bold text-lg mb-1 text-white">{achievement.name}</h3>
                        <p className="text-sm text-slate-400 mb-3">{achievement.description}</p>
                        <div className="flex items-center justify-center gap-2">
                          <Badge className={rarityColors[achievement.rarity as keyof typeof rarityColors]}>
                            {achievement.rarity}
                          </Badge>
                          <span className="text-sm font-semibold text-yellow-400">
                            +{achievement.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
