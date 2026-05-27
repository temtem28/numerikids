import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  childId: string;
  name: string;
  avatarUrl: string;
  score: number;
  rank: number;
}

interface SiblingLeaderboardProps {
  entries: LeaderboardEntry[];
  title: string;
  metric: string;
}

export function SiblingLeaderboard({ entries, title, metric }: SiblingLeaderboardProps) {
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.childId} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-8 flex justify-center">
                {getMedalIcon(entry.rank)}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.avatarUrl} />
                <AvatarFallback>{entry.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{entry.name}</p>
              </div>
              <Badge variant="secondary">{entry.score} {metric}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
