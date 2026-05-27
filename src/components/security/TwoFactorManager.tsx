import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Shield, ShieldCheck } from 'lucide-react';
import TwoFactorSetup from './TwoFactorSetup';

export default function TwoFactorManager({ userId }: { userId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    loadStatus();
  }, [userId]);

  const loadStatus = async () => {
    const { data } = await supabase.from('two_factor_auth').select('*').eq('user_id', userId).single();
    setEnabled(data?.enabled || false);
  };

  const disable2FA = async () => {
    await supabase.functions.invoke('two-factor-auth', {
      body: { action: 'disable', userId }
    });
    setEnabled(false);
  };

  if (showSetup) {
    return <TwoFactorSetup userId={userId} onComplete={() => { setShowSetup(false); loadStatus(); }} />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? <ShieldCheck className="w-8 h-8 text-green-600" /> : <Shield className="w-8 h-8 text-gray-400" />}
          <div>
            <h3 className="font-bold">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600">
              {enabled ? 'Your account is protected with 2FA' : 'Add extra security to your account'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'Enabled' : 'Disabled'}</Badge>
          {enabled ? (
            <Button onClick={disable2FA} variant="outline">Disable</Button>
          ) : (
            <Button onClick={() => setShowSetup(true)}>Enable</Button>
          )}
        </div>
      </div>
    </Card>
  );
}