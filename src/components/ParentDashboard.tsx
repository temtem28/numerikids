import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Clock, Trophy, Star, Plus, Gift, AlertTriangle, Upload, Download, CheckSquare, X, List, Grid3x3, MessageSquare, Settings, Shield, CreditCard, Target, FileText } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGate } from './FeatureGate';


import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  ensureHouseholdForParent,
  insertChildProfileCompat,
  type ChildFormPayload,
} from '@/utils/childProfileCreate';
import type { ChildProfile } from '@/types/database.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ParentalControls from './ParentalControls';
import ScreenTimeReport from './ScreenTimeReport';
import RewardsManagement from './RewardsManagement';
import ComprehensiveAnalytics from './analytics/ComprehensiveAnalytics';
import ChildProfileForm from './ChildProfileForm';
import ChildCard from './ChildCard';
import CSVImportModal from './CSVImportModal';
import BulkEditModal from './BulkEditModal';
import BulkActionBar from './BulkActionBar';
import FilterBar from './FilterBar';
import ActivityTimeline from './ActivityTimeline';
import { MessagingPanel } from './MessagingPanel';
import { NotificationSettings } from './NotificationSettings';
import { DetailedActivityView } from './analytics/DetailedActivityView';
import AIInsightsDashboard from './analytics/AIInsightsDashboard';
import { SubscriptionStatusBanner } from './billing/SubscriptionStatusBanner';
import { StoreSettingsPanel } from './store/StoreSettingsPanel';
import { PurchaseHistoryView } from './store/PurchaseHistoryView';
import { PendingApprovalsPanel } from './store/PendingApprovalsPanel';












