import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  conversions: number;
  totalEarned: number;
}

interface ReferralLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
}

export function ReferralLeaderboard({ entries, currentUserRank }: ReferralLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Top Referrers</h3>
      
      {currentUserRank && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg">
          <p className="text-sm font-medium">Your Rank: #{currentUserRank}</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>
              <div>
                <p className="font-medium">{entry.name}</p>
                <p className="text-sm text-muted-foreground">{entry.conversions} conversions</p>
              </div>
            </div>
            <Badge variant="secondary">${entry.totalEarned}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
