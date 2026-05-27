import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';

interface XPProgressBarProps {
  currentXP: number;
  level: number;
}

export function XPProgressBar({ currentXP, level }: XPProgressBarProps) {
  // XP required for next level: level * 500
  const xpForNextLevel = level * 500;
  const xpInCurrentLevel = currentXP % xpForNextLevel;
  const progress = (xpInCurrentLevel / xpForNextLevel) * 100;

  return (
    <div className="bg-card rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-lg">Level {level}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {xpInCurrentLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <Progress value={progress} className="h-3" />
      <p className="text-xs text-muted-foreground mt-1 text-center">
        {xpForNextLevel - xpInCurrentLevel} XP to level {level + 1}
      </p>
    </div>
  );
}
