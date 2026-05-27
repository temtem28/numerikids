import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function PaymentFailureAlert() {
  const { user } = useAuth();
  const [failedPayment, setFailedPayment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFailedPayment();
    }
  }, [user]);

  const loadFailedPayment = async () => {
    try {
      const { data, error } = await supabase
        .from('failed_payments')
        .select('*')
        .eq('user_id', user?.id)
        .in('status', ['pending', 'recovering'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setFailedPayment(data);
      }
    } catch (error) {
      // No failed payments found, which is good
    }
  };

  const handleUpdatePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: { 
          action: 'create-portal',
          userId: user?.id,
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
      console.error('Error opening payment portal:', error);
      toast.error(error.message || 'Impossible d\'ouvrir le portail de paiement');
    } finally {
      setLoading(false);
    }
  };

  if (!failedPayment) return null;

  const daysUntilSuspension = Math.max(0, Math.ceil(
    (new Date(failedPayment.grace_period_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  const isUrgent = failedPayment.retry_count >= 2 || daysUntilSuspension <= 3;

  return (
    <Alert 
      variant={isUrgent ? 'destructive' : 'default'} 
      className={`mb-6 ${isUrgent ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}
    >
      <AlertCircle className={`h-4 w-4 ${isUrgent ? 'text-red-400' : 'text-amber-400'}`} />
      <AlertTitle className="flex items-center justify-between flex-wrap gap-2">
        <span className={isUrgent ? 'text-red-300' : 'text-amber-300'}>
          Échec du paiement
        </span>
        <span className={`text-sm font-normal flex items-center gap-1 ${isUrgent ? 'text-red-400' : 'text-amber-400'}`}>
          <Clock className="h-3 w-3" />
          {daysUntilSuspension === 0 
            ? 'Suspension imminente' 
            : `${daysUntilSuspension} jour${daysUntilSuspension > 1 ? 's' : ''} avant suspension`
          }
        </span>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className={`mb-3 ${isUrgent ? 'text-red-200' : 'text-amber-200'}`}>
          Votre paiement de {failedPayment.amount}€ a échoué.
          {failedPayment.retry_count > 0 && ` Nous avons tenté ${failedPayment.retry_count} fois de traiter votre paiement.`}
          {' '}Veuillez mettre à jour votre méthode de paiement pour éviter l'interruption du service.
        </p>
        <Button 
          onClick={handleUpdatePayment} 
          disabled={loading} 
          size="sm"
          className={isUrgent 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-amber-500 hover:bg-amber-600 text-white'
          }
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Mettre à jour le paiement
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
}
