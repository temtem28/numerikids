import { Check, Loader2, Crown, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ProrationCalculator } from './ProrationCalculator';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_children: number;
  sort_order: number;
  trial_days?: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}

interface SubscriptionPlansProps {
  plans: Plan[];
  currentPlan?: string;
  billingCycle: 'monthly' | 'yearly';
  onSelectPlan: (planId: string) => void;
}

export function SubscriptionPlans({ plans, currentPlan, billingCycle }: SubscriptionPlansProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [showProration, setShowProration] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const sortedPlans = [...plans].sort((a, b) => a.sort_order - b.sort_order);

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .single();

      if (!error && data) {
        setCurrentSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handlePlanClick = async (plan: Plan) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour vous abonner');
      return;
    }

    if (plan.price_monthly === 0) {
      toast.info('Vous êtes déjà sur le plan gratuit');
      return;
    }

    // Check if Stripe price ID is configured
    const priceId = billingCycle === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly;
    if (!priceId) {
      toast.error('Ce plan n\'est pas encore disponible. Veuillez contacter le support.');
      return;
    }

    // If user has active subscription, show proration calculator
    if (currentSubscription && currentPlan !== 'free') {
      setSelectedPlan(plan);
      setShowProration(true);
    } else {
      // New subscription, go directly to checkout
      await handleSelectPlan(plan);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      toast.error('Veuillez vous connecter pour vous abonner');
      return;
    }

    if (plan.price_monthly === 0) {
      toast.info('Vous êtes déjà sur le plan gratuit');
      return;
    }

    setLoading(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'create-checkout',
          planId: plan.id,
          userId: user.id,
          email: user.email,
          billingCycle,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.testMode) {
          toast.error('Stripe n\'est pas configuré. Ajoutez STRIPE_SECRET_KEY pour activer les paiements.');
        } else {
          throw new Error(data.error);
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error.message || 'Échec du démarrage du processus de paiement');
    } finally {
      setLoading(null);
    }
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;
    setShowProration(false);
    await handleSelectPlan(selectedPlan);
  };

  const getCurrentPlanPrice = () => {
    if (!currentSubscription?.subscription_plans) return 0;
    return billingCycle === 'monthly' 
      ? currentSubscription.subscription_plans.price_monthly 
      : currentSubscription.subscription_plans.price_yearly;
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'family':
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 'premium':
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      default:
        return <Shield className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getPlanGradient = (planName: string) => {
    switch (planName) {
      case 'family':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-500/50';
      case 'premium':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/50';
      default:
        return 'from-cyan-500/10 to-blue-500/10 border-cyan-500/20 hover:border-cyan-500/40';
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => {
          const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly / 12;
          const totalPrice = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
          const isCurrentPlan = currentPlan === plan.name;
          const isPremium = plan.name === 'premium';
          const isFamily = plan.name === 'family';
          const isLoading = loading === plan.id;
          const hasPriceId = billingCycle === 'yearly' ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly;

          return (
            <Card 
              key={plan.id} 
              className={`p-6 relative bg-gradient-to-br ${getPlanGradient(plan.name)} transition-all duration-300 ${isPremium ? 'ring-2 ring-purple-500/50 scale-105' : ''}`}
            >
              {isPremium && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                  Le plus populaire
                </Badge>
              )}
              
              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  {getPlanIcon(plan.name)}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.display_name}</h3>
                <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">{price === 0 ? 'Gratuit' : `${price.toFixed(2)}€`}</span>
                  {price > 0 && <span className="text-slate-400">/mois</span>}
                </div>
                {billingCycle === 'yearly' && plan.price_yearly > 0 && (
                  <div className="space-y-1">
                    <p className="text-sm text-slate-400">
                      Facturé {totalPrice.toFixed(2)}€/an
                    </p>
                    <p className="text-sm text-green-400 font-medium">
                      Économisez {(plan.price_monthly * 12 - plan.price_yearly).toFixed(2)}€/an
                    </p>
                  </div>
                )}
                {plan.trial_days && plan.trial_days > 0 && !isCurrentPlan && (
                  <Badge variant="secondary" className="mt-3 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {plan.trial_days} jours d'essai gratuit
                  </Badge>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {(plan.features as string[]).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300">
                    {plan.max_children === 1 ? '1 profil enfant' : `Jusqu'à ${plan.max_children} profils enfants`}
                  </span>
                </li>
              </ul>

              <Button
                onClick={() => handlePlanClick(plan)}
                disabled={isCurrentPlan || isLoading || (plan.price_monthly > 0 && !hasPriceId)}
                className={`w-full ${isPremium || isFamily ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : ''}`}
                variant={isPremium || isFamily ? 'default' : 'outline'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : isCurrentPlan ? (
                  'Plan actuel'
                ) : plan.price_monthly === 0 ? (
                  'Commencer gratuitement'
                ) : !hasPriceId ? (
                  'Bientôt disponible'
                ) : (
                  'S\'abonner maintenant'
                )}
              </Button>
            </Card>
          );
        })}
      </div>

      <Dialog open={showProration} onOpenChange={setShowProration}>
        <DialogContent className="max-w-2xl bg-slate-900 border-cyan-500/30">
          {selectedPlan && currentSubscription && (
            <ProrationCalculator
              currentPlanId={currentSubscription.plan_id}
              currentPlanName={currentSubscription.subscription_plans?.display_name || ''}
              currentPlanPrice={getCurrentPlanPrice()}
              newPlanId={selectedPlan.id}
              newPlanName={selectedPlan.display_name}
              newPlanPrice={billingCycle === 'monthly' ? selectedPlan.price_monthly : selectedPlan.price_yearly}
              billingCycle={billingCycle}
              currentPeriodEnd={new Date(currentSubscription.current_period_end)}
              onConfirm={handleConfirmPlanChange}
              onCancel={() => setShowProration(false)}
              isLoading={loading === selectedPlan.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
