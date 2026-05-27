import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Zap, CheckCircle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  challenge_type: string;
  xp_reward: number;
  coin_reward: number;
  end_date: string;
  completed?: boolean;
}

export function ChallengesPanel() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: challengesData } = await supabase
      .from('challenges')
      .select('*')
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: true });

    const { data: completedData } = await supabase
      .from('user_challenges')
      .select('challenge_id')
      .eq('user_id', user.id);

    const completedIds = new Set(completedData?.map(c => c.challenge_id) || []);
    
    if (challengesData) {
      setChallenges(challengesData.map(c => ({
        ...c,
        completed: completedIds.has(c.id)
      })));
    }
    setLoading(false);
  };

  const difficultyColor = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Active Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{challenge.title}</h4>
                      <Badge className={difficultyColor[challenge.difficulty as keyof typeof difficultyColor]}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                  {challenge.completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-500 font-semibold">+{challenge.xp_reward} XP</span>
                    <span className="text-blue-500 font-semibold">+{challenge.coin_reward} coins</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
