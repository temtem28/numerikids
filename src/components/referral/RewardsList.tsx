import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, CheckCircle } from 'lucide-react';

interface Reward {
  id: string;
  type: string;
  amount: number;
  description: string;
  earnedDate: string;
  expiresAt: string;
  status: string;
}

interface RewardsListProps {
  rewards: Reward[];
  onRedeem: (rewardId: string) => void;
}

export function RewardsList({ rewards, onRedeem }: RewardsListProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      available: { variant: 'default', label: 'Available' },
      redeemed: { variant: 'secondary', label: 'Redeemed' },
      expired: { variant: 'destructive', label: 'Expired' }
    };
    const config = variants[status] || variants.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Your Rewards</h3>
      
      <div className="space-y-3">
        {rewards.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No rewards yet. Start referring friends!</p>
        ) : (
          rewards.map((reward) => (
            <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Gift className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">{reward.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Earned {new Date(reward.earnedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(reward.status)}
                {reward.status === 'available' && (
                  <Button onClick={() => onRedeem(reward.id)} size="sm">
                    Redeem
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
