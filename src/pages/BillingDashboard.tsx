import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SubscriptionPlans } from '@/components/billing/SubscriptionPlans';
import { PaymentHistory } from '@/components/billing/PaymentHistory';
import { UsageLimits } from '@/components/billing/UsageLimits';
import PaymentFailureAlert from '@/components/billing/PaymentFailureAlert';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  ExternalLink, 
  Loader2, 
  Crown, 
  Shield,
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ParentProfile {
  id: string;
  email: string;
  full_name: string;
  subscription_tier: 'free' | 'basic' | 'premium' | 'family';
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'trial';
  subscription_expires_at: string | null;
  stripe_customer_id: string | null;
}

interface UsageData {
  childrenCount: number;
  aiRequestsToday: number;
  storageUsedMb: number;
}

export default function BillingDashboard() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState([]);
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [usageData, setUsageData] = useState<UsageData>({ childrenCount: 0, aiRequestsToday: 0, storageUsedMb: 0 });

  useEffect(() => {
    loadData();
    checkCheckoutStatus();
  }, [user]);

  const checkCheckoutStatus = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success('Abonnement activé avec succès !', {
        description: 'Votre paiement a été traité. Profitez de vos nouvelles fonctionnalités !'
      });
      window.history.replaceState({}, '', '/billing');
      // Reload data after successful checkout
      setTimeout(() => loadData(), 2000);
    } else if (params.get('canceled') === 'true') {
      toast.info('Paiement annulé', {
        description: 'Vous pouvez réessayer à tout moment.'
      });
      window.history.replaceState({}, '', '/billing');
    }
  };

  const loadData = async () => {
    try {
      if (!user) return;

      setLoading(true);

      // Fetch parent profile with subscription info
      const { data: profileData, error: profileError } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError);
      }
      if (profileData) setParentProfile(profileData);

      // Fetch subscription plans, current subscription, and payment history in parallel
      const [plansRes, subRes, paymentsRes] = await Promise.all([
        supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('user_subscriptions')
          .select('*, plan:subscription_plans(*)')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing', 'past_due', 'canceling'])
          .single(),
        supabase
          .from('payment_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      if (plansRes.data) setPlans(plansRes.data);
      if (subRes.data) setCurrentSubscription(subRes.data);
      if (paymentsRes.data) setPayments(paymentsRes.data);

      // Fetch real usage data
      await fetchUsageData();

    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error('Erreur lors du chargement des données de facturation');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'get-usage',
          userId: user.id
        }
      });

      if (!error && data) {
        setUsageData({
          childrenCount: data.childrenCount || 0,
          aiRequestsToday: data.aiRequestsToday || 0,
          storageUsedMb: data.usage?.storage_used_mb || 0
        });
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const handleManagePayment = async () => {
    if (!user) return;
    
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: { 
          action: 'create-portal',
          userId: user.id,
          successUrl: `${window.location.origin}/billing`
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast.error(error.message || 'Impossible d\'ouvrir le portail de gestion des paiements');
    } finally {
      setPortalLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l\'accès jusqu\'à la fin de votre période de facturation actuelle.'
    );

    if (!confirmed) return;

    setCancelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: { 
          action: 'cancel',
          userId: user.id
        }
      });
      
      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }
      
      toast.success('Abonnement annulé', {
        description: 'Votre abonnement restera actif jusqu\'à la fin de la période en cours.'
      });
      loadData();
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      toast.error(error.message || 'Échec de l\'annulation de l\'abonnement');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!user) return;

    setReactivateLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: { 
          action: 'reactivate',
          userId: user.id
        }
      });
      
      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }
      
      toast.success('Abonnement réactivé !', {
        description: 'Votre abonnement continuera normalement.'
      });
      loadData();
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast.error(error.message || 'Échec de la réactivation de l\'abonnement');
    } finally {
      setReactivateLoading(false);
    }
  };

  const getPlanDisplayName = (tier: string) => {
    const names: Record<string, string> = {
      free: 'Gratuit',
      basic: 'Basic',
      premium: 'Premium',
      family: 'Famille'
    };
    return names[tier] || tier;
  };

  const getPlanIcon = (tier: string) => {
    if (tier === 'premium' || tier === 'family') return <Crown className="w-5 h-5 text-yellow-500" />;
    if (tier === 'basic') return <Shield className="w-5 h-5 text-blue-500" />;
    return null;
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === 'active') return 'default';
    if (status === 'trial' || status === 'trialing') return 'secondary';
    if (status === 'cancelled' || status === 'inactive' || status === 'past_due') return 'destructive';
    return 'outline';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Actif',
      trial: 'Essai',
      trialing: 'Essai',
      cancelled: 'Annulé',
      canceling: 'En cours d\'annulation',
      inactive: 'Inactif',
      past_due: 'Paiement en retard'
    };
    return labels[status] || status;
  };

  // Build usage limits based on current plan
  const usageLimits = [
    { 
      name: 'Profils Enfants', 
      current: usageData.childrenCount, 
      limit: currentSubscription?.plan?.max_children || parentProfile?.subscription_tier === 'free' ? 1 : 3, 
      unit: 'profils' 
    },
    { 
      name: 'Demandes d\'Aide IA', 
      current: usageData.aiRequestsToday, 
      limit: currentSubscription?.plan?.limits?.ai_help_requests_per_day || 5, 
      unit: 'aujourd\'hui' 
    },
    { 
      name: 'Stockage Utilisé', 
      current: Math.round(usageData.storageUsedMb / 1024 * 100) / 100, 
      limit: currentSubscription?.plan?.max_storage_gb || 1, 
      unit: 'GB' 
    }
  ];

  if (loading) {
    return (
      <DashboardLayout title="Facturation & Abonnement">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-slate-400">Chargement des informations de facturation...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Facturation & Abonnement" subtitle="Gérez votre abonnement et vos paiements">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PaymentFailureAlert />

        {/* Current Subscription Status Card */}
        {parentProfile && (
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                {getPlanIcon(parentProfile.subscription_tier)}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Plan Actuel : {getPlanDisplayName(parentProfile.subscription_tier)}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {parentProfile.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={getStatusBadgeVariant(parentProfile.subscription_status)} className="text-sm px-3 py-1">
                  {parentProfile.subscription_status === 'active' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {parentProfile.subscription_status === 'cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                  {getStatusLabel(parentProfile.subscription_status)}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadData}
                  className="text-slate-400 hover:text-white"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {parentProfile.subscription_expires_at && (
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>
                  {parentProfile.subscription_status === 'trial' && 'Essai expire le '}
                  {parentProfile.subscription_status === 'active' && 'Renouvellement le '}
                  {parentProfile.subscription_status === 'cancelled' && 'Expire le '}
                  {new Date(parentProfile.subscription_expires_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}

            {parentProfile.subscription_tier === 'free' && (
              <Alert className="bg-amber-500/10 border-amber-500/30">
                <AlertDescription className="text-amber-200">
                  Passez à un plan payant pour débloquer plus de fonctionnalités : profils enfants illimités, aide IA avancée, et plus encore !
                </AlertDescription>
              </Alert>
            )}
          </Card>
        )}

        {/* Active Subscription Details */}
        {currentSubscription && currentSubscription.status !== 'canceled' && (
          <Card className="p-6 bg-slate-900/50 border-cyan-500/20">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold mb-2 text-white">
                  Abonnement : {currentSubscription.plan?.display_name}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    {currentSubscription.billing_cycle === 'yearly' 
                      ? `${currentSubscription.plan?.price_yearly}€/an`
                      : `${currentSubscription.plan?.price_monthly}€/mois`
                    }
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Renouvellement le {new Date(currentSubscription.current_period_end).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(currentSubscription.status)}>
                {getStatusLabel(currentSubscription.status)}
              </Badge>
            </div>

            {/* Trial ending alert */}
            {currentSubscription.trial_end && new Date(currentSubscription.trial_end) > new Date() && (
              <Alert className="mb-4 bg-cyan-500/10 border-cyan-500/30">
                <AlertDescription className="text-cyan-200">
                  Votre essai gratuit se termine le {new Date(currentSubscription.trial_end).toLocaleDateString('fr-FR')}
                </AlertDescription>
              </Alert>
            )}

            {/* Cancellation pending alert */}
            {currentSubscription.cancel_at_period_end && (
              <Alert className="mb-4 bg-amber-500/10 border-amber-500/30">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <AlertDescription className="text-amber-200">
                  Votre abonnement sera annulé le {new Date(currentSubscription.current_period_end).toLocaleDateString('fr-FR')}.
                  <Button 
                    variant="link" 
                    className="text-amber-300 p-0 h-auto ml-2"
                    onClick={handleReactivateSubscription}
                    disabled={reactivateLoading}
                  >
                    {reactivateLoading ? 'Réactivation...' : 'Réactiver'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Past due alert */}
            {currentSubscription.status === 'past_due' && (
              <Alert className="mb-4 bg-red-500/10 border-red-500/30">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <AlertDescription className="text-red-200">
                  Votre paiement a échoué. Veuillez mettre à jour votre méthode de paiement pour continuer votre abonnement.
                </AlertDescription>
              </Alert>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleManagePayment} 
                disabled={portalLoading} 
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Gérer les paiements
                  </>
                )}
              </Button>
              
              {!currentSubscription.cancel_at_period_end && currentSubscription.plan?.name !== 'free' && (
                <Button 
                  variant="outline" 
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  {cancelLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Annulation...
                    </>
                  ) : (
                    'Annuler l\'abonnement'
                  )}
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Tabs for Plans, Usage, and History */}
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-cyan-500/20">
            <TabsTrigger value="plans" className="data-[state=active]:bg-cyan-500/20">
              Plans
            </TabsTrigger>
            <TabsTrigger value="usage" className="data-[state=active]:bg-cyan-500/20">
              Utilisation
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20">
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3 bg-slate-900/50 border border-cyan-500/20 rounded-lg p-3">
                <Label className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
                  Mensuel
                </Label>
                <Switch 
                  checked={billingCycle === 'yearly'} 
                  onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')} 
                />
                <Label className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
                  Annuel <span className="text-green-400 font-medium">(Économisez 17%)</span>
                </Label>
              </div>
            </div>
            <SubscriptionPlans 
              plans={plans} 
              currentPlan={currentSubscription?.plan?.name || parentProfile?.subscription_tier} 
              billingCycle={billingCycle} 
              onSelectPlan={() => {}} 
            />
          </TabsContent>

          <TabsContent value="usage">
            <UsageLimits 
              limits={usageLimits} 
              planName={currentSubscription?.plan?.display_name || getPlanDisplayName(parentProfile?.subscription_tier || 'free')} 
            />
          </TabsContent>

          <TabsContent value="history">
            <PaymentHistory payments={payments} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
