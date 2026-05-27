import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Sparkles, 
  Coins, 
  Flame, 
  Trophy, 
  ShoppingBag, 
  Castle, 
  Target,
  LogOut,
  Star,
  Zap,
  Gift,
  Loader2,
  ChevronRight,
  Rocket,
  Crown,
  Gamepad2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyChildSessionChanged } from '@/utils/childSession';

interface ChildProfile {
  id: string;
  name: string;
  age: number | null;
  avatar_url: string | null;
  xp_points: number;
  coins: number;
  streak_days: number;
  grade_level: string | null;
}

interface Goal {
  id: string;
  goal_type: string;
  title?: string;
  description?: string;
  target_value: number;
  current_value: number;
  deadline?: string;
  status: string;
  reward_coins?: number;
}

interface Stats {
  achievements: number;
  lessons_completed: number;
  inventory_items: number;
}

// Calculate level from XP
function calculateLevel(xp: number): { level: number; xpToNextLevel: number; xpProgress: number; totalXpForNextLevel: number } {
  let level = 1;
  let totalXpForLevel = 0;
  let xpForCurrentLevel = 100;
  
  while (xp >= totalXpForLevel + xpForCurrentLevel) {
    totalXpForLevel += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = Math.floor(xpForCurrentLevel * 1.5);
  }
  
  const xpInCurrentLevel = xp - totalXpForLevel;
  const xpProgress = (xpInCurrentLevel / xpForCurrentLevel) * 100;
  
  return {
    level,
    xpToNextLevel: xpForCurrentLevel - xpInCurrentLevel,
    xpProgress,
    totalXpForNextLevel: xpForCurrentLevel
  };
}

// Get goal type display info
function getGoalTypeInfo(goalType: string) {
  const types: Record<string, { icon: any; label: string; color: string }> = {
    daily_lessons: { icon: Target, label: 'Leçons quotidiennes', color: 'text-blue-400' },
    weekly_xp: { icon: Zap, label: 'XP hebdomadaire', color: 'text-yellow-400' },
    streak: { icon: Flame, label: 'Série de jours', color: 'text-orange-400' },
    achievements: { icon: Trophy, label: 'Succès', color: 'text-purple-400' },
    coins: { icon: Coins, label: 'Pièces', color: 'text-amber-400' },
    custom: { icon: Star, label: 'Objectif personnalisé', color: 'text-pink-400' }
  };
  return types[goalType] || types.custom;
}

