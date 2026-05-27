import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Clock, Target } from 'lucide-react';

interface ChildProgressCardProps {
  child: any;
  stats: {
    totalXP: number;
    streak: number;
    completedLessons: number;
    totalMinutes: number;
    achievements: number;
  };
}

export function ChildProgressCard({ child, stats }: ChildProgressCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={child.avatar_url} />
          <AvatarFallback>{child.name?.[0] || 'C'}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-lg">{child.name}</h3>
          <Badge variant="outline">Level {Math.floor(stats.totalXP / 1000)}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">XP</span>
          </div>
          <span className="font-bold">{stats.totalXP}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Streak</span>
          </div>
          <span className="font-bold">{stats.streak} days</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Lessons</span>
          </div>
          <span className="font-bold">{stats.completedLessons}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-500" />
            <span className="text-sm">Time</span>
          </div>
          <span className="font-bold">{Math.round(stats.totalMinutes)} min</span>
        </div>
      </div>
    </Card>
  );
}
