import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionStatusBannerProps {
  subscription: any;
}

export function SubscriptionStatusBanner({ subscription }: SubscriptionStatusBannerProps) {
  const navigate = useNavigate();

  if (!subscription) return null;

  // Trial ending soon (within 3 days)
  if (subscription.trial_end) {
    const trialEnd = new Date(subscription.trial_end);
    const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft <= 3 && daysLeft > 0) {
      return (
        <Alert className="mb-4">
          <Clock className="w-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Your trial ends in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Add a payment method to continue.</span>
            <Button size="sm" onClick={() => navigate('/billing')}>
              Add Payment Method
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
  }

  // Payment failed
  if (subscription.status === 'past_due') {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Your payment failed. Please update your payment method.</span>
          <Button size="sm" variant="destructive" onClick={() => navigate('/billing')}>
            Update Payment
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Subscription canceling
  if (subscription.cancel_at_period_end) {
    const endDate = new Date(subscription.current_period_end).toLocaleDateString();
    return (
      <Alert className="mb-4">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Your subscription will end on {endDate}.</span>
          <Button size="sm" variant="outline" onClick={() => navigate('/billing')}>
            Reactivate
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
