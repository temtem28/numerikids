import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  username: string;
  total_xp: number;
  level: number;
  rank: number;
}

export function LeaderboardPanel() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(10);

    if (data) {
      setEntries(data.map((entry, index) => ({ ...entry, rank: index + 1 })));
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-bold w-5 text-center">{rank}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
                {getRankIcon(entry.rank)}
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{entry.username[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{entry.username}</p>
                  <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{entry.total_xp} XP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