export default function ChildDashboard() {
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<Stats>({ achievements: 0, lessons_completed: 0, inventory_items: 0 });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadChildData();
  }, []);

  const loadChildData = async () => {
    const token = localStorage.getItem('childSessionToken');
    const storedProfile = localStorage.getItem('childProfile');

    if (!token || !storedProfile) {
      navigate('/login-student');
      return;
    }

    try {
      let childData: ChildProfile;
      try {
        childData = JSON.parse(storedProfile);
      } catch {
        navigate('/login-student');
        return;
      }

      let { data: freshChild, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childData.id)
        .eq('is_active', true)
        .single();

      if (childError) {
        const fallback = await supabase
          .from('children')
          .select('*')
          .eq('id', childData.id)
          .single();
        freshChild = fallback.data;
        childError = fallback.error;
      }

      if (childError || !freshChild) {
        localStorage.removeItem('childSessionToken');
        localStorage.removeItem('childProfile');
        navigate('/login-student');
        return;
      }

      setChild(freshChild);
      localStorage.setItem('childProfile', JSON.stringify(freshChild));

      const { data: goalsData } = await supabase
        .from('learning_goals')
        .select('*')
        .eq('child_id', freshChild.id)
        .in('status', ['active', 'in_progress'])
        .order('created_at', { ascending: false });

      setGoals(goalsData || []);

      const [{ count: achievementCount }, { count: lessonCount }, { count: inventoryCount }] = await Promise.all([
        supabase.from('achievements').select('id', { count: 'exact', head: true }).eq('child_id', freshChild.id),
        supabase.from('learning_sessions').select('id', { count: 'exact', head: true }).eq('child_id', freshChild.id).eq('completed', true),
        supabase.from('user_inventory').select('id', { count: 'exact', head: true }).eq('user_id', freshChild.id),
      ]);

      setStats({
        achievements: achievementCount ?? 0,
        lessons_completed: lessonCount ?? 0,
        inventory_items: inventoryCount ?? 0,
      });

    } catch (err) {
      console.error('Error loading child data:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger tes données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    localStorage.removeItem('childSessionToken');
    localStorage.removeItem('childProfile');
    notifyChildSessionChanged();

    toast({
      title: 'À bientôt !',
      description: 'Tu as été déconnecté'
    });

    navigate('/login-student');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 animate-pulse mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <p className="text-slate-400 text-lg">Chargement de ton espace...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return null;
  }

  const levelInfo = calculateLevel(child.xp_points);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzYsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      
      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
        {/* Header with Avatar and Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          {/* Profile Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-cyan-500/50 shadow-lg shadow-cyan-500/30">
                <AvatarImage src={child.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-4xl font-bold">
                  {child.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* Level badge */}
              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg border-4 border-slate-900">
                <span className="text-white font-bold text-lg">{levelInfo.level}</span>
              </div>
            </div>
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Salut {child.name} !
              </h1>
              <p className="text-slate-400 mt-1">Niveau {levelInfo.level} • Apprenti Codeur</p>
              
              {/* XP Progress */}
              <div className="mt-3 w-64">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-cyan-400 font-medium">XP</span>
                  <span className="text-slate-400">{levelInfo.xpToNextLevel} XP pour niveau {levelInfo.level + 1}</span>
                </div>
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${levelInfo.xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="outline"
            onClick={handleLogout}
            disabled={loggingOut}
            className="bg-slate-800/50 border-slate-700 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all"
          >
            {loggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <LogOut className="w-5 h-5 mr-2" />
            )}
            Se déconnecter
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-amber-500/30 hover:scale-105 transition-transform">
            <CardContent className="p-4 text-center">
              <Coins className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-400">{child.coins}</p>
              <p className="text-sm text-amber-300/70">Pièces</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/30 hover:scale-105 transition-transform">
            <CardContent className="p-4 text-center">
              <Zap className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-cyan-400">{child.xp_points}</p>
              <p className="text-sm text-cyan-300/70">Points XP</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/30 hover:scale-105 transition-transform">
            <CardContent className="p-4 text-center">
              <Flame className="w-10 h-10 text-orange-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-400">{child.streak_days}</p>
              <p className="text-sm text-orange-300/70">Jours de série</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-500/30 hover:scale-105 transition-transform">
            <CardContent className="p-4 text-center">
              <Trophy className="w-10 h-10 text-purple-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-400">{stats.achievements}</p>
              <p className="text-sm text-purple-300/70">Succès</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            onClick={() => navigate('/sagas')}
            className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-500/30 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 transition-all group"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">Sagas & cours</h3>
                <p className="text-slate-400 text-sm">Scratch, Python, IA…</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>

          <Card 
            onClick={() => navigate('/pixel-kingdom')}
            className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20 transition-all group"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Castle className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">Pixel Kingdom</h3>
                <p className="text-slate-400 text-sm">Pars à l'aventure !</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>

          <Card 
            onClick={() => navigate('/store')}
            className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-500/30 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-amber-500/20 transition-all group"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">Boutique</h3>
                <p className="text-slate-400 text-sm">Dépense tes pièces !</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>

          <Card 
            onClick={() => navigate('/achievements')}
            className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border-emerald-500/30 cursor-pointer hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20 transition-all group"
          >
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">Succès</h3>
                <p className="text-slate-400 text-sm">Tes trophées !</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </div>

        {/* Active Goals Section */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Mes Objectifs</h2>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-10 h-10 text-slate-600" />
                </div>
                <p className="text-slate-400 text-lg">Pas d'objectifs pour le moment</p>
                <p className="text-slate-500 text-sm mt-2">Demande à tes parents de t'en créer !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const typeInfo = getGoalTypeInfo(goal.goal_type);
                  const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                  const IconComponent = typeInfo.icon;
                  
                  return (
                    <div 
                      key={goal.id}
                      className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center ${typeInfo.color}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-white">
                              {goal.title || typeInfo.label}
                            </h3>
                            {goal.reward_coins && (
                              <div className="flex items-center gap-1 text-amber-400 text-sm">
                                <Coins className="w-4 h-4" />
                                <span>+{goal.reward_coins}</span>
                              </div>
                            )}
                          </div>
                          
                          {goal.description && (
                            <p className="text-slate-400 text-sm mb-3">{goal.description}</p>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Progression</span>
                              <span className={typeInfo.color}>
                                {goal.current_value} / {goal.target_value}
                              </span>
                            </div>
                            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  progress >= 100 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                    : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          {goal.deadline && (
                            <p className="text-slate-500 text-xs mt-2">
                              Jusqu'au {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fun Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gamepad2 className="w-6 h-6 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Statistiques</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Leçons terminées</span>
                  <span className="text-cyan-400 font-bold">{stats.lessons_completed}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Objets collectés</span>
                  <span className="text-purple-400 font-bold">{stats.inventory_items}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-slate-400">Succès débloqués</span>
                  <span className="text-amber-400 font-bold">{stats.achievements}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Continue comme ça !</h3>
              <p className="text-slate-400">
                Tu es sur la bonne voie pour devenir un super codeur ! 
                {child.streak_days > 0 && (
                  <span className="block mt-2 text-orange-400">
                    {child.streak_days} jours d'affilée, bravo !
                  </span>
                )}
              </p>
              <Button 
                onClick={() => navigate('/pixel-kingdom')}
                className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Continuer l'aventure
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
