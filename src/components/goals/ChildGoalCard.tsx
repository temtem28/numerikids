import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  BookOpen,
  Zap,
  Clock,
  Flame,
  Trophy,
  Coins,
  Star,
  Sparkles,
  Timer,
  Gift,
  Rocket,
  Crown,
  Plus,
  Check,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  description?: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  reward_coins: number;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  priority?: 'low' | 'medium' | 'high';
}

interface ChildGoalCardProps {
  goal: Goal;
  onSelect?: (goal: Goal) => void;
  onUpdateProgress?: (goalId: string, increment: number) => Promise<void>;
  onCompleteGoal?: (goalId: string) => Promise<void>;
  index?: number;
  isUpdating?: boolean;
}

const goalTypeConfig: Record<string, { 
  icon: React.ElementType; 
  label: string; 
  color: string; 
  bgColor: string;
  gradient: string;
  emoji: string;
  canSelfReport: boolean;
  incrementLabel: string;
}> = {
  lessons: { 
    icon: BookOpen, 
    label: 'Leçons', 
    color: 'text-cyan-400', 
    bgColor: 'bg-cyan-500/20',
    gradient: 'from-cyan-500 to-blue-500',
    emoji: '📚',
    canSelfReport: false,
    incrementLabel: '+1 leçon'
  },
  xp: { 
    icon: Zap, 
    label: 'Points XP', 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-500/20',
    gradient: 'from-yellow-500 to-orange-500',
    emoji: '⚡',
    canSelfReport: false,
    incrementLabel: '+10 XP'
  },
  time: { 
    icon: Clock, 
    label: 'Temps', 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-500/20',
    gradient: 'from-purple-500 to-pink-500',
    emoji: '⏰',
    canSelfReport: true,
    incrementLabel: '+5 min'
  },
  streak: { 
    icon: Flame, 
    label: 'Série', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-500/20',
    gradient: 'from-orange-500 to-red-500',
    emoji: '🔥',
    canSelfReport: false,
    incrementLabel: '+1 jour'
  },
  achievements: { 
    icon: Trophy, 
    label: 'Succès', 
    color: 'text-pink-400', 
    bgColor: 'bg-pink-500/20',
    gradient: 'from-pink-500 to-rose-500',
    emoji: '🏆',
    canSelfReport: false,
    incrementLabel: '+1 succès'
  },
  custom: { 
    icon: Target, 
    label: 'Défi', 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/20',
    gradient: 'from-green-500 to-emerald-500',
    emoji: '🎯',
    canSelfReport: true,
    incrementLabel: '+1'
  },
};

