import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ReferralCodeCard } from '@/components/referral/ReferralCodeCard';
import { ReferralStats } from '@/components/referral/ReferralStats';
import { ReferralLeaderboard } from '@/components/referral/ReferralLeaderboard';
import { RewardsList } from '@/components/referral/RewardsList';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Gift } from 'lucide-react';

export default function ReferralDashboard() {
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<any>(null);
  const [stats, setStats] = useState({ totalReferrals: 0, conversions: 0, pendingRewards: 0, totalEarned: 0 });
  const [rewards, setRewards] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('referral-manager', {
        body: { action: 'get_stats', userId: user.id }
      });

      if (error) throw error;

      if (data.codes && data.codes.length > 0) {
        setReferralCode(data.codes[0]);
      }

      const totalReferrals = data.referrals?.length || 0;
      const conversions = data.referrals?.filter((r: any) => r.status === 'converted').length || 0;
      const totalEarned = data.rewards?.reduce((sum: number, r: any) => sum + (r.amount || 0), 0) || 0;
      const pendingRewards = data.rewards?.filter((r: any) => r.status === 'available').length || 0;

      setStats({ totalReferrals, conversions, pendingRewards, totalEarned });
      setRewards(data.rewards || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('referral-manager', {
        body: { action: 'generate_code', userId: user.id }
      });

      if (error) throw error;
      setReferralCode(data.data);
      toast.success('Code de parrainage généré !');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Programme de parrainage">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Programme de parrainage" subtitle="Invitez vos amis et gagnez des récompenses !">
      <div className="p-6 space-y-6">
        <ReferralStats {...stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {referralCode ? (
            <ReferralCodeCard {...referralCode} totalShares={referralCode.total_shares || 0} />
          ) : (
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-8 text-center">
              <Gift className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Commencez à parrainer</h3>
              <p className="text-slate-400 mb-4">Générez votre code de parrainage unique pour inviter vos amis</p>
              <Button onClick={generateCode} className="bg-gradient-to-r from-cyan-500 to-purple-500">
                Générer un code de parrainage
              </Button>
            </div>
          )}
          <ReferralLeaderboard entries={leaderboard} />
        </div>

        <RewardsList rewards={rewards} onRedeem={(id) => toast.info('Fonctionnalité de réclamation bientôt disponible !')} />
      </div>
    </DashboardLayout>
  );
}
