import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { BarChart3, Clock, TrendingUp } from 'lucide-react';

interface ScreenTimeData {
  child_name: string;
  child_id: string;
  today_minutes: number;
  week_minutes: number;
  daily_limit: number;
  avatar_url?: string;
}

export default function ScreenTimeReport() {
  const [data, setData] = useState<ScreenTimeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScreenTimeData();
  }, []);

  const fetchScreenTimeData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: children } = await supabase
      .from('children')
      .select('id, name, avatar_url')
      .eq('parent_id', user.id);


    if (!children) return;

    const screenTimeData: ScreenTimeData[] = [];

    for (const child of children) {
      const { data: todayLog } = await supabase
        .from('screen_time_logs')
        .select('minutes_used')
        .eq('child_id', child.id)
        .eq('session_date', new Date().toISOString().split('T')[0])
        .single();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: weekLogs } = await supabase
        .from('screen_time_logs')
        .select('minutes_used')
        .eq('child_id', child.id)
        .gte('session_date', sevenDaysAgo.toISOString().split('T')[0]);

      const { data: settings } = await supabase
        .from('parental_settings')
        .select('daily_time_limit')
        .eq('child_id', child.id)
        .single();

      const weekTotal = weekLogs?.reduce((sum, log) => sum + log.minutes_used, 0) || 0;

      screenTimeData.push({
        child_name: child.name,
        child_id: child.id,
        today_minutes: todayLog?.minutes_used || 0,
        week_minutes: weekTotal,
        daily_limit: settings?.daily_time_limit || 60,
        avatar_url: child.avatar_url
      });
    }

    setData(screenTimeData);
    setLoading(false);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) return <div className="text-white">Chargement...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center gap-2">
        <BarChart3 className="w-8 h-8 text-cyan-400" />
        Rapport de temps d'écran
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(child => {
          const percentUsed = (child.today_minutes / child.daily_limit) * 100;
          const isOverLimit = percentUsed > 100;

          return (
            <Card key={child.child_id} className="bg-slate-900/50 backdrop-blur-xl border-cyan-500/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                {child.avatar_url && (
                  <img src={child.avatar_url} alt={child.child_name} className="w-12 h-12 rounded-full" />
                )}
                <h3 className="text-xl font-bold text-white">{child.child_name}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Aujourd'hui
                    </span>
                    <span className={`font-bold ${isOverLimit ? 'text-red-400' : 'text-cyan-400'}`}>
                      {formatTime(child.today_minutes)} / {formatTime(child.daily_limit)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverLimit ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                      }`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                  <span className="text-gray-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Cette semaine
                  </span>
                  <span className="font-bold text-purple-400">
                    {formatTime(child.week_minutes)}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
