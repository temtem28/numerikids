import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Trophy,
  Flame,
  Coins,
  Star,
  Sparkles,
  Medal,
  Crown,
  Rocket,
  Gift,
  Home,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ChildGoalCard } from '@/components/goals/ChildGoalCard';
import { WizardTips } from '@/components/goals/WizardTips';
import { GoalCelebration } from '@/components/goals/GoalCelebration';
import { toast } from 'sonner';

interface Goal {
  id: string;
  child_id: string;
  title: string;
  description?: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  reward_coins: number;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  completed_at?: string;
  celebration_shown?: boolean;
}

interface ChildStats {
  coins: number;
  total_coins: number;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  active_goals: number;
  completed_goals: number;
  total_earned_from_goals: number;
}

const MyGoalsPage: React.FC = () => {
  const { currentChild } = useAuth();
  const navigate = useNavigate();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [childStats, setChildStats] = useState<ChildStats>({
    coins: 0,
    total_coins: 0,
    xp: 0,
    level: 1,
    current_streak: 0,
    longest_streak: 0,
    active_goals: 0,
    completed_goals: 0,
    total_earned_from_goals: 0
  });

  // Celebration state
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebratedGoal, setCelebratedGoal] = useState<Goal | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Floating animation elements
  const [floatingStars, setFloatingStars] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate floating stars
    setFloatingStars(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
      }))
    );
  }, []);

  const fetchGoals = useCallback(async () => {
    if (!currentChild?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('goal-manager', {
        body: { 
          action: 'list', 
          child_id: currentChild.id 
        }
      });

      if (error) throw error;
      setGoals(data.goals || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Fallback to direct query
      try {
        const { data, error: directError } = await supabase
          .from('learning_goals')
          .select('*')
          .eq('child_id', currentChild.id)
          .order('created_at', { ascending: false });

        if (!directError) {
          setGoals(data || []);
        }
      } catch (e) {
        console.error('Fallback query failed:', e);
      }
    } finally {
      setLoading(false);
    }
  }, [currentChild?.id]);

  const fetchChildStats = useCallback(async () => {
    if (!currentChild?.id) return;

    try {
      const { data, error } = await supabase.functions.invoke('goal-manager', {
        body: { 
          action: 'get_child_stats', 
          child_id: currentChild.id 
        }
      });

      if (error) throw error;
      if (data?.stats) {
        setChildStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching child stats:', error);
      // Fallback to direct query
      try {
        const { data: childData } = await supabase
          .from('children')
          .select('coins, total_coins, xp, level')
          .eq('id', currentChild.id)
          .single();

        if (childData) {
          setChildStats(prev => ({
            ...prev,
            coins: childData.coins || 0,
            total_coins: childData.total_coins || 0,
            xp: childData.xp || 0,
            level: childData.level || 1
          }));
        }
      } catch (e) {
        console.error('Fallback stats query failed:', e);
      }
    }
  }, [currentChild?.id]);

  useEffect(() => {
    if (currentChild?.id) {
      fetchGoals();
      fetchChildStats();
    }
  }, [currentChild?.id, fetchGoals, fetchChildStats]);

  // Check for goals that need celebration
  useEffect(() => {
    const uncelebratedGoal = goals.find(
      g => g.status === 'completed' && !g.celebration_shown
    );
    if (uncelebratedGoal && !celebrationVisible) {
      setCelebratedGoal(uncelebratedGoal);
      setCoinsEarned(uncelebratedGoal.reward_coins);
      setCelebrationVisible(true);
    }
  }, [goals, celebrationVisible]);

  const handleUpdateProgress = async (goalId: string, increment: number) => {
    if (!currentChild?.id) return;
    
    setUpdatingGoalId(goalId);
    try {
      const { data, error } = await supabase.functions.invoke('goal-manager', {
        body: { 
          action: 'child_update_progress', 
          goal_id: goalId,
          child_id: currentChild.id,
          increment 
        }
      });

      if (error) throw error;

      if (data.just_completed) {
        const completedGoal = goals.find(g => g.id === goalId);
        if (completedGoal) {
          setCelebratedGoal({ ...completedGoal, ...data.goal });
          setCoinsEarned(data.coins_awarded || completedGoal.reward_coins);
          setCelebrationVisible(true);
        }
        toast.success('🎉 Objectif atteint ! Tu as gagné des pièces !');
      } else {
        toast.success('Progression mise à jour !');
      }

      await fetchGoals();
      await fetchChildStats();
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const handleCompleteGoal = async (goalId: string) => {
    if (!currentChild?.id) return;
    
    setUpdatingGoalId(goalId);
    try {
      const { data, error } = await supabase.functions.invoke('goal-manager', {
        body: { 
          action: 'complete_goal', 
          goal_id: goalId,
          child_id: currentChild.id
        }
      });

      if (error) throw error;

      if (data.success && data.just_completed) {
        const completedGoal = goals.find(g => g.id === goalId);
        if (completedGoal) {
          setCelebratedGoal({ ...completedGoal, ...data.goal });
          setCoinsEarned(data.coins_awarded || completedGoal.reward_coins);
          setCelebrationVisible(true);
        }
        toast.success('🎉 Bravo ! Objectif validé !');
      } else if (data.already_completed) {
        toast.info('Cet objectif est déjà terminé !');
      }

      await fetchGoals();
      await fetchChildStats();
    } catch (error: any) {
      console.error('Error completing goal:', error);
      if (error.message?.includes('target not yet reached')) {
        toast.error('Tu n\'as pas encore atteint l\'objectif !');
      } else {
        toast.error('Erreur lors de la validation');
      }
    } finally {
      setUpdatingGoalId(null);
    }
  };

  const handleCelebrationClose = async () => {
    if (celebratedGoal) {
      try {
        await supabase
          .from('learning_goals')
          .update({ celebration_shown: true })
          .eq('id', celebratedGoal.id);
      } catch (e) {
        console.error('Error marking celebration as shown:', e);
      }
    }
    setCelebrationVisible(false);
    setCelebratedGoal(null);
    setCoinsEarned(0);
    fetchGoals();
    fetchChildStats();
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const totalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + (g.current_value / g.target_value) * 100, 0) / activeGoals.length)
    : 0;

  const potentialRewards = activeGoals.reduce((sum, g) => sum + g.reward_coins, 0);

  // Find the goal closest to completion for wizard tips
  const nearestGoal = activeGoals.reduce((nearest, goal) => {
    const progress = goal.current_value / goal.target_value;
    const nearestProgress = nearest ? nearest.current_value / nearest.target_value : 0;
    return progress > nearestProgress ? goal : nearest;
  }, null as Goal | null);

  const isNearDeadline = nearestGoal?.deadline 
    ? (new Date(nearestGoal.deadline).getTime() - Date.now()) < 24 * 60 * 60 * 1000 
    : false;

  const isAlmostComplete = nearestGoal 
    ? (nearestGoal.current_value / nearestGoal.target_value) >= 0.8 
    : false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating stars */}
        {floatingStars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute"
            style={{ left: `${star.x}%` }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: star.delay,
              ease: 'linear',
            }}
          >
            <Star className="w-4 h-4 text-yellow-400/30 fill-yellow-400/30" />
          </motion.div>
        ))}

        {/* Gradient orbs */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-purple-300 hover:text-white hover:bg-purple-500/20"
            >
              <Home className="w-5 h-5 mr-2" />
              Retour
            </Button>

            <div className="flex items-center gap-3">
              {/* Refresh button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { fetchGoals(); fetchChildStats(); }}
                className="text-purple-300 hover:text-white hover:bg-purple-500/20"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </Button>

              {/* Child info with coins */}
              {currentChild && (
                <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-purple-500/30">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {currentChild.pseudo?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white font-medium">{currentChild.pseudo}</span>
                  <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{childStats.coins}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mb-6">
            <motion.div
              className="inline-flex items-center gap-3 mb-2"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Target className="w-10 h-10 text-cyan-400" />
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Mes Objectifs
              </h1>
              <Sparkles className="w-10 h-10 text-pink-400" />
            </motion.div>
            <p className="text-purple-300 text-lg">
              Accomplis tes missions et gagne des récompenses magiques !
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Active Goals */}
          <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30 overflow-hidden">
            <CardContent className="p-4 relative">
              <motion.div
                className="absolute -right-4 -top-4 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="w-6 h-6 text-cyan-400" />
                  <span className="text-cyan-300 text-sm font-medium">En cours</span>
                </div>
                <p className="text-3xl font-black text-white">{activeGoals.length}</p>
                <p className="text-xs text-cyan-400/70">objectifs actifs</p>
              </div>
            </CardContent>
          </Card>

          {/* Completed Goals */}
          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 overflow-hidden">
            <CardContent className="p-4 relative">
              <motion.div
                className="absolute -right-4 -top-4 w-20 h-20 bg-green-500/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-green-400" />
                  <span className="text-green-300 text-sm font-medium">Réussis</span>
                </div>
                <p className="text-3xl font-black text-white">{completedGoals.length}</p>
                <p className="text-xs text-green-400/70">objectifs terminés</p>
              </div>
            </CardContent>
          </Card>

          {/* Potential Rewards */}
          <Card className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30 overflow-hidden">
            <CardContent className="p-4 relative">
              <motion.div
                className="absolute -right-4 -top-4 w-20 h-20 bg-yellow-500/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-6 h-6 text-yellow-400" />
                  <span className="text-yellow-300 text-sm font-medium">À gagner</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="w-6 h-6 text-yellow-400" />
                  <p className="text-3xl font-black text-white">{potentialRewards}</p>
                </div>
                <p className="text-xs text-yellow-400/70">pièces en jeu</p>
              </div>
            </CardContent>
          </Card>

          {/* Total Earned */}
          <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30 overflow-hidden">
            <CardContent className="p-4 relative">
              <motion.div
                className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                  <span className="text-purple-300 text-sm font-medium">Total gagné</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="w-6 h-6 text-purple-400" />
                  <p className="text-3xl font-black text-white">{childStats.total_earned_from_goals}</p>
                </div>
                <p className="text-xs text-purple-400/70">pièces des objectifs</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overall Progress */}
        {activeGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-900/40 via-slate-900/60 to-cyan-900/40 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    >
                      <Medal className="w-8 h-8 text-purple-400" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Progression globale</h3>
                      <p className="text-sm text-purple-300">Continue comme ça, champion !</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.span
                      className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                      key={totalProgress}
                      initial={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                    >
                      {totalProgress}%
                    </motion.span>
                  </div>
                </div>

                <div className="relative h-8 bg-slate-800/80 rounded-full overflow-hidden border-2 border-purple-500/30">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                  </motion.div>

                  {/* Milestone markers */}
                  {[25, 50, 75].map((milestone) => (
                    <div
                      key={milestone}
                      className="absolute top-0 bottom-0 w-0.5 bg-white/20"
                      style={{ left: `${milestone}%` }}
                    />
                  ))}

                  {/* Progress character */}
                  {totalProgress > 5 && (
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 text-2xl"
                      style={{ left: `calc(${Math.min(totalProgress, 92)}% - 12px)` }}
                      animate={{ y: [-3, 3, -3] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >
                      🧙‍♂️
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-between mt-2 text-xs text-slate-400">
                  <span>Début</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100% 🎉</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Wizard Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <WizardTips
            goalType={nearestGoal?.goal_type}
            progress={nearestGoal ? (nearestGoal.current_value / nearestGoal.target_value) * 100 : 0}
            isNearDeadline={isNearDeadline}
            isAlmostComplete={isAlmostComplete}
          />
        </motion.div>

        {/* Goals Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-900/50 border border-purple-500/30 mb-6 p-1">
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-400"
              >
                <Rocket className="w-4 h-4 mr-2" />
                En cours ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-green-400"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Réussis ({completedGoals.length})
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="active" className="mt-0">
                {loading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-slate-900/50 border-purple-500/20 animate-pulse">
                        <CardContent className="p-6 h-64" />
                      </Card>
                    ))}
                  </div>
                ) : activeGoals.length === 0 ? (
                  <Card className="bg-slate-900/50 border-purple-500/20">
                    <CardContent className="p-12 text-center">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Target className="w-20 h-20 text-purple-500/50 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Pas d'objectifs en cours
                      </h3>
                      <p className="text-purple-300 mb-4">
                        Demande à tes parents de te créer de nouveaux défis !
                      </p>
                      <div className="flex items-center justify-center gap-2 text-yellow-400">
                        <Sparkles className="w-5 h-5" />
                        <span>De nouvelles aventures t'attendent...</span>
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeGoals.map((goal, index) => (
                      <ChildGoalCard 
                        key={goal.id} 
                        goal={goal} 
                        index={index}
                        onUpdateProgress={handleUpdateProgress}
                        onCompleteGoal={handleCompleteGoal}
                        isUpdating={updatingGoalId === goal.id}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                {completedGoals.length === 0 ? (
                  <Card className="bg-slate-900/50 border-purple-500/20">
                    <CardContent className="p-12 text-center">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy className="w-20 h-20 text-yellow-500/50 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Aucun objectif terminé
                      </h3>
                      <p className="text-purple-300">
                        Complète tes objectifs pour voir tes trophées ici !
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedGoals.map((goal, index) => (
                      <ChildGoalCard key={goal.id} goal={goal} index={index} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* Achievement badges section */}
        {completedGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-yellow-900/30 via-slate-900/50 to-orange-900/30 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-7 h-7 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Tes badges de champion</h3>
                </div>

                <div className="flex flex-wrap gap-3">
                  {completedGoals.slice(0, 8).map((goal, index) => (
                    <motion.div
                      key={goal.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: index * 0.1, type: 'spring' }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative group"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 border-2 border-yellow-400">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Star className="w-3 h-3 text-white fill-white" />
                      </motion.div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-yellow-500/30">
                        {goal.title}
                      </div>
                    </motion.div>
                  ))}

                  {completedGoals.length > 8 && (
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-600">
                      <span className="text-white font-bold">+{completedGoals.length - 8}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-yellow-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Coins className="w-5 h-5" />
                    <span className="font-bold">
                      {completedGoals.reduce((sum, g) => sum + g.reward_coins, 0)} pièces gagnées
                    </span>
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Champion niveau {Math.floor(completedGoals.length / 3) + 1}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Celebration Modal */}
      <GoalCelebration
        isVisible={celebrationVisible}
        goalTitle={celebratedGoal?.title || ''}
        rewardCoins={coinsEarned}
        onClose={handleCelebrationClose}
      />
    </div>
  );
};

export default MyGoalsPage;
