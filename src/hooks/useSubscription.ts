import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { hasChildSession, CHILD_SESSION_EVENT } from '@/utils/childSession';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'family';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  childLimit: number;
  hasAdvancedAnalytics: boolean;
  hasAIAssistant: boolean;
  allowedSagas: string[];
  isLoading: boolean;
}

/** Identifiants alignés sur `sagaLessonsData` et les routes `/saga/:sagaId`. */
const TIER_FEATURES: Record<SubscriptionTier, Omit<SubscriptionInfo, 'tier' | 'isLoading'>> = {
  free: {
    childLimit: 1,
    hasAdvancedAnalytics: false,
    hasAIAssistant: false,
    allowedSagas: ['pixel-kingdom', 'scratch', 'python', 'ai'],
  },
  basic: {
    childLimit: 3,
    hasAdvancedAnalytics: false,
    hasAIAssistant: false,
    allowedSagas: ['pixel-kingdom', 'scratch', 'python', 'ai', 'novaville'],
  },
  premium: {
    childLimit: 5,
    hasAdvancedAnalytics: true,
    hasAIAssistant: true,
    allowedSagas: ['pixel-kingdom', 'scratch', 'python', 'ai', 'novaville', 'digitalart'],
  },
  family: {
    childLimit: 999,
    hasAdvancedAnalytics: true,
    hasAIAssistant: true,
    allowedSagas: ['pixel-kingdom', 'scratch', 'python', 'ai', 'novaville', 'digitalart'],
  },
};

export function useSubscription(): SubscriptionInfo {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) {
        setTier(hasChildSession() ? 'family' : 'free');
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from('parent_profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      if (data?.subscription_tier) {
        setTier(data.subscription_tier as SubscriptionTier);
      }
      setIsLoading(false);
    }

    fetchSubscription();

    const onChildSession = () => {
      if (!user) {
        setTier(hasChildSession() ? 'family' : 'free');
      }
    };
    window.addEventListener(CHILD_SESSION_EVENT, onChildSession);
    window.addEventListener('storage', onChildSession);
    return () => {
      window.removeEventListener(CHILD_SESSION_EVENT, onChildSession);
      window.removeEventListener('storage', onChildSession);
    };
  }, [user]);

  const features = TIER_FEATURES[tier];

  return {
    tier,
    isLoading,
    ...features
  };
}
