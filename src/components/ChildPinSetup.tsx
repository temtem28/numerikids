import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lock, Check, Eye, EyeOff, Loader2, QrCode, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  name: string;
  avatar_url: string | null;
  pincode?: string | null;
}

interface ChildPinSetupProps {
  child: Child;
  onPinSet?: () => void;
}

export function ChildPinSetup({ child, onPinSet }: ChildPinSetupProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSetPin = async () => {
    if (pin.length !== 4) {
      toast({
        title: 'Code PIN invalide',
        description: 'Le code PIN doit contenir exactement 4 chiffres',
        variant: 'destructive'
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: 'Les codes ne correspondent pas',
        description: 'Veuillez vérifier que les deux codes sont identiques',
        variant: 'destructive'
      });
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast({
        title: 'Format invalide',
        description: 'Le code PIN doit contenir uniquement des chiffres',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('children')
        .update({ pincode: pin })
        .eq('id', child.id);

      if (error) throw error;

      toast({
        title: 'Code PIN défini',
        description: `${child.name} peut maintenant se connecter avec son code PIN`
      });
      setOpen(false);
      setPin('');
      setConfirmPin('');
      onPinSet?.();
    } catch (err: any) {
      console.error('Error setting PIN:', err);
      toast({
        title: 'Erreur',
        description: err.message || 'Impossible de définir le code PIN',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (value: string, setter: (v: string) => void) => {
    // Only allow digits and max 4 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setter(cleaned);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={child.pincode ? "outline" : "default"}
          size="sm"
          className={child.pincode ? "border-green-500/30 text-green-400 hover:bg-green-500/10" : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"}
        >
          {child.pincode ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              PIN configuré
            </>
          ) : (
            <>
              <Key className="w-4 h-4 mr-2" />
              Définir un PIN
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={child.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                {child.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>Code PIN pour {child.name}</span>
          </DialogTitle>
          <DialogDescription>
            {child.pincode 
              ? "Modifiez le code PIN de connexion de votre enfant."
              : "Définissez un code PIN à 4 chiffres pour que votre enfant puisse se connecter de manière autonome."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pin">Code PIN (4 chiffres)</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                value={pin}
                onChange={(e) => handlePinChange(e.target.value, setPin)}
                placeholder="••••"
                maxLength={4}
                className="bg-slate-800 border-slate-600 text-center text-2xl tracking-widest font-mono pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPin">Confirmer le code PIN</Label>
            <Input
              id="confirmPin"
              type={showPin ? "text" : "password"}
              value={confirmPin}
              onChange={(e) => handlePinChange(e.target.value, setConfirmPin)}
              placeholder="••••"
              maxLength={4}
              className="bg-slate-800 border-slate-600 text-center text-2xl tracking-widest font-mono"
            />
          </div>

          {pin.length === 4 && confirmPin.length === 4 && (
            <div className={`p-3 rounded-lg ${pin === confirmPin ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
              <p className={`text-sm ${pin === confirmPin ? 'text-green-400' : 'text-red-400'}`}>
                {pin === confirmPin ? 'Les codes correspondent' : 'Les codes ne correspondent pas'}
              </p>
            </div>
          )}

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <h4 className="font-medium text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Comment ça marche ?
            </h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Votre enfant va sur la page de connexion élève</li>
              <li>• Il sélectionne son avatar</li>
              <li>• Il entre son code PIN à 4 chiffres</li>
              <li>• Il accède à son tableau de bord personnalisé</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-600">
            Annuler
          </Button>
          <Button 
            onClick={handleSetPin}
            disabled={loading || pin.length !== 4 || pin !== confirmPin}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {child.pincode ? 'Modifier le PIN' : 'Définir le PIN'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Card component for displaying child with PIN setup
export function ChildPinCard({ child, onPinSet }: ChildPinSetupProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-slate-600">
              <AvatarImage src={child.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-lg">
                {child.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-white">{child.name}</h3>
              <p className="text-sm text-slate-400">
                {child.pincode ? 'Connexion PIN activée' : 'Pas de code PIN'}
              </p>
            </div>
          </div>
          <ChildPinSetup child={child} onPinSet={onPinSet} />
        </div>
      </CardContent>
    </Card>
  );
}
