import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, ArrowLeft, Lock, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { notifyChildSessionChanged } from '@/utils/childSession';

interface ChildForLogin {
  id: string;
  name: string;
  avatar_url: string | null;
  age: number | null;
}

export default function LoginStudent() {
  const [children, setChildren] = useState<ChildForLogin[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildForLogin | null>(null);
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if already logged in as child
    const token = localStorage.getItem('childSessionToken');
    if (token) {
      navigate('/child-dashboard');
      return;
    }
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      let { data, error } = await supabase
        .from('children')
        .select('id, name, avatar_url, age, pincode')
        .eq('is_active', true)
        .not('pincode', 'is', null);

      if (error) {
        const fallback = await supabase
          .from('children')
          .select('id, name, avatar_url, age, pincode')
          .not('pincode', 'is', null);
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;
      setChildren((data || []).map(c => ({ id: c.id, name: c.name, avatar_url: c.avatar_url, age: c.age })));
    } catch (err) {
      console.error('Error loading children:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les profils élèves',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit: string) => {
    if (pincode.length < 4) {
      const newPin = pincode + digit;
      setPincode(newPin);
      
      // Auto-submit when 4 digits entered
      if (newPin.length === 4) {
        handleLogin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    setPincode(prev => prev.slice(0, -1));
    setError('');
  };

  const handleLogin = async (pin: string) => {
    if (!selectedChild) return;

    setLoggingIn(true);
    setError('');

    try {
      let { data, error } = await supabase
        .from('children')
        .select('id, name, avatar_url, age, xp_points, coins, streak_days, grade_level')
        .eq('id', selectedChild.id)
        .eq('pincode', pin)
        .eq('is_active', true)
        .single();

      if (error) {
        const fallback = await supabase
          .from('children')
          .select('id, name, avatar_url, age, xp_points, coins, streak_days, grade_level')
          .eq('id', selectedChild.id)
          .eq('pincode', pin)
          .single();
        data = fallback.data;
        error = fallback.error;
      }

      if (error || !data) {
        setError('Code PIN incorrect');
        setPincode('');
        return;
      }

      const sessionToken = crypto.randomUUID();
      localStorage.setItem('childSessionToken', sessionToken);
      localStorage.setItem('childProfile', JSON.stringify(data));
      notifyChildSessionChanged();

      toast({
        title: `Bienvenue ${data.name} !`,
        description: 'Connexion réussie'
      });

      navigate('/child-dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Code PIN incorrect');
      setPincode('');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSelectChild = (child: ChildForLogin) => {
    setSelectedChild(child);
    setPincode('');
    setError('');
  };

  const handleBack = () => {
    if (selectedChild) {
      setSelectedChild(null);
      setPincode('');
      setError('');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzYsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      
      {/* Floating particles */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="absolute top-4 left-4 text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Retour
      </Button>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 mb-4 shadow-lg shadow-cyan-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Espace Élève
          </h1>
          <p className="text-slate-400 mt-2">
            {selectedChild ? 'Entre ton code secret' : 'Choisis ton avatar'}
          </p>
          <p className="text-slate-500 text-xs mt-1">Profil créé par tes parents. Pas d'inscription ici.</p>
        </div>

        {!selectedChild ? (
          /* Child Selection */
          <div className="space-y-4">
            {children.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-8 text-center">
                  <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">
                    Aucun profil élève configuré avec un code PIN.
                  </p>
                  <p className="text-sm text-slate-500">
                    Demande à tes parents de créer ton profil et de définir un code PIN.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {children.map((child) => (
                  <Card
                    key={child.id}
                    onClick={() => handleSelectChild(child)}
                    className="bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
                  >
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-slate-700 hover:ring-cyan-500/50 transition-all">
                        <AvatarImage src={child.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-2xl">
                          {child.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-white text-lg">{child.name}</h3>
                      {child.age && (
                        <p className="text-sm text-slate-400">{child.age} ans</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center mt-6">
              <Button
                variant="link"
                onClick={() => navigate('/login')}
                className="text-slate-400 hover:text-cyan-400"
              >
                Connexion Parent
              </Button>
            </div>
          </div>
        ) : (
          /* PIN Entry */
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-xl">
            <CardContent className="p-8">
              {/* Selected child info */}
              <div className="text-center mb-8">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-cyan-500/50">
                  <AvatarImage src={selectedChild.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-white text-3xl">
                    {selectedChild.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-white">{selectedChild.name}</h2>
              </div>

              {/* PIN display */}
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                      pincode.length > i
                        ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                        : 'border-slate-600 bg-slate-800/50 text-slate-600'
                    }`}
                  >
                    {pincode.length > i ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <span className="opacity-30">•</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Error message */}
              {error && (
                <div className="text-center mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Loading indicator */}
              {loggingIn && (
                <div className="text-center mb-4">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                </div>
              )}

              {/* Number pad */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Button
                    key={num}
                    variant="outline"
                    onClick={() => handlePinInput(num.toString())}
                    disabled={loggingIn || pincode.length >= 4}
                    className="h-16 text-2xl font-bold bg-slate-800/50 border-slate-600 hover:bg-cyan-500/20 hover:border-cyan-500 hover:text-cyan-400 transition-all"
                  >
                    {num}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="h-16 text-sm bg-slate-800/50 border-slate-600 hover:bg-slate-700 text-slate-400"
                >
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handlePinInput('0')}
                  disabled={loggingIn || pincode.length >= 4}
                  className="h-16 text-2xl font-bold bg-slate-800/50 border-slate-600 hover:bg-cyan-500/20 hover:border-cyan-500 hover:text-cyan-400 transition-all"
                >
                  0
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackspace}
                  disabled={loggingIn || pincode.length === 0}
                  className="h-16 text-sm bg-slate-800/50 border-slate-600 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 transition-all"
                >
                  Effacer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <p className="absolute bottom-4 text-slate-500 text-sm">
        Code PIN oublié ? Demande à tes parents !
      </p>
    </div>
  );
}
