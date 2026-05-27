import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  total_stars: number;
  completed_quests: number;
  total_unlocked: number;
  avg_stars: string;
  completion_percentage: string;
}

export default function PixelKingdomLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pixel-kingdom-progress', {
        body: { action: 'getLeaderboard', timeframe }
      });

      if (error) throw error;
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className={`w-6 h-6 ${getRankColor(rank)}`} />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-12 h-12 text-yellow-400" />
            Classement Pixel Kingdom
          </h1>
          <p className="text-xl text-purple-200">Les meilleurs aventuriers du royaume</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setTimeframe('weekly')}
            variant={timeframe === 'weekly' ? 'default' : 'outline'}
            className={timeframe === 'weekly' ? 'bg-purple-600' : ''}
          >
            Semaine
          </Button>
          <Button
            onClick={() => setTimeframe('monthly')}
            variant={timeframe === 'monthly' ? 'default' : 'outline'}
            className={timeframe === 'monthly' ? 'bg-purple-600' : ''}
          >
            Mois
          </Button>
          <Button
            onClick={() => setTimeframe('all-time')}
            variant={timeframe === 'all-time' ? 'default' : 'outline'}
            className={timeframe === 'all-time' ? 'bg-purple-600' : ''}
          >
            Tout le temps
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-white text-xl">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.user_id === user?.id;
              
              return (
                <Card
                  key={entry.user_id}
                  className={`p-6 ${isCurrentUser ? 'ring-4 ring-yellow-400 bg-yellow-50' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-16 text-center">
                      {getRankIcon(rank)}
                    </div>

                    <Avatar className="w-16 h-16 border-4 border-purple-300">
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white text-xl font-bold">
                        {entry.user_id.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-purple-600 font-semibold mb-1">
                          <TrendingUp className="w-4 h-4" />
                          XP Total
                        </div>
                        <div className="text-2xl font-bold">{entry.total_xp.toLocaleString()}</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-yellow-600 font-semibold mb-1">
                          <Star className="w-4 h-4" />
                          Étoiles Moy.
                        </div>
                        <div className="text-2xl font-bold">{entry.avg_stars}</div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-green-600 font-semibold mb-1">
                          <Target className="w-4 h-4" />
                          Quêtes
                        </div>
                        <div className="text-2xl font-bold">{entry.completed_quests}/{entry.total_unlocked}</div>
                      </div>

                      <div>
                        <div className="text-blue-600 font-semibold mb-1">
                          Complétion
                        </div>
                        <div className="text-2xl font-bold">{entry.completion_percentage}%</div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
