import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Clock, CheckCircle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'collaborative' | 'competitive';
  participants: { childId: string; name: string; contribution: number }[];
  targetValue: number;
  currentValue: number;
  reward: string;
  deadline: string;
  status: 'active' | 'completed' | 'expired';
}

interface CollaborativeChallengesProps {
  challenges: Challenge[];
  onJoinChallenge?: (challengeId: string) => void;
}

export function CollaborativeChallenges({ challenges, onJoinChallenge }: CollaborativeChallengesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Family Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const progress = (challenge.currentValue / challenge.targetValue) * 100;
            
            return (
              <div key={challenge.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{challenge.title}</h4>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  <Badge variant={challenge.type === 'collaborative' ? 'default' : 'secondary'}>
                    {challenge.type === 'collaborative' ? 'Team' : 'Compete'}
                  </Badge>
                </div>

                <Progress value={progress} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {challenge.currentValue} / {challenge.targetValue}
                  </span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{challenge.participants.length} participating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>{challenge.reward}</span>
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
