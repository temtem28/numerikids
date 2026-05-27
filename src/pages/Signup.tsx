import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Rocket, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Maximum number of retries to check for profile creation
const MAX_PROFILE_CHECK_RETRIES = 3;
const PROFILE_CHECK_INTERVAL = 500; // ms

interface SetupStatus {
  parentProfile: boolean;
  household: boolean;
  childProfile: boolean;
}

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [setupStatus, setSetupStatus] = useState<SetupStatus>({
    parentProfile: false,
    household: false,
    childProfile: false,
  });
  const [isVerifyingSetup, setIsVerifyingSetup] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Use the database RPC function to verify account setup
  const checkAccountSetup = async (userId: string): Promise<{
    complete: boolean;
    parentProfile: boolean;
    household: boolean;
    childProfile: boolean;
  }> => {
    try {
      const { data, error } = await supabase.rpc('verify_account_setup', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error checking account setup:', error);
        return { complete: false, parentProfile: false, household: false, childProfile: false };
      }

      return {
        complete: data?.complete || false,
        parentProfile: data?.parent_profile?.exists || false,
        household: data?.household?.exists || false,
        childProfile: data?.child_profile?.exists || false,
      };
    } catch (err) {
      console.error('Error in checkAccountSetup:', err);
      return { complete: false, parentProfile: false, household: false, childProfile: false };
    }
  };

  // Use the database RPC function to manually set up account if triggers failed
  const manualAccountSetup = async (userId: string, userEmail: string, userName: string): Promise<boolean> => {
    try {
      console.log('Attempting manual account setup via RPC...');
      const { data, error } = await supabase.rpc('setup_new_account', {
        p_user_id: userId,
        p_email: userEmail,
        p_full_name: userName
      });

      if (error) {
        console.error('Manual setup RPC error:', error);
        return false;
      }

      console.log('Manual setup result:', data);
      return data?.success || false;
    } catch (err) {
      console.error('Error in manualAccountSetup:', err);
      return false;
    }
  };

  // Individual fallback creation if RPC fails
  const individualFallbackSetup = async (userId: string, userEmail: string): Promise<boolean> => {
    try {
      // Check what exists
      const { data: existingProfile } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      // Create parent profile if needed
      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('parent_profiles')
          .upsert({
            id: userId,
            email: userEmail,
            full_name: fullName || 'Parent',
            subscription_tier: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('Failed to create parent profile:', profileError);
        } else {
          setSetupStatus(prev => ({ ...prev, parentProfile: true }));
          setSetupProgress(40);
        }
      } else {
        setSetupStatus(prev => ({ ...prev, parentProfile: true }));
        setSetupProgress(40);
      }

      // Check/create household
      const { data: existingHousehold } = await supabase
        .from('households')
        .select('id')
        .eq('parent_id', userId)
        .maybeSingle();

      let householdId = existingHousehold?.id;

      if (!householdId) {
        const { data: newHousehold, error: householdError } = await supabase
          .from('households')
          .insert({
            parent_id: userId,
            name: 'Ma Famille',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (householdError) {
          console.error('Failed to create household:', householdError);
        } else {
          householdId = newHousehold?.id;
          setSetupStatus(prev => ({ ...prev, household: true }));
          setSetupProgress(70);
        }
      } else {
        setSetupStatus(prev => ({ ...prev, household: true }));
        setSetupProgress(70);
      }

      // Check/create child profile
      if (householdId) {
        const { data: existingChild } = await supabase
          .from('children')
          .select('id')
          .eq('parent_id', userId)
          .maybeSingle();

        if (!existingChild) {
          const { error: childError } = await supabase
            .from('children')
            .insert({
              parent_id: userId,
              household_id: householdId,
              name: 'Enfant 1',
              age: 8,
              grade_level: 'CE2',
              coins: 100,
              xp: 0,
              level: 1,
              total_coins: 100,
              total_xp: 0,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (childError) {
            console.error('Failed to create child profile:', childError);
          } else {
            setSetupStatus(prev => ({ ...prev, childProfile: true }));
            setSetupProgress(100);
          }
        } else {
          setSetupStatus(prev => ({ ...prev, childProfile: true }));
          setSetupProgress(100);
        }
      }

      // Final verification
      const finalStatus = await checkAccountSetup(userId);
      return finalStatus.complete;

    } catch (err) {
      console.error('Error in individualFallbackSetup:', err);
      return false;
    }
  };

  // Verify all setup is complete with fallback to manual RPC creation
  const verifyAccountSetup = async (userId: string, userEmail: string, userName: string): Promise<boolean> => {
    setIsVerifyingSetup(true);
    setSetupProgress(10);

    try {
      // Wait a moment for triggers to execute
      await new Promise(resolve => setTimeout(resolve, 500));
      setSetupProgress(20);

      // Check if triggers created everything
      for (let i = 0; i < MAX_PROFILE_CHECK_RETRIES; i++) {
        const status = await checkAccountSetup(userId);
        
        setSetupStatus({
          parentProfile: status.parentProfile,
          household: status.household,
          childProfile: status.childProfile,
        });

        if (status.parentProfile) setSetupProgress(40);
        if (status.household) setSetupProgress(70);
        if (status.childProfile) setSetupProgress(100);

        if (status.complete) {
          console.log('Account setup complete via triggers');
          return true;
        }

        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, PROFILE_CHECK_INTERVAL));
      }

      // Triggers didn't complete setup, use manual RPC function
      console.log('Triggers did not complete setup, using manual RPC...');
      setSetupProgress(50);

      const manualSuccess = await manualAccountSetup(userId, userEmail, userName);
      
      if (manualSuccess) {
        // Verify the manual setup worked
        const finalStatus = await checkAccountSetup(userId);
        setSetupStatus({
          parentProfile: finalStatus.parentProfile,
          household: finalStatus.household,
          childProfile: finalStatus.childProfile,
        });
        setSetupProgress(100);

        if (finalStatus.complete) {
          console.log('Account setup complete via manual RPC');
          return true;
        }
      }

      // If we still don't have everything, try individual fallback creation
      console.log('Manual RPC did not complete, trying individual creation...');
      return await individualFallbackSetup(userId, userEmail);

    } catch (err: any) {
      console.error('Error in verifyAccountSetup:', err);
      setError(err.message || 'Erreur lors de la configuration du compte');
      return false;
    } finally {
      setIsVerifyingSetup(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Veuillez entrer un nom valide');
      return;
    }

    setLoading(true);
    setSetupStatus({ parentProfile: false, household: false, childProfile: false });

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await signUp(email, password, fullName);
      
      if (authError) {
        // Handle specific Supabase auth errors
        if (authError.message.includes('already registered')) {
          throw new Error('Cet email est déjà utilisé. Veuillez vous connecter.');
        }
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      // Step 2: Verify account setup (with fallback to manual creation)
      const setupComplete = await verifyAccountSetup(
        authData.user.id, 
        authData.user.email || email,
        fullName
      );

      if (!setupComplete) {
        // Don't sign out - the account exists, just some setup failed
        // The user can still use the app, we'll handle missing data gracefully
        console.warn('Account setup incomplete, but proceeding...');
      }

      // Step 3: Send verification email (optional, non-blocking)
      try {
        await supabase.functions.invoke('send-verification-email', {
          body: { 
            userId: authData.user.id, 
            email: authData.user.email 
          }
        });
      } catch (emailError) {
        // Don't fail signup if email sending fails
        console.warn('Failed to send verification email:', emailError);
      }

      // Success!
      setSuccess(true);
      setError('');

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Échec de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzYsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
      
      <div className="w-full max-w-md relative">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Rocket className="w-16 h-16 text-cyan-400" />
              <div className="absolute inset-0 blur-xl bg-cyan-400/50"></div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Créer votre compte parent
          </h1>
          <p className="text-slate-400 text-center mb-8">Un seul compte par foyer. Vous ajouterez les profils de vos enfants depuis le tableau de bord.</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Compte créé avec succès ! Redirection vers le tableau de bord...</span>
            </div>
          )}

          {/* Setup Progress */}
          {isVerifyingSetup && (
            <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <span className="text-sm text-cyan-400">Configuration de votre compte...</span>
              </div>
              <Progress value={setupProgress} className="h-2 mb-3" />
              <div className="space-y-1 text-xs">
                <div className={`flex items-center gap-2 ${setupStatus.parentProfile ? 'text-green-400' : 'text-slate-500'}`}>
                  {setupStatus.parentProfile ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-500" />}
                  Profil parent
                </div>
                <div className={`flex items-center gap-2 ${setupStatus.household ? 'text-green-400' : 'text-slate-500'}`}>
                  {setupStatus.household ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-500" />}
                  Foyer familial
                </div>
                <div className={`flex items-center gap-2 ${setupStatus.childProfile ? 'text-green-400' : 'text-slate-500'}`}>
                  {setupStatus.childProfile ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-slate-500" />}
                  Profil enfant par défaut
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">Nom complet</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jean Dupont"
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  disabled={loading || success}
                  required
                />
              </div>
              <p className="text-xs text-slate-500">Minimum 6 caractères</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
                  disabled={loading || success}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold py-6 rounded-xl shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </span>
              ) : success ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Compte créé !
                </span>
              ) : (
                'Créer mon compte'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-slate-400 text-sm">
              Déjà un compte ?{' '}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                Se connecter
              </Link>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-4 text-center">
            <p className="text-xs text-slate-500">
              En créant un compte, vous acceptez nos{' '}
              <Link to="/terms" className="text-cyan-400 hover:underline">
                Conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link to="/privacy" className="text-cyan-400 hover:underline">
                Politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