export const ChildGoalCard: React.FC<ChildGoalCardProps> = ({
  goal,
  onSelect,
  onUpdateProgress,
  onCompleteGoal,
  index = 0,
  isUpdating = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const typeConfig = goalTypeConfig[goal.goal_type] || goalTypeConfig.custom;
  const TypeIcon = typeConfig.icon;
  const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const isCompleted = goal.status === 'completed';
  const remaining = goal.target_value - goal.current_value;
  const canComplete = goal.current_value >= goal.target_value && !isCompleted;
  const canSelfReport = typeConfig.canSelfReport && !isCompleted;

  // Calculate countdown timer
  useEffect(() => {
    if (!goal.deadline || isCompleted) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const deadline = new Date(goal.deadline!).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeft('Terminé !');
        setIsUrgent(true);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}j ${hours}h`);
        setIsUrgent(days <= 1);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
        setIsUrgent(true);
      } else {
        setTimeLeft(`${minutes}m`);
        setIsUrgent(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [goal.deadline, isCompleted]);

  const formatValue = (value: number, type: string) => {
    if (type === 'time') return `${value} min`;
    if (type === 'xp') return `${value} XP`;
    if (type === 'streak') return `${value} jours`;
    return value.toString();
  };

  const getProgressMessage = () => {
    if (isCompleted) return "Objectif atteint ! 🎉";
    if (canComplete) return "Prêt à valider ! ✨";
    if (progress >= 90) return "Tu y es presque ! 🚀";
    if (progress >= 75) return "Excellent travail ! ⭐";
    if (progress >= 50) return "À mi-chemin ! 💪";
    if (progress >= 25) return "Bon début ! 🌟";
    return "C'est parti ! 🎯";
  };

  const getProgressColor = () => {
    if (isCompleted) return 'from-green-400 to-emerald-500';
    if (canComplete) return 'from-yellow-400 to-green-500';
    if (progress >= 75) return 'from-yellow-400 to-orange-500';
    if (progress >= 50) return 'from-cyan-400 to-blue-500';
    return 'from-purple-400 to-pink-500';
  };

  const handleProgressClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateProgress && !isUpdating) {
      const increment = goal.goal_type === 'time' ? 5 : 1;
      await onUpdateProgress(goal.id, increment);
    }
  };

  const handleCompleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCompleteGoal && !isUpdating) {
      setShowConfetti(true);
      await onCompleteGoal(goal.id);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => onSelect?.(goal)}
      className="cursor-pointer relative"
    >
      {/* Confetti animation on complete */}
      <AnimatePresence>
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3"
                style={{
                  left: `${50 + (Math.random() - 0.5) * 100}%`,
                  top: '50%',
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                  borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                }}
                initial={{ y: 0, opacity: 1, scale: 1 }}
                animate={{
                  y: [0, -100 - Math.random() * 100],
                  x: (Math.random() - 0.5) * 200,
                  opacity: [1, 1, 0],
                  scale: [1, 1.5, 0.5],
                  rotate: Math.random() * 720,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 + Math.random() * 0.5, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <Card className={cn(
        'relative overflow-hidden border-3 transition-all duration-300',
        isCompleted 
          ? 'bg-gradient-to-br from-green-900/50 via-emerald-900/30 to-green-900/50 border-green-400/50 shadow-lg shadow-green-500/20' 
          : canComplete
            ? 'bg-gradient-to-br from-yellow-900/30 via-green-900/20 to-emerald-900/30 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
            : 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20'
      )}>
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {!isCompleted && [...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${typeConfig.bgColor}`}
              style={{
                left: `${20 + i * 20}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Completion sparkles */}
        {isCompleted && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Ready to complete glow */}
        {canComplete && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-green-500/10 to-yellow-500/10"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Priority badge */}
        {goal.priority === 'high' && !isCompleted && (
          <motion.div
            className="absolute top-3 right-3"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg">
              <Rocket className="w-3 h-3 mr-1" />
              Priorité
            </Badge>
          </motion.div>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <motion.div
            className="absolute top-3 right-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
              <Crown className="w-3 h-3 mr-1" />
              Réussi !
            </Badge>
          </motion.div>
        )}

        {/* Ready to complete badge */}
        {canComplete && (
          <motion.div
            className="absolute top-3 right-3"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Badge className="bg-gradient-to-r from-yellow-500 to-green-500 text-white border-0 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1" />
              Prêt !
            </Badge>
          </motion.div>
        )}

        <CardContent className="p-5 relative">
          {/* Header with icon and title */}
          <div className="flex items-start gap-4 mb-4">
            <motion.div
              className={cn(
                'p-3 rounded-xl shadow-lg',
                `bg-gradient-to-br ${typeConfig.gradient}`
              )}
              animate={!isCompleted ? {
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              } : {}}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <TypeIcon className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg leading-tight mb-1">
                {goal.title}
              </h3>
              <Badge variant="outline" className={cn('text-xs', typeConfig.color, 'border-current')}>
                {typeConfig.emoji} {typeConfig.label}
              </Badge>
            </div>
          </div>

          {/* Fun progress section */}
          <div className="space-y-3 mb-4">
            {/* Progress message */}
            <div className="flex items-center justify-between">
              <motion.span
                className="text-sm font-medium text-white/80"
                key={progress}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {getProgressMessage()}
              </motion.span>
              <span className={cn(
                'text-lg font-black',
                isCompleted ? 'text-green-400' : canComplete ? 'text-yellow-400' : typeConfig.color
              )}>
                {Math.round(progress)}%
              </span>
            </div>

            {/* Animated progress bar */}
            <div className="relative h-6 bg-slate-800/80 rounded-full overflow-hidden border-2 border-slate-700">
              <motion.div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r',
                  getProgressColor()
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.div>

              {/* Progress indicator character */}
              {!isCompleted && progress > 5 && (
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 text-lg"
                  style={{ left: `calc(${Math.min(progress, 92)}% - 10px)` }}
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {canComplete ? '🎉' : '🏃'}
                </motion.div>
              )}

              {/* Completion star */}
              {isCompleted && (
                <motion.div
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⭐
                </motion.div>
              )}
            </div>

            {/* Progress numbers */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">
                <span className="text-white font-bold">{formatValue(goal.current_value, goal.goal_type)}</span>
                {' / '}
                {formatValue(goal.target_value, goal.goal_type)}
              </span>
              {!isCompleted && remaining > 0 && (
                <span className="text-slate-500">
                  Encore {formatValue(remaining, goal.goal_type)}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons for self-reportable goals */}
          {(canSelfReport || canComplete) && (
            <div className="flex gap-2 mb-4">
              {canSelfReport && !canComplete && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-white"
                  onClick={handleProgressClick}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {typeConfig.incrementLabel}
                </Button>
              )}
              
              {canComplete && (
                <motion.div
                  className="flex-1"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-bold shadow-lg shadow-green-500/30"
                    onClick={handleCompleteClick}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Valider l'objectif !
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {/* Footer with rewards and deadline */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
            {/* Reward preview */}
            <motion.div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border",
                isCompleted 
                  ? "bg-green-500/20 border-green-500/30" 
                  : "bg-yellow-500/10 border-yellow-500/30"
              )}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={!isCompleted ? { rotate: [0, 15, -15, 0] } : {}}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                {isCompleted ? (
                  <Trophy className="w-5 h-5 text-green-400" />
                ) : (
                  <Gift className="w-5 h-5 text-yellow-400" />
                )}
              </motion.div>
              <div className="text-left">
                <p className={cn(
                  "text-[10px] uppercase tracking-wide",
                  isCompleted ? "text-green-300/70" : "text-yellow-300/70"
                )}>
                  {isCompleted ? 'Gagné' : 'Récompense'}
                </p>
                <div className="flex items-center gap-1">
                  <Coins className={cn("w-4 h-4", isCompleted ? "text-green-400" : "text-yellow-400")} />
                  <span className={cn("font-bold", isCompleted ? "text-green-400" : "text-yellow-400")}>
                    {goal.reward_coins}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Countdown timer */}
            {timeLeft && !isCompleted && (
              <motion.div
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border',
                  isUrgent 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-slate-800/50 border-slate-700'
                )}
                animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Timer className={cn('w-5 h-5', isUrgent ? 'text-red-400' : 'text-slate-400')} />
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">Temps restant</p>
                  <span className={cn(
                    'font-bold',
                    isUrgent ? 'text-red-400' : 'text-white'
                  )}>
                    {timeLeft}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Completed date */}
            {isCompleted && (
              <div className="flex items-center gap-2 text-green-400">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium">Bravo !</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChildGoalCard;
