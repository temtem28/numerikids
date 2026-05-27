import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertCircle, Key, Smartphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TwoFactorVerificationProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TwoFactorVerification({ userId, onSuccess, onCancel }: TwoFactorVerificationProps) {
  const [code, setCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: verifyError } = await supabase.functions.invoke('two-factor-auth', {
        body: { 
          action: 'verify', 
          userId, 
          code: code.trim(),
          isBackupCode: useBackupCode,
          trustDevice
        }
      });

      if (verifyError) throw verifyError;
      if (!data.success) throw new Error(data.error || 'Code invalide');

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Échec de la vérification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Shield className="w-16 h-16 text-cyan-400" />
            <div className="absolute inset-0 blur-xl bg-cyan-400/50"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Vérification en deux étapes</h2>
        <p className="text-slate-400">
          {useBackupCode 
            ? 'Entrez un code de secours' 
            : 'Entrez le code de votre application d\'authentification'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-slate-300">
            {useBackupCode ? 'Code de secours' : 'Code à 6 chiffres'}
          </Label>
          <div className="relative">
            {useBackupCode ? (
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            ) : (
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            )}
            <Input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white text-center text-2xl tracking-widest focus:border-cyan-500 focus:ring-cyan-500/20"
              placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
              maxLength={useBackupCode ? 9 : 6}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="trust"
            checked={trustDevice}
            onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
            className="border-slate-600"
          />
          <Label htmlFor="trust" className="text-slate-300 text-sm cursor-pointer">
            Faire confiance à cet appareil pendant 30 jours
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
        >
          {loading ? 'Vérification...' : 'Vérifier'}
        </Button>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => setUseBackupCode(!useBackupCode)}
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            {useBackupCode ? 'Utiliser l\'application d\'authentification' : 'Utiliser un code de secours'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="block w-full text-slate-400 hover:text-slate-300 text-sm"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
