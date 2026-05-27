import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Coins, Gift, Clock, Star, Sparkles } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  reward_type: string;
  value: number | null;
  icon: string;
}

export function RewardsMarketplace({ childId }: { childId: string }) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRewards();
    loadBalance();
  }, [childId]);

  const loadRewards = async () => {
    const { data } = await supabase.from('rewards').select('*').eq('is_active', true).order('cost');
    if (data) setRewards(data);
  };

  const loadBalance = async () => {
    const { data } = await supabase.from('child_coins').select('balance').eq('child_id', childId).single();
    if (data) setBalance(data.balance);
  };

  const redeemReward = async (reward: Reward) => {
    if (balance < reward.cost) {
      toast({ title: "Pas assez de pièces!", description: `Il te faut ${reward.cost - balance} pièces de plus.`, variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error: redemptionError } = await supabase.from('reward_redemptions').insert({
      child_id: childId,
      reward_id: reward.id,
      coins_spent: reward.cost,
      status: 'pending'
    });

    if (!redemptionError) {
      await supabase.from('coin_transactions').insert({
        child_id: childId,
        amount: -reward.cost,
        transaction_type: 'spent',
        source: 'reward_redemption',
        reference_id: reward.id
      });

      await supabase.from('child_coins').update({ balance: balance - reward.cost }).eq('child_id', childId);

      toast({ title: "🎉 Récompense obtenue!", description: `${reward.title} en attente d'approbation parentale.` });
      loadBalance();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Ton solde</p>
            <p className="text-4xl font-bold flex items-center gap-2"><Coins className="w-8 h-8" />{balance}</p>
          </div>
          <Sparkles className="w-16 h-16 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className="bg-slate-800/50 border-slate-700 p-4 hover:border-cyan-500 transition-all">
            <div className="text-4xl mb-3">{reward.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{reward.title}</h3>
            <p className="text-sm text-slate-400 mb-4">{reward.description}</p>
            <div className="flex items-center justify-between">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                <Coins className="w-3 h-3 mr-1" />{reward.cost}
              </Badge>
              <Button onClick={() => redeemReward(reward)} disabled={loading || balance < reward.cost} size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                Échanger
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
