import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';

export function DeletionStatusBanner() {
  const [deletionRequest, setDeletionRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDeletionStatus();
  }, []);

  const loadDeletionStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    setDeletionRequest(data);
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('account-deletion', {
        body: {
          action: 'cancel',
          cancellationToken: deletionRequest.cancellation_token
        }
      });

      if (error) throw error;
      setDeletionRequest(null);
    } catch (err) {
      console.error('Failed to cancel deletion:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!deletionRequest) return null;

  const daysRemaining = Math.ceil(
    (new Date(deletionRequest.scheduled_deletion_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          Your account is scheduled for deletion in {daysRemaining} days.
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-1" />
          Cancel Deletion
        </Button>
      </AlertDescription>
    </Alert>
  );
}
