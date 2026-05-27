import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Target, BookOpen, Code, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface Activity {
  id: string;
  type: string;
  title: string;
  time: Date;
  duration?: number;
  score?: number;
  points?: number;
  icon: 'lesson' | 'exercise' | 'quiz' | 'achievement' | 'streak';
}

interface ActivityTimelineViewProps {
  activities: Activity[];
}

const iconMap = {
  lesson: BookOpen,
  exercise: Code,
  quiz: Target,
  achievement: Trophy,
  streak: Zap,
};

const colorMap = {
  lesson: 'bg-blue-500',
  exercise: 'bg-green-500',
  quiz: 'bg-purple-500',
  achievement: 'bg-yellow-500',
  streak: 'bg-orange-500',
};

export function ActivityTimelineView({ activities }: ActivityTimelineViewProps) {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = iconMap[activity.icon];
        const colorClass = colorMap[activity.icon];
        
        return (
          <div key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`${colorClass} rounded-full p-2 text-white`}>
                <Icon className="h-4 w-4" />
              </div>
              {index < activities.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mt-2" />
              )}
            </div>
            
            <Card className="flex-1 p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{activity.title}</h4>
                  <p className="text-sm text-gray-500">
                    {format(activity.time, 'h:mm a')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {activity.duration && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(activity.duration / 60)}m
                    </Badge>
                  )}
                  {activity.score !== undefined && (
                    <Badge variant="outline">{activity.score}%</Badge>
                  )}
                  {activity.points && (
                    <Badge className="bg-yellow-500">{activity.points} pts</Badge>
                  )}
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
