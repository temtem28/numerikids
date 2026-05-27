import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Gift, DollarSign } from 'lucide-react';

interface ReferralStatsProps {
  totalReferrals: number;
  conversions: number;
  pendingRewards: number;
  totalEarned: number;
}

export function ReferralStats({ totalReferrals, conversions, pendingRewards, totalEarned }: ReferralStatsProps) {
  const conversionRate = totalReferrals > 0 ? ((conversions / totalReferrals) * 100).toFixed(1) : '0';

  const stats = [
    { label: 'Total Referrals', value: totalReferrals, icon: Users, color: 'text-blue-600' },
    { label: 'Conversions', value: conversions, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Pending Rewards', value: pendingRewards, icon: Gift, color: 'text-purple-600' },
    { label: 'Total Earned', value: `$${totalEarned}`, icon: DollarSign, color: 'text-yellow-600' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
          </div>
        </Card>
      ))}
      
      <Card className="p-6 md:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
            <p className="text-3xl font-bold mt-1">{conversionRate}%</p>
          </div>
          <TrendingUp className="h-10 w-10 text-green-600" />
        </div>
      </Card>
    </div>
  );
}
