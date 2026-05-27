import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Users, TrendingUp } from 'lucide-react';

interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
}

interface FamilyGoalsTrackerProps {
  goals: FamilyGoal[];
}

export function FamilyGoalsTracker({ goals }: FamilyGoalsTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Family Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
            const isCompleted = progress >= 100;

            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">{goal.title}</h4>
                      {isCompleted && <Badge variant="default">Completed!</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
