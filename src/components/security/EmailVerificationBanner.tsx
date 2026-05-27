import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, X, Loader2 } from 'lucide-react';

export default function EmailVerificationBanner() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('parent_profiles')
      .select('email_verified')
      .eq('user_id', user.id)
      .single();

    setShow(!profile?.email_verified);
  };

  const resendVerification = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: { 
          userId: user.id, 
          email: user.email,
          resend: true 
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setMessage('Verification email sent! Check your inbox.');
    } catch (error: any) {
      setMessage(error.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <Mail className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm">
          Please verify your email address to access all features.
          {message && <span className="block mt-1 text-xs">{message}</span>}
        </span>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={resendVerification}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Resend Email'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShow(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
