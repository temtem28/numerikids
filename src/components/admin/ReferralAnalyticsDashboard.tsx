import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Users, DollarSign, Target, Share2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export function ReferralAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [socialData, setSocialData] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data: analyticsData } = await supabase
        .from('referral_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (analyticsData && analyticsData.length > 0) {
        const latest = analyticsData[0];
        setAnalytics(latest);
        setChartData(analyticsData.reverse());

        // Calculate social platform performance
        const socialPerformance = [
          { name: 'Facebook', conversions: latest.facebook_conversions || 0 },
          { name: 'Twitter', conversions: latest.twitter_conversions || 0 },
          { name: 'LinkedIn', conversions: latest.linkedin_conversions || 0 },
          { name: 'WhatsApp', conversions: latest.whatsapp_conversions || 0 },
          { name: 'Direct', conversions: latest.direct_conversions || 0 }
        ];
        setSocialData(socialPerformance);
      }

      const { data: referrals } = await supabase
        .from('referrals')
        .select('*');

      const { data: rewards } = await supabase
        .from('referral_rewards')
        .select('*');

      const { data: codes } = await supabase
        .from('referral_codes')
        .select('total_shares');

      const totalReferrals = referrals?.length || 0;
      const conversions = referrals?.filter(r => r.status === 'converted').length || 0;
      const totalRewards = rewards?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const totalShares = codes?.reduce((sum, c) => sum + (c.total_shares || 0), 0) || 0;
      const conversionRate = totalReferrals > 0 ? ((conversions / totalReferrals) * 100).toFixed(2) : '0';

      setAnalytics({ totalReferrals, conversions, totalRewards, conversionRate, totalShares });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  if (!analytics) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Referral Program Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-bold">{analytics.totalReferrals}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversions</p>
              <p className="text-2xl font-bold">{analytics.conversions}</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Shares</p>
              <p className="text-2xl font-bold">{analytics.totalShares}</p>
            </div>
            <Share2 className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rewards Paid</p>
              <p className="text-2xl font-bold">${analytics.totalRewards}</p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Referral Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total_referrals" stroke="#3b82f6" name="Referrals" />
                <Line type="monotone" dataKey="successful_conversions" stroke="#10b981" name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {socialData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Conversions by Platform</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={socialData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="conversions"
                >
                  {socialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {socialData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Platform Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={socialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="conversions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