const ParentDashboard: React.FC = () => {
  const { user, refreshChildProfiles } = useAuth();
  const subscriptionInfo = useSubscription();
  const [children, setChildren] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [parentProfile, setParentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [householdId, setHouseholdId] = useState<string>('');
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set());



  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('pseudo-asc');
  const currentYear = new Date().getFullYear();
  const [ageRange, setAgeRange] = useState<[number, number]>([currentYear - 18, currentYear - 4]);
  const [levelRange, setLevelRange] = useState<[number, number]>([1, 20]);
  const [xpRange, setXpRange] = useState<[number, number]>([0, 10000]);

  // Load filter preferences from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('childrenFilters');
    if (savedFilters) {
      const filters = JSON.parse(savedFilters);
      setSearchTerm(filters.searchTerm || '');
      setSortBy(filters.sortBy || 'pseudo-asc');
      setAgeRange(filters.ageRange || [currentYear - 18, currentYear - 4]);
      setLevelRange(filters.levelRange || [1, 20]);
      setXpRange(filters.xpRange || [0, 10000]);
    }
  }, []);

  // Save filter preferences to localStorage
  useEffect(() => {
    const filters = { searchTerm, sortBy, ageRange, levelRange, xpRange };
    localStorage.setItem('childrenFilters', JSON.stringify(filters));
  }, [searchTerm, sortBy, ageRange, levelRange, xpRange]);



  useEffect(() => {
    if (user?.id) {
      void bootstrapParentData();
      fetchSubscription();
      fetchParentProfile();
    }
  }, [user]);

  const bootstrapParentData = async () => {
    if (!user?.id) return;
    await Promise.all([fetchHousehold(user.id), fetchChildren(user.id)]);
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


  const fetchSubscription = async () => {
    const { data } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user?.id)
      .single();
    if (data) setSubscription(data);
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

  const fetchChildren = async (parentIdOverride?: string, allowEmpty = true) => {
    const parentId = parentIdOverride || user?.id;
    if (!parentId) return;
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('ParentDashboard.fetchChildren:', error);
    }
    if (data === undefined || data === null) return;
    if (data.length === 0 && !allowEmpty) return;
    const normalized = data.map((child) => ({
      ...child,
      pseudo: child.pseudo || child.name || 'Enfant',
    }));
    setChildren(normalized);
  };

  const handleAddChild = async (childData: ChildFormPayload) => {
    setAddError('');
    const tier = String(parentProfile?.subscription_tier || 'free').toLowerCase();
    if (tier === 'free' && children.length >= 1) {
      const msg =
        "Plan gratuit : 1 profil enfant maximum. Passe à un plan supérieur pour en ajouter d'autres.";
      setAddError(msg);
      toast.error('Limite du plan gratuit', { description: msg });
      setAddDialogOpen(false);
      setUpgradeDialogOpen(true);
      return;
    }

    if (!user?.id) {
      setAddError('Session expirée. Reconnecte-toi puis réessaie.');
      toast.error('Session requise', { description: 'Reconnecte-toi pour ajouter un enfant.' });
      return;
    }

    setLoading(true);
    try {
      const authId = user.id;
      const hh = householdId || (await ensureHouseholdForParent(authId));
      if (hh) setHouseholdId(hh);
      if (!hh) {
        setAddError('Impossible de créer ou charger le foyer familial.');
        toast.error('Foyer introuvable', {
          description: 'Impossible de créer ou charger le foyer familial.',
        });
        return;
      }

      let insertedChildId = '';
      try {
        const inserted = await insertChildProfileCompat(authId, hh, childData);
        insertedChildId = inserted.childId;
      } catch (error: any) {
        console.error('handleAddChild:', error);
        setAddError(error?.message || "La base a refusé la création du profil.");
        toast.error('Création impossible', { description: error.message });
        return;
      }
      if (!insertedChildId) {
        setAddError("La base n'a pas confirmé la création du profil.");
        toast.error('Création incomplète', {
          description: "Le profil n'a pas été confirmé par la base. Réessaie une fois.",
        });
        return;
      }

      const displayName = (childData.pseudo || childData.name || 'Enfant').trim() || 'Enfant';
      const year = childData.birth_year ?? new Date().getFullYear() - 8;
      const age = Math.max(1, Math.min(17, new Date().getFullYear() - year));
      const optimisticProfile: ChildProfile = {
        id: insertedChildId,
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
        const row = {
          ...optimisticProfile,
          pseudo: displayName,
          birth_year: year,
          level: 1,
        };
        return [row, ...prev.filter((c) => c.id !== insertedChildId)];
      });

      toast.success('Profil créé', {
        description: `${displayName} a été ajouté.`,
      });
      await fetchChildren(authId, false);
      await refreshChildProfiles(optimisticProfile);
      setAddDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };



  const handleEditChild = async (childData: any) => {
    setLoading(true);
    const { error } = await supabase
      .from('children')
      .update(childData)
      .eq('id', selectedChild.id);
    if (!error) {
      await fetchChildren();
      setEditDialogOpen(false);
    }
    setLoading(false);
  };

  const handleDeleteChild = async () => {
    setLoading(true);
    await supabase
      .from('children')
      .delete()
      .eq('id', selectedChild.id);
    await fetchChildren();
    setDeleteDialogOpen(false);
    setLoading(false);
  };

  const handleCSVImport = async (childrenData: Array<{ pseudo: string; birth_year: number }>) => {
    for (const childData of childrenData) {
      await supabase
        .from('children')
        .insert({
          parent_id: user?.id,
          household_id: householdId,
          ...childData
        });
    }
    await fetchChildren();
  };


  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = ['pseudo', 'birth_year', 'avatar_url', 'xp', 'level'];
    const csvRows = [headers.join(',')];
    
    for (const child of data) {
      const values = [
        child.pseudo || '',
        child.birth_year || '',
        child.avatar_url || '',
        child.xp || 0,
        child.level || 1
      ];
      csvRows.push(values.map(v => `"${v}"`).join(','));
    }
    
    return csvRows.join('\n');
  };

  const handleCSVExport = () => {
    if (children.length === 0) {
      alert('Aucun enfant à exporter');
      return;
    }
    
    const csv = convertToCSV(children);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `enfants_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedChildren(new Set());
  };

  const handleChildSelection = (childId: string, selected: boolean) => {
    const newSelection = new Set(selectedChildren);
    if (selected) {
      newSelection.add(childId);
    } else {
      newSelection.delete(childId);
    }
    setSelectedChildren(newSelection);
  };

  const handleBulkEdit = async (updates: any) => {
    for (const childId of Array.from(selectedChildren)) {
      await supabase
        .from('children')
        .update(updates)
        .eq('id', childId);
    }
    await fetchChildren();
    setSelectedChildren(new Set());
    setSelectionMode(false);
  };

  const handleBulkDelete = async () => {
    for (const childId of Array.from(selectedChildren)) {
      await supabase
        .from('children')
        .delete()
        .eq('id', childId);
    }
    await fetchChildren();
    setSelectedChildren(new Set());
    setSelectionMode(false);
    setBulkDeleteOpen(false);
  };


  // Filter and sort logic
  const getFilteredAndSortedChildren = () => {
    let filtered = [...children];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(child =>
        child.pseudo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Age range filter
    filtered = filtered.filter(child => {
      if (!child.birth_year) return true;
      return child.birth_year >= ageRange[0] && child.birth_year <= ageRange[1];
    });

    // Level range filter
    filtered = filtered.filter(child => {
      const level = child.level || 1;
      return level >= levelRange[0] && level <= levelRange[1];
    });

    // XP range filter
    filtered = filtered.filter(child => {
      const xp = child.xp || 0;
      return xp >= xpRange[0] && xp <= xpRange[1];
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'pseudo-asc':
          return (a.pseudo || '').localeCompare(b.pseudo || '');
        case 'pseudo-desc':
          return (b.pseudo || '').localeCompare(a.pseudo || '');
        case 'age-asc':
          return (a.birth_year || 0) - (b.birth_year || 0);
        case 'age-desc':
          return (b.birth_year || 0) - (a.birth_year || 0);
        case 'level-asc':
          return (a.level || 1) - (b.level || 1);
        case 'level-desc':
          return (b.level || 1) - (a.level || 1);
        case 'xp-asc':
          return (a.xp || 0) - (b.xp || 0);
        case 'xp-desc':
          return (b.xp || 0) - (a.xp || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredChildren = getFilteredAndSortedChildren();

  const hasActiveFilters = 
    searchTerm !== '' ||
    ageRange[0] !== currentYear - 18 ||
    ageRange[1] !== currentYear - 4 ||
    levelRange[0] !== 1 ||
    levelRange[1] !== 20 ||
    xpRange[0] !== 0 ||
    xpRange[1] !== 10000;

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('pseudo-asc');
    setAgeRange([currentYear - 18, currentYear - 4]);
    setLevelRange([1, 20]);
    setXpRange([0, 10000]);
  };

  const getActiveFilterChips = () => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];

    if (searchTerm) {
      chips.push({
        label: `Recherche: "${searchTerm}"`,
        onRemove: () => setSearchTerm('')
      });
    }

    if (ageRange[0] !== currentYear - 18 || ageRange[1] !== currentYear - 4) {
      chips.push({
        label: `Âge: ${currentYear - ageRange[1]}-${currentYear - ageRange[0]} ans`,
        onRemove: () => setAgeRange([currentYear - 18, currentYear - 4])
      });
    }

    if (levelRange[0] !== 1 || levelRange[1] !== 20) {
      chips.push({
        label: `Niveau: ${levelRange[0]}-${levelRange[1]}`,
        onRemove: () => setLevelRange([1, 20])
      });
    }

    if (xpRange[0] !== 0 || xpRange[1] !== 10000) {
      chips.push({
        label: `XP: ${xpRange[0]}-${xpRange[1]}`,
        onRemove: () => setXpRange([0, 10000])
      });
    }

    return chips;
  };

  const activeFilterChips = getActiveFilterChips();




  return (
    <section className="py-20 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Tableau de bord parent
            </h2>
            <p className="text-xl text-slate-300">Gérez les profils de vos enfants</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              onClick={() => window.location.href = '/reports'}
              variant="outline"
              className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
            >
              <FileText className="w-4 h-4 mr-2" />
              Rapports
            </Button>
            <Button
              onClick={() => window.location.href = '/goals'}
              variant="outline"
              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            >
              <Target className="w-4 h-4 mr-2" />
              Objectifs
            </Button>
            <Button
              onClick={() => window.location.href = '/billing'}
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Abonnement
            </Button>
            <Button
              onClick={() => window.location.href = '/security'}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              Sécurité
            </Button>
            <MessagingPanel currentUserId={user?.id || ''} userRole="parent" />
          </div>
        </div>

        <Tabs defaultValue="children" className="space-y-8">
          <TabsList className="grid w-full grid-cols-8 bg-slate-900/50 border border-cyan-500/20">


            <TabsTrigger value="children">Enfants</TabsTrigger>
            <TabsTrigger value="analytics">Activités</TabsTrigger>
            <TabsTrigger value="ai-insights">IA Insights</TabsTrigger>
            <TabsTrigger value="controls">Contrôles</TabsTrigger>
            <TabsTrigger value="rewards">Récompenses</TabsTrigger>
            <TabsTrigger value="store">Boutique</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>





          <TabsContent value="children">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold text-white">Profils enfants</h3>
                  <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                      className={viewMode === 'grid' ? 'bg-cyan-500' : 'text-slate-400'}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('timeline')}
                      className={viewMode === 'timeline' ? 'bg-cyan-500' : 'text-slate-400'}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {viewMode === 'grid' && (
                    <Button 
                      onClick={toggleSelectionMode}
                      variant="outline" 
                      className={`border-purple-500/50 text-purple-400 hover:bg-purple-500/10 ${
                        selectionMode ? 'bg-purple-500/20' : ''
                      }`}
                      disabled={children.length === 0}
                    >
                      <CheckSquare className="w-4 h-4 mr-2" /> 
                      {selectionMode ? 'Annuler' : 'Sélectionner'}
                    </Button>
                  )}
                  <Button 
                    onClick={handleCSVExport}
                    variant="outline" 
                    className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                    disabled={children.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </Button>
                  <Button 
                    onClick={() => setCsvImportOpen(true)}
                    variant="outline" 
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Importer
                  </Button>

                  <Dialog
                    open={addDialogOpen}
                    onOpenChange={(open) => {
                      setAddDialogOpen(open);
                      if (open) setAddError('');
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-cyan-500 to-purple-500">
                        <Plus className="w-4 h-4 mr-2" /> Ajouter
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-cyan-500/20 max-h-[92vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-white">Nouveau profil enfant</DialogTitle>
                      </DialogHeader>
                      <ChildProfileForm
                        onSubmit={handleAddChild}
                        loading={loading}
                        submitError={addError}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <>
                  <FilterBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    ageRange={ageRange}
                    onAgeRangeChange={setAgeRange}
                    levelRange={levelRange}
                    onLevelRangeChange={setLevelRange}
                    xpRange={xpRange}
                    onXpRangeChange={setXpRange}
                    onResetFilters={resetFilters}
                    hasActiveFilters={hasActiveFilters}
                  />

                  {activeFilterChips.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {activeFilterChips.map((chip, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 pl-3 pr-2 py-1 flex items-center gap-2"
                        >
                          {chip.label}
                          <button
                            onClick={chip.onRemove}
                            className="hover:bg-cyan-500/30 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {filteredChildren.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-400 text-lg">
                        {children.length === 0 
                          ? "Aucun enfant enregistré. Ajoutez votre premier enfant !" 
                          : "Aucun enfant ne correspond aux filtres sélectionnés."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredChildren.map((child) => (
                        <ChildCard
                          key={child.id}
                          child={child}
                          onEdit={() => { setSelectedChild(child); setEditDialogOpen(true); }}
                          onDelete={() => { setSelectedChild(child); setDeleteDialogOpen(true); }}
                          selectionMode={selectionMode}
                          selected={selectedChildren.has(child.id)}
                          onSelect={(selected) => handleChildSelection(child.id, selected)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <ActivityTimeline children={children} />
              )}
            </div>



          </TabsContent>

          <TabsContent value="analytics">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8">
              <DetailedActivityView children={children} />
            </div>
          </TabsContent>
          <TabsContent value="ai-insights">
            <FeatureGate
              isLocked={!subscriptionInfo.hasAIAssistant}
              featureName="IA Insights"
              requiredTier="PREMIUM"
              description="Accédez aux insights IA avancés avec un plan Premium ou supérieur."
            >
              <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8">
                {children.length > 0 ? (
                  <AIInsightsDashboard childId={children[0].id} />
                ) : (
                  <p className="text-slate-400 text-center py-12">
                    Ajoutez un enfant pour voir les insights IA
                  </p>
                )}
              </div>
            </FeatureGate>
          </TabsContent>


          <TabsContent value="controls"><ParentalControls /></TabsContent>
          <TabsContent value="rewards"><RewardsManagement parentId={user?.id || ''} /></TabsContent>
          
          <TabsContent value="store">
            <div className="space-y-6">
              <PendingApprovalsPanel />
              <div className="grid lg:grid-cols-2 gap-6">
                <StoreSettingsPanel />
                <PurchaseHistoryView />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-8">
              <ScreenTimeReport />
              <ComprehensiveAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-8 flex justify-center">
              <NotificationSettings />
            </div>
          </TabsContent>

        </Tabs>


        <BulkActionBar
          selectedCount={selectedChildren.size}
          onEdit={() => setBulkEditOpen(true)}
          onDelete={() => setBulkDeleteOpen(true)}
          onClear={() => {
            setSelectedChildren(new Set());
            setSelectionMode(false);
          }}
        />


        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-slate-900 border-cyan-500/20">
            <DialogHeader>
              <DialogTitle className="text-white">Modifier le profil</DialogTitle>
            </DialogHeader>
            <ChildProfileForm childData={selectedChild} onSubmit={handleEditChild} loading={loading} />
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-900 border-red-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Supprimer le profil
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Êtes-vous sûr de vouloir supprimer le profil de {selectedChild?.pseudo} ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-white">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteChild} className="bg-red-500 hover:bg-red-600">
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <CSVImportModal
          open={csvImportOpen}
          onClose={() => setCsvImportOpen(false)}
          onImport={handleCSVImport}
        />

        <BulkEditModal
          open={bulkEditOpen}
          onClose={() => setBulkEditOpen(false)}
          onSave={handleBulkEdit}
          selectedCount={selectedChildren.size}
        />

        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent className="bg-slate-900 border-red-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Supprimer plusieurs profils
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Êtes-vous sûr de vouloir supprimer {selectedChildren.size} profil(s) ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-white">Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkDelete} className="bg-red-500 hover:bg-red-600">
                Supprimer tout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Upgrade Dialog for Free Plan Limit */}
        <AlertDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
          <AlertDialogContent className="bg-slate-900 border-yellow-500/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-500" />
                Limite atteinte - Plan Gratuit
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Vous avez atteint la limite de 1 enfant pour le plan gratuit. 
                Passez à un plan supérieur pour ajouter plus d'enfants et débloquer des fonctionnalités premium !
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-white">Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => window.location.href = '/billing'}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Voir les plans
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


      </div>
    </section>
  );
};

export default ParentDashboard;
