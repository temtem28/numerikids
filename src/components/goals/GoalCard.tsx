import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  BookOpen, 
  Zap, 
  Clock, 
  Flame, 
  Trophy,
  Coins,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  created_at: string;
  completed_at?: string;
}

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onUpdateProgress?: (goalId: string, increment: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

const goalTypeConfig: Record<string, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  lessons: { icon: BookOpen, label: 'Leçons', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  xp: { icon: Zap, label: 'XP', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  time: { icon: Clock, label: 'Temps', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  streak: { icon: Flame, label: 'Série', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  achievements: { icon: Trophy, label: 'Succès', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
  custom: { icon: Target, label: 'Personnalisé', color: 'text-green-400', bgColor: 'bg-green-500/20' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Basse', color: 'bg-slate-500/50 text-slate-300' },
  medium: { label: 'Moyenne', color: 'bg-blue-500/50 text-blue-300' },
  high: { label: 'Haute', color: 'bg-red-500/50 text-red-300' },
};

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onUpdateProgress,
  showActions = true,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = goalTypeConfig[goal.goal_type] || goalTypeConfig.custom;
  const TypeIcon = typeConfig.icon;
  const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const isCompleted = goal.status === 'completed';
  const isExpired = goal.status === 'expired';

  const daysRemaining = goal.deadline 
    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getDeadlineStatus = () => {
    if (!daysRemaining) return null;
    if (daysRemaining < 0) return { text: 'Expiré', color: 'text-red-400' };
    if (daysRemaining === 0) return { text: "Aujourd'hui", color: 'text-orange-400' };
    if (daysRemaining === 1) return { text: 'Demain', color: 'text-yellow-400' };
    if (daysRemaining <= 3) return { text: `${daysRemaining} jours`, color: 'text-yellow-400' };
    return { text: `${daysRemaining} jours`, color: 'text-slate-400' };
  };

  const deadlineStatus = getDeadlineStatus();

  const formatValue = (value: number, type: string) => {
    if (type === 'time') return `${value} min`;
    if (type === 'xp') return `${value} XP`;
    return value.toString();
  };

  if (compact) {
    return (
      <motion.div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border transition-all',
          isCompleted 
            ? 'bg-green-500/10 border-green-500/30' 
            : isExpired 
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/30'
        )}
        whileHover={{ scale: 1.01 }}
      >
        <div className={cn('p-2 rounded-lg', typeConfig.bgColor)}>
          <TypeIcon className={cn('w-4 h-4', typeConfig.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{goal.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="text-xs text-slate-400">
              {formatValue(goal.current_value, goal.goal_type)}/{formatValue(goal.target_value, goal.goal_type)}
            </span>
          </div>
        </div>
        {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-400" />}
        {isExpired && <AlertCircle className="w-5 h-5 text-red-400" />}
      </motion.div>
    );
  }

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        'relative overflow-hidden border-2 transition-all duration-300',
        isCompleted 
          ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/40' 
          : isExpired 
            ? 'bg-gradient-to-br from-red-900/30 to-slate-900 border-red-500/40'
            : 'bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/20 hover:border-cyan-500/50'
      )}>
        {/* Progress bar at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700">
          <motion.div
            className={cn(
              'h-full',
              isCompleted ? 'bg-green-500' : isExpired ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        <CardContent className="p-5 pt-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-3 rounded-xl',
                typeConfig.bgColor,
                isHovered && !isCompleted && !isExpired && 'animate-pulse'
              )}>
                <TypeIcon className={cn('w-6 h-6', typeConfig.color)} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">{goal.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn('text-xs', typeConfig.color, 'border-current')}>
                    {typeConfig.label}
                  </Badge>
                  {goal.priority && (
                    <Badge className={cn('text-xs', priorityConfig[goal.priority]?.color)}>
                      {priorityConfig[goal.priority]?.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {showActions && !isCompleted && !isExpired && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(goal)} className="text-slate-300 hover:text-white">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(goal.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isCompleted && (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Terminé</span>
              </div>
            )}

            {isExpired && (
              <div className="flex items-center gap-1 text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Expiré</span>
              </div>
            )}
          </div>

          {/* Description */}
          {goal.description && (
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{goal.description}</p>
          )}

          {/* Progress section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progression</span>
              <span className={cn(
                'font-bold',
                isCompleted ? 'text-green-400' : isExpired ? 'text-red-400' : 'text-cyan-400'
              )}>
                {Math.round(progress)}%
              </span>
            </div>

            <div className="relative">
              <Progress 
                value={progress} 
                className={cn(
                  'h-3',
                  isCompleted && '[&>div]:bg-green-500',
                  isExpired && '[&>div]:bg-red-500'
                )}
              />
              {!isCompleted && !isExpired && progress > 0 && (
                <motion.div
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                  style={{ left: `${Math.min(progress, 95)}%` }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </motion.div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {formatValue(goal.current_value, goal.goal_type)} / {formatValue(goal.target_value, goal.goal_type)}
              </span>
              {onUpdateProgress && !isCompleted && !isExpired && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => onUpdateProgress(goal.id, 1)}
                >
                  +1
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">+{goal.reward_coins} pièces</span>
            </div>

            {deadlineStatus && !isCompleted && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className={cn('text-sm', deadlineStatus.color)}>
                  {deadlineStatus.text}
                </span>
              </div>
            )}

            {isCompleted && goal.completed_at && (
              <span className="text-xs text-slate-500">
                Terminé le {new Date(goal.completed_at).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoalCard;
