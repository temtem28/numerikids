import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Shield, Copy, Check } from 'lucide-react';

export default function TwoFactorSetup({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const startSetup = async () => {
    const { data } = await supabase.functions.invoke('two-factor-auth', {
      body: { action: 'setup', userId, method: 'totp' }
    });
    setSecret(data.secret);
    setQrCode(data.qrCode);
    setStep(2);
  };

  const verifyCode = async () => {
    const { data } = await supabase.functions.invoke('two-factor-auth', {
      body: { action: 'verify', userId, secret, code }
    });
    if (data.success) {
      setBackupCodes(data.backupCodes);
      setStep(3);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      {step === 1 && (
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 mx-auto text-blue-600" />
          <h3 className="text-xl font-bold">Enable Two-Factor Authentication</h3>
          <p className="text-gray-600">Add an extra layer of security to your account</p>
          <Button onClick={startSetup}>Get Started</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Scan QR Code</h3>
          <div className="bg-white p-4 rounded border">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCode)}&size=200x200`} alt="QR Code" className="mx-auto" />
          </div>
          <p className="text-sm">Secret: {secret}</p>
          <Input placeholder="Enter 6-digit code" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
          <Button onClick={verifyCode} className="w-full">Verify</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Save Backup Codes</h3>
          <div className="bg-gray-50 p-4 rounded space-y-1 font-mono text-sm">
            {backupCodes.map((code, i) => <div key={i}>{code}</div>)}
          </div>
          <Button onClick={copyBackupCodes} variant="outline" className="w-full">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Codes'}
          </Button>
          <Button onClick={onComplete} className="w-full">Complete Setup</Button>
        </div>
      )}
    </Card>
  );
}