import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Play, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Zap,
  Calendar,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  Bell,
  ChevronRight,
  User,
  Coins,
  Star,
  AlertCircle,
  CheckCircle2,
  Gift
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ChildProfileForm from '@/components/ChildProfileForm';
import { cn } from '@/lib/utils';
import { type ChildFormPayload } from '@/utils/childProfileCreate';
import type { ChildProfile } from '@/types/database.types';

interface Child {
  id: string;
  name?: string;
  pseudo?: string;
  birth_year?: number;
  age?: number;
  avatar_url?: string;
  xp?: number;
  xp_points?: number;
  level: number;
  coins: number;
  current_saga?: string;
  last_activity?: string;
}

interface Alert {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  childName?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshChildProfiles } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string>('');
  const [householdId, setHouseholdId] = useState<string>('');
  const [parentProfile, setParentProfile] = useState<any>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    // parent_id dans children/households = auth.uid() pour les policies RLS standard
    const parentId = user.id;
    const [childrenData] = await Promise.all([
      fetchChildren(parentId),
      fetchHousehold(parentId),
      fetchParentProfile()
    ]);
    if (childrenData && childrenData.length > 0) {
      await fetchRecentActivity(childrenData);
    }
    setLoading(false);
  };

  const fetchRecentActivity = async (childList: Child[]) => {
    if (!user?.id || childList.length === 0) return;
    const childIds = childList.map((c) => c.id);
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const startStr = since.toISOString();

    const { data: sessions } = await supabase
      .from('learning_sessions')
      .select('id, child_id, started_at, completed, lesson_id')
      .in('child_id', childIds)
      .gte('started_at', startStr)
      .order('started_at', { ascending: false })
      .limit(15);

    const nameById = Object.fromEntries(childList.map((c) => [c.id, c.name || c.pseudo || 'Enfant']));
    const list: Alert[] = (sessions || []).map((s, i) => ({
      id: s.id || `s-${i}`,
      type: s.completed ? 'success' : 'info',
      title: s.completed ? 'Leçon terminée' : 'Session en cours',
      message: s.completed ? 'A complété une leçon' : 'A commencé une leçon',
      time: formatRelativeTime(s.started_at),
      childName: nameById[s.child_id],
    }));
    setAlerts(list.slice(0, 8));
  };

  const formatRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffM = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffM / 60);
    const diffD = Math.floor(diffH / 24);
    if (diffM < 60) return `Il y a ${diffM} min`;
    if (diffH < 24) return `Il y a ${diffH} h`;
    return `Il y a ${diffD} j`;
  };

  const fetchChildren = async (parentIdOverride?: string): Promise<Child[]> => {
    const parentId = parentIdOverride || user?.id;
    if (!parentId) return [];
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Dashboard.fetchChildren:', error);
    }
    if (data !== null && data !== undefined) {
      setChildren(data as Child[]);
    }
    return (data as Child[]) || [];
  };

  const fetchHousehold = async (parentIdOverride?: string) => {
    const parentId = parentIdOverride || user?.id;
    if (!parentId) return;
    const { data } = await supabase
      .from('households')
      .select('id')
      .eq('parent_id', parentId)
      .maybeSingle();
    if (data?.id) setHouseholdId(data.id);
  };

  const fetchParentProfile = async () => {
    const { data, error } = await supabase
      .from('parent_profiles')
      .select('subscription_tier')
      .eq('id', user?.id)
      .maybeSingle();
    if (data) {
      setParentProfile(data);
      return;
    }

    if (!error && user?.id) {
      const { data: fallback } = await supabase
        .from('parent_profiles')
        .select('subscription_tier')
        .eq('user_id', user.id)
        .maybeSingle();
      if (fallback) setParentProfile(fallback);
    }
  };

  const failAddChild = (message: string) => {
    setAddError(message);
    toast({
      title: 'Création du profil impossible',
      description: message,
      variant: 'destructive',
    });
  };

  const handleAddChild = async (childData: ChildFormPayload) => {
    setAddError('');
    if (!user?.id) {
      failAddChild('Session expirée. Reconnecte-toi puis réessaie.');
      return;
    }

    // Limite plan gratuit : on ignore les enfants auto-créés par le trigger (sans pincode)
    const realChildren = children.filter(c => (c as any).pseudo || (c as any).name !== 'Enfant 1');
    const tier = String(parentProfile?.subscription_tier || 'free').toLowerCase();
    if (tier === 'free' && realChildren.length >= 1) {
      failAddChild(
        "Plan gratuit : 1 profil enfant maximum. Passe à un plan supérieur pour en ajouter d'autres."
      );
      return;
    }

    setAddLoading(true);
    try {
      // Utilise auth.uid() directement — c'est la valeur que Supabase RLS vérifie côté DB.
      const authId = user.id;

      // Foyer
      let hh = householdId;
      if (!hh) {
        const { data: existingHH } = await supabase
          .from('households')
          .select('id')
          .eq('parent_id', authId)
          .maybeSingle();
        if (existingHH?.id) {
          hh = existingHH.id;
        } else {
          const { data: newHH, error: hhErr } = await supabase
            .from('households')
            .insert({ parent_id: authId, name: 'Ma Famille' })
            .select('id')
            .single();
          if (hhErr || !newHH?.id) {
            const msg = hhErr?.message || 'Impossible de créer le foyer.';
            failAddChild(`Foyer : ${msg}`);
            return;
          }
          hh = newHH.id;
        }
        setHouseholdId(hh);
      }

      // Insert enfant — payload minimal pour maximiser la compatibilité de schéma
      const displayName = (childData.pseudo || childData.name || 'Enfant').trim() || 'Enfant';
      const birthYear = childData.birth_year ?? new Date().getFullYear() - 8;
      const age = Math.max(1, Math.min(17, new Date().getFullYear() - birthYear));
      const pin = `${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: created, error: insertErr } = await supabase
        .from('children')
        .insert({
          parent_id: authId,
          household_id: hh,
          name: displayName,
          age,
          grade_level: childData.grade_level || 'CE2',
          avatar_url: childData.avatar_url || null,
          xp_points: 0,
          coins: 100,
          streak_days: 0,
          is_active: true,
          daily_time_limit: childData.daily_time_limit ?? 60,
          learning_preferences: childData.learning_preferences ?? [],
          allowed_content_types: childData.allowed_content_types ?? ['video', 'quiz', 'exercise', 'game'],
        })
        .select('id')
        .single();

      if (insertErr || !created?.id) {
        // Détail brut de l'erreur pour diagnostic
        const detail = insertErr
          ? `[${insertErr.code}] ${insertErr.message}${insertErr.details ? ' — ' + insertErr.details : ''}`
          : "Aucune ligne retournée.";
        console.error('handleAddChild insert error:', insertErr);
        failAddChild(`Erreur base de données : ${detail}`);
        return;
      }

      // Tentative d'ajout du pincode (colonne optionnelle)
      await supabase.from('children').update({ pseudo: displayName, pincode: pin, birth_year: birthYear }).eq('id', created.id).eq('parent_id', authId);

      // Affichage immédiat : si le SELECT est bloqué par RLS, un refetch vide ne doit pas effacer la ligne créée.
      const optimisticChild: Child = {
        id: created.id,
        name: displayName,
        pseudo: displayName,
        birth_year: birthYear,
        age,
        avatar_url: childData.avatar_url || undefined,
        xp_points: 0,
        level: 1,
        coins: 100,
      };
      const optimisticProfile: ChildProfile = {
        id: created.id,
        parent_id: authId,
        name: displayName,
        age,
        avatar_url: childData.avatar_url || undefined,
        grade_level: childData.grade_level || 'CE2',
        xp_points: 0,
        coins: 100,
        streak_days: 0,
        is_active: true,
        household_id: hh,
      };
      setChildren((prev) => {
        const rest = prev.filter((c) => c.id !== optimisticChild.id);
        return [optimisticChild, ...rest];
      });

      const { data: refreshed, error: refreshErr } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', authId)
        .order('created_at', { ascending: false });

      if (!refreshErr && refreshed && refreshed.length > 0) {
        setChildren(refreshed as Child[]);
      } else if (refreshErr) {
        console.warn('Dashboard: liste enfants non rechargée après création', refreshErr);
      }

      toast({
        title: '✅ Profil créé',
        description:
          refreshed && refreshed.length > 0
            ? `${displayName} a été ajouté. PIN élève : ${pin}`
            : `${displayName} a été ajouté (PIN : ${pin}). Si la liste reste vide après rechargement, applique la migration SQL « fix_children_rls » sur Supabase (politique SELECT sur children).`,
      });
      await refreshChildProfiles(optimisticProfile);
      setAddError('');
      setAddDialogOpen(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      failAddChild(`Erreur inattendue : ${msg}`);
    } finally {
      setAddLoading(false);
    }
  };

  const getAge = (birthYear: number) => {
    return new Date().getFullYear() - birthYear;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-cyan-400" />;
    }
  };

  const totalXP = children.reduce((sum, child) => sum + (child.xp ?? child.xp_points ?? 0), 0);
  const totalCoins = children.reduce((sum, child) => sum + (child.coins || 0), 0);
  const averageLevel = children.length > 0 
    ? Math.round(children.reduce((sum, child) => sum + (child.level || 1), 0) / children.length) 
    : 0;

  return (
    <DashboardLayout 
      title="Tableau de bord" 
      subtitle={`Bienvenue, ${user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Parent'}`}
    >
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Enfants</p>
                  <p className="text-3xl font-bold text-white">{children.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">XP Total</p>
                  <p className="text-3xl font-bold text-white">{totalXP.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pièces</p>
                  <p className="text-3xl font-bold text-white">{totalCoins.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Niveau moyen</p>
                  <p className="text-3xl font-bold text-white">{averageLevel}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Children Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Mes enfants
              </h2>
              <Dialog
                open={addDialogOpen}
                onOpenChange={(open) => {
                  setAddDialogOpen(open);
                  if (open) setAddError('');
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un enfant
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-cyan-500/20 max-h-[92vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Nouveau profil enfant</DialogTitle>
                  </DialogHeader>
                  <ChildProfileForm
                    onSubmit={handleAddChild}
                    loading={addLoading}
                    submitError={addError}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
                    <CardContent className="p-6 h-48" />
                  </Card>
                ))}
              </div>
            ) : children.length === 0 ? (
              <Card className="bg-slate-900/50 border-cyan-500/20 border-dashed">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Ajoutez votre premier enfant
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Créez un profil pour commencer l'aventure d'apprentissage
                  </p>
                  <Button 
                    onClick={() => setAddDialogOpen(true)}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un enfant
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {children.map((child) => (
                  <Card 
                    key={child.id} 
                    className="bg-slate-900/50 border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer group"
                    onClick={() => {
                      navigate(`/sagas`);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-14 h-14 border-2 border-cyan-500/50">
                          <AvatarImage src={child.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-lg font-bold">
                            {(child.name || child.pseudo || 'E').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-lg">{child.name || child.pseudo}</h3>
                            <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                              Niv. {child.level || 1}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {child.age ?? (child.birth_year ? getAge(child.birth_year) : '—')} ans
                          </p>
                        </div>
                      </div>

                      {/* Progress Stats */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                          <Zap className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400">XP</p>
                          <p className="text-sm font-bold text-cyan-400">{child.xp ?? child.xp_points ?? 0}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                          <Coins className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400">Pièces</p>
                          <p className="text-sm font-bold text-yellow-400">{child.coins || 0}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                          <Star className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                          <p className="text-xs text-slate-400">Niveau</p>
                          <p className="text-sm font-bold text-purple-400">{child.level || 1}</p>
                        </div>
                      </div>

                      {/* XP Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progression niveau {child.level || 1}</span>
                          <span>{((child.xp ?? child.xp_points ?? 0) % 100)}%</span>
                        </div>
                        <Progress 
                          value={(child.xp ?? child.xp_points ?? 0) % 100} 
                          className="h-2 bg-slate-700"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-purple-500/30 group-hover:border-cyan-500/50"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/sagas');
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continuer
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                          onClick={(e) => { e.stopPropagation(); navigate(`/analytics?child=${child.id}`); }}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Progression
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar - Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Alerts */}
            <Card className="bg-slate-900/50 border-cyan-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Bell className="w-5 h-5 text-cyan-400" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">Aucune activité récente. Les sessions de vos enfants apparaîtront ici.</p>
                ) : (
                alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors cursor-pointer hover:border-cyan-500/30',
                      alert.type === 'success' && 'bg-green-500/5 border-green-500/20',
                      alert.type === 'warning' && 'bg-yellow-500/5 border-yellow-500/20',
                      alert.type === 'info' && 'bg-cyan-500/5 border-cyan-500/20'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white text-sm">{alert.title}</span>
                          {alert.childName && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {alert.childName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{alert.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-900/50 border-cyan-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => navigate('/goals')}
                >
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Gérer les objectifs
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => navigate('/my-goals')}
                >
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Mes objectifs (enfant)
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => navigate('/sagas')}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Explorer les sagas
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => navigate('/achievements')}
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Voir les succès
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => navigate('/store')}
                >
                  <span className="flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Boutique
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-slate-300 hover:text-cyan-400 hover:bg-cyan-500/10"
                  onClick={() => navigate('/comparison')}
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Comparer les progrès
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>


            {/* Weekly Goal */}
            <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Objectif hebdomadaire</h3>
                    <p className="text-xs text-slate-400">5 leçons complétées</p>
                  </div>
                </div>
                <Progress value={60} className="h-3 bg-slate-700 mb-2" />
                <p className="text-sm text-slate-400">3/5 leçons - Encore 2 pour atteindre l'objectif!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
