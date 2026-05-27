import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Plus,
  Trophy,
  Flame,
  Coins,
  TrendingUp,
  Calendar,
  BookOpen,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Sparkles,
  Library,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { GoalCard } from '@/components/goals/GoalCard';
import { GoalCelebration } from '@/components/goals/GoalCelebration';
import { GoalTemplateLibrary } from '@/components/goals/GoalTemplateLibrary';
import { WizardTips } from '@/components/goals/WizardTips';
import DashboardSidebar from '@/components/DashboardSidebar';

interface Goal {
  id: string;
  child_id: string;
  parent_id: string;
  title: string;
  description?: string;
  goal_type: string;
  target_value: number;
  current_value: number;
  reward_coins: number;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  priority?: 'low' | 'medium' | 'high';
  created_at: string;
  completed_at?: string;
  celebration_shown?: boolean;
}

interface Child {
  id: string;
  pseudo: string;
  avatar_url?: string;
  birth_date?: string;
  level?: number;
}

const quickTemplates = [
  { title: 'Compléter 5 leçons', type: 'lessons', target: 5, reward: 100, icon: BookOpen },
  { title: 'Gagner 500 XP', type: 'xp', target: 500, reward: 75, icon: Zap },
  { title: 'Série de 7 jours', type: 'streak', target: 7, reward: 150, icon: Flame },
  { title: '30 minutes d\'étude', type: 'time', target: 30, reward: 50, icon: Clock },
  { title: 'Débloquer 3 succès', type: 'achievements', target: 3, reward: 200, icon: Trophy },
];

const GoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [viewMode, setViewMode] = useState<'goals' | 'templates'>('goals');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // Celebration state
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebratedGoal, setCelebratedGoal] = useState<Goal | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'lessons',
    target_value: '',
    reward_coins: '50',
    deadline: '',
    priority: 'medium',
    child_id: ''
  });

  useEffect(() => {
    if (user) {
      fetchChildren();
      fetchGoals();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChildId) {
      fetchGoals();
    }
  }, [selectedChildId]);

  // Check for goals that need celebration
  useEffect(() => {
    const uncelebratedGoal = goals.find(
      g => g.status === 'completed' && !g.celebration_shown
    );
    if (uncelebratedGoal) {
      setCelebratedGoal(uncelebratedGoal);
      setCelebrationVisible(true);
    }
  }, [goals]);

  const fetchChildren = async () => {
    const { data } = await supabase
      .from('children')
      .select('id, pseudo, avatar_url, birth_date, level')
      .eq('parent_id', user?.id);
    if (data) {
      setChildren(data);
      if (data.length > 0 && !formData.child_id) {
        setFormData(prev => ({ ...prev, child_id: data[0].id }));
      }
    }
  };

  const fetchGoals = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('learning_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedChildId !== 'all') {
        query = query.eq('child_id', selectedChildId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Erreur lors du chargement des objectifs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!formData.title.trim() || !formData.target_value || !formData.child_id) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('learning_goals')
        .insert({
          parent_id: user?.id,
          child_id: formData.child_id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          goal_type: formData.goal_type,
          target_value: parseInt(formData.target_value),
          current_value: 0,
          reward_coins: parseInt(formData.reward_coins),
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
          priority: formData.priority,
          status: 'active',
        });

      if (error) throw error;

      toast.success('Objectif créé avec succès !');
      setCreateDialogOpen(false);
      resetForm();
      fetchGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Erreur lors de la création de l\'objectif');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('learning_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast.success('Objectif supprimé');
      fetchGoals();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleUpdateProgress = async (goalId: string, increment: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const newValue = Math.min((goal.current_value || 0) + increment, goal.target_value);
      const justCompleted = newValue >= goal.target_value && (goal.current_value || 0) < goal.target_value;

      const { error } = await supabase
        .from('learning_goals')
        .update({
          current_value: newValue,
          status: justCompleted ? 'completed' : goal.status,
          completed_at: justCompleted ? new Date().toISOString() : null,
        })
        .eq('id', goalId);

      if (error) throw error;

      if (justCompleted) {
        const completedGoal = goals.find(g => g.id === goalId);
        if (completedGoal) {
          setCelebratedGoal({ ...completedGoal, current_value: newValue, status: 'completed' });
          setCelebrationVisible(true);
        }
      }

      fetchGoals();
      toast.success('Progression mise à jour !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCelebrationClose = async () => {
    if (celebratedGoal) {
      await supabase
        .from('learning_goals')
        .update({ celebration_shown: true })
        .eq('id', celebratedGoal.id);
    }
    setCelebrationVisible(false);
    setCelebratedGoal(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      goal_type: 'lessons',
      target_value: '',
      reward_coins: '50',
      deadline: '',
      priority: 'medium',
      child_id: children[0]?.id || ''
    });
  };

  const applyTemplate = (template: typeof quickTemplates[0]) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      goal_type: template.type,
      target_value: template.target.toString(),
      reward_coins: template.reward.toString()
    }));
  };

  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'active') return goal.status === 'active';
    if (activeTab === 'completed') return goal.status === 'completed';
    if (activeTab === 'expired') return goal.status === 'expired';
    return true;
  });

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    expired: goals.filter(g => g.status === 'expired').length,
    totalCoinsEarned: goals.filter(g => g.status === 'completed').reduce((sum, g) => sum + (g.reward_coins || 0), 0),
    completionRate: goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0
  };

  const getChildName = (childId: string) => {
    return children.find(c => c.id === childId)?.pseudo || 'Enfant';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                <Target className="w-8 h-8 text-cyan-400" />
                Objectifs d'apprentissage
              </h1>
              <p className="text-slate-400 mt-1">Définissez et suivez les objectifs de vos enfants</p>
            </div>

            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700">
                <Button
                  variant={viewMode === 'goals' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('goals')}
                  className={viewMode === 'goals' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Objectifs
                </Button>
                <Button
                  variant={viewMode === 'templates' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('templates')}
                  className={viewMode === 'templates' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400'}
                >
                  <Library className="w-4 h-4 mr-2" />
                  Bibliothèque
                </Button>
              </div>

              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700">
                  <SelectValue placeholder="Tous les enfants" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">Tous les enfants</SelectItem>
                  {children.map(child => (
                    <SelectItem key={child.id} value={child.id}>{child.pseudo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowTips(!showTips)}
                className={`border-slate-700 ${showTips ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400'}`}
              >
                <Lightbulb className="w-4 h-4" />
              </Button>

              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel objectif
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-cyan-500/20 max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-400" />
                      Créer un objectif
                    </DialogTitle>
                  </DialogHeader>

                  {/* Quick templates */}
                  <div className="space-y-4">
                    <Label className="text-slate-300">Modèles rapides</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {quickTemplates.map((template, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 justify-start"
                          onClick={() => applyTemplate(template)}
                        >
                          <template.icon className="w-4 h-4 mr-2 text-cyan-400" />
                          {template.title}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">
                      Ou explorez la <button onClick={() => { setCreateDialogOpen(false); setViewMode('templates'); }} className="text-cyan-400 hover:underline">bibliothèque complète</button> pour plus de modèles
                    </p>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div>
                      <Label className="text-slate-300">Enfant *</Label>
                      <Select value={formData.child_id} onValueChange={(v) => setFormData(prev => ({ ...prev, child_id: v }))}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700">
                          <SelectValue placeholder="Sélectionner un enfant" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {children.map(child => (
                            <SelectItem key={child.id} value={child.id}>{child.pseudo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-300">Titre de l'objectif *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Compléter 5 leçons cette semaine"
                        className="bg-slate-800/50 border-slate-700"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300">Description (optionnel)</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Ajoutez des détails..."
                        className="bg-slate-800/50 border-slate-700"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Type d'objectif *</Label>
                        <Select value={formData.goal_type} onValueChange={(v) => setFormData(prev => ({ ...prev, goal_type: v }))}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="lessons">Leçons complétées</SelectItem>
                            <SelectItem value="xp">Points XP</SelectItem>
                            <SelectItem value="streak">Série de jours</SelectItem>
                            <SelectItem value="time">Temps d'étude (min)</SelectItem>
                            <SelectItem value="achievements">Succès débloqués</SelectItem>
                            <SelectItem value="custom">Personnalisé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-slate-300">Valeur cible *</Label>
                        <Input
                          type="number"
                          value={formData.target_value}
                          onChange={(e) => setFormData(prev => ({ ...prev, target_value: e.target.value }))}
                          placeholder="5"
                          className="bg-slate-800/50 border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-300">Récompense (pièces)</Label>
                        <Input
                          type="number"
                          value={formData.reward_coins}
                          onChange={(e) => setFormData(prev => ({ ...prev, reward_coins: e.target.value }))}
                          placeholder="50"
                          className="bg-slate-800/50 border-slate-700"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-300">Priorité</Label>
                        <Select value={formData.priority} onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}>
                          <SelectTrigger className="bg-slate-800/50 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="low">Basse</SelectItem>
                            <SelectItem value="medium">Moyenne</SelectItem>
                            <SelectItem value="high">Haute</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-slate-300">Date limite (optionnel)</Label>
                      <Input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                        className="bg-slate-800/50 border-slate-700"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <Button onClick={handleCreateGoal} className="w-full bg-gradient-to-r from-cyan-500 to-purple-500">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Créer l'objectif
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tips Section */}
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <WizardTips />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Cards - Only show in goals view */}
          {viewMode === 'goals' && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card className="bg-slate-900/50 border-cyan-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                      <p className="text-xs text-slate-400">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.active}</p>
                      <p className="text-xs text-slate-400">En cours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.completed}</p>
                      <p className="text-xs text-slate-400">Terminés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-yellow-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <Coins className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalCoinsEarned}</p>
                      <p className="text-xs text-slate-400">Pièces gagnées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
                      <p className="text-xs text-slate-400">Taux de réussite</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {viewMode === 'goals' ? (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Goals Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-slate-800/50 border border-slate-700 mb-6">
                    <TabsTrigger value="active" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      En cours ({stats.active})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Terminés ({stats.completed})
                    </TabsTrigger>
                    <TabsTrigger value="expired" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Expirés ({stats.expired})
                    </TabsTrigger>
                    <TabsTrigger value="all" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                      Tous ({stats.total})
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3].map(i => (
                            <Card key={i} className="bg-slate-900/50 border-slate-700 animate-pulse">
                              <CardContent className="p-6 h-48" />
                            </Card>
                          ))}
                        </div>
                      ) : filteredGoals.length === 0 ? (
                        <Card className="bg-slate-900/50 border-slate-700">
                          <CardContent className="p-12 text-center">
                            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                              {activeTab === 'active' && 'Aucun objectif en cours'}
                              {activeTab === 'completed' && 'Aucun objectif terminé'}
                              {activeTab === 'expired' && 'Aucun objectif expiré'}
                              {activeTab === 'all' && 'Aucun objectif'}
                            </h3>
                            <p className="text-slate-400 mb-6">
                              {activeTab === 'active' 
                                ? 'Créez un nouvel objectif ou choisissez un modèle dans la bibliothèque !'
                                : 'Les objectifs apparaîtront ici.'}
                            </p>
                            {activeTab === 'active' && (
                              <div className="flex gap-3 justify-center">
                                <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-to-r from-cyan-500 to-purple-500">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Créer un objectif
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => setViewMode('templates')}
                                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                                >
                                  <Library className="w-4 h-4 mr-2" />
                                  Voir les modèles
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredGoals.map((goal, index) => (
                            <motion.div
                              key={goal.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div className="mb-2">
                                <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                                  {getChildName(goal.child_id)}
                                </Badge>
                              </div>
                              <GoalCard
                                goal={goal}
                                onDelete={handleDeleteGoal}
                                onUpdateProgress={handleUpdateProgress}
                                showActions={goal.status === 'active'}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            ) : (
              <motion.div
                key="templates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GoalTemplateLibrary
                  children={children}
                  parentId={user?.id || ''}
                  onGoalCreated={() => {
                    fetchGoals();
                    setViewMode('goals');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Celebration Modal */}
      <GoalCelebration
        isVisible={celebrationVisible}
        goalTitle={celebratedGoal?.title || ''}
        rewardCoins={celebratedGoal?.reward_coins || 0}
        onClose={handleCelebrationClose}
      />
    </div>
  );
};

export default GoalsPage;
