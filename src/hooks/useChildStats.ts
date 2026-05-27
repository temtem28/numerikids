import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ChildStats {
  coinBalance: number;
  lifetimeEarned: number;
  loading: boolean;
  error: string | null;
}

export const useChildStats = (childId: string | null) => {
  const [stats, setStats] = useState<ChildStats>({
    coinBalance: 0,
    lifetimeEarned: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!childId) {
      setStats({ coinBalance: 0, lifetimeEarned: 0, loading: false, error: null });
      return;
    }

    let channel: RealtimeChannel;

    const loadInitialStats = async () => {
      try {
        const { data, error } = await supabase
          .from('child_coins')
          .select('balance, lifetime_earned')
          .eq('child_id', childId)
          .single();

        if (error) throw error;

        if (data) {
          setStats({
            coinBalance: data.balance || 0,
            lifetimeEarned: data.lifetime_earned || 0,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error('Error loading child stats:', err);
        setStats(prev => ({ ...prev, loading: false, error: 'Failed to load stats' }));
      }
    };

    const subscribeToChanges = () => {
      channel = supabase
        .channel(`child_coins:${childId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'child_coins',
            filter: `child_id=eq.${childId}`,
          },
          (payload) => {
            console.log('Real-time update received:', payload);
            
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const newData = payload.new as { balance: number; lifetime_earned: number };
              setStats({
                coinBalance: newData.balance || 0,
                lifetimeEarned: newData.lifetime_earned || 0,
                loading: false,
                error: null,
              });
            }
          }
        )
        .subscribe();
    };

    loadInitialStats();
    subscribeToChanges();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [childId]);

  return stats;
};
