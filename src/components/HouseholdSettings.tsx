import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import HouseholdInfoForm from './household/HouseholdInfoForm';
import ChildManagementPanel from './household/ChildManagementPanel';
import FamilyGoalsForm from './household/FamilyGoalsForm';
import ChildProfileForm from './ChildProfileForm';
import DashboardLayout from './DashboardLayout';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Home, Users, Target, Loader2 } from 'lucide-react';
import {
  ensureHouseholdForParent,
  insertChildProfileCompat,
  type ChildFormPayload,
} from '@/utils/childProfileCreate';
import type { ChildProfile } from '@/types/database.types';

export default function HouseholdSettings() {
  const { user, children, refreshChildProfiles, refreshParentProfile } = useAuth();
  const [household, setHousehold] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    if (user?.id) {
      void loadHousehold();
    } else {
      setLoading(false);
      setHousehold(null);
    }
  }, [user?.id]);

  const loadHousehold = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const parentId = user.id;
      const hid = await ensureHouseholdForParent(parentId);
      if (!hid) {
        setHousehold(null);
        toast.error('Impossible de charger ou de créer le foyer familial.');
        return;
      }
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .eq('id', hid)
        .single();

      if (error) throw error;
      setHousehold(data);
    } catch {
      toast.error('Erreur lors du chargement des données du foyer');
      setHousehold(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChildUpdate = () => {
    void refreshParentProfile();
    void refreshChildProfiles();
    void loadHousehold();
    setShowAddChild(false);
  };

  const handleAddChildSubmit = async (childData: ChildFormPayload) => {
    setAddError('');
    if (!user?.id) {
      setAddError('Session expirée. Reconnecte-toi puis réessaie.');
      toast.error('Session requise');
      return;
    }
    setAddLoading(true);
    try {
      const parentId = user.id;
      const hid = await ensureHouseholdForParent(parentId);
      if (!hid) {
        setAddError('Impossible de créer ou charger le foyer familial.');
        toast.error('Foyer introuvable', {
          description: 'Impossible de créer ou charger le foyer familial.',
        });
        return;
      }
      let insertedChildId = '';
      try {
        const inserted = await insertChildProfileCompat(parentId, hid, childData);
        insertedChildId = inserted.childId;
      } catch (error: any) {
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
        parent_id: user.id,
        name: displayName,
        age,
        avatar_url: childData.avatar_url || undefined,
        grade_level: childData.grade_level || 'CE2',
        xp_points: 0,
        coins: 100,
        streak_days: 0,
        is_active: true,
        household_id: hid,
      };

      toast.success('Profil enfant créé', {
        description: `${displayName} a été ajouté.`,
      });
      await refreshChildProfiles(optimisticProfile);
      await refreshParentProfile();
      setShowAddChild(false);
      await loadHousehold();
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Gestion du foyer">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!household) {
    return (
      <DashboardLayout title="Gestion du foyer">
        <div className="p-6 text-center space-y-4">
          <p className="text-slate-400">Aucun foyer disponible pour ce compte.</p>
          <button
            type="button"
            className="text-cyan-400 underline text-sm"
            onClick={() => void loadHousehold()}
          >
            Réessayer
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestion du foyer" subtitle="Gérez votre famille et vos objectifs">
      <div className="p-6 max-w-5xl mx-auto">
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-cyan-500/20">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Informations</span>
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Enfants</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Objectifs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <HouseholdInfoForm
              householdId={household.id}
              initialName={household.name}
              initialTimezone={household.timezone}
            />
          </TabsContent>

          <TabsContent value="children">
            <ChildManagementPanel
              children={children || []}
              onChildAdded={() => setShowAddChild(true)}
              onChildRemoved={handleChildUpdate}
            />
          </TabsContent>

          <TabsContent value="goals">
            <FamilyGoalsForm
              householdId={household.id}
              initialGoals={household.family_goals}
            />
          </TabsContent>
        </Tabs>

        <Dialog
          open={showAddChild}
          onOpenChange={(open) => {
            setShowAddChild(open);
            if (open) setAddError('');
          }}
        >
          <DialogContent className="max-w-2xl bg-slate-900 border-cyan-500/20 max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Ajouter un profil enfant</DialogTitle>
            </DialogHeader>
            <ChildProfileForm
              onSubmit={handleAddChildSubmit}
              loading={addLoading}
              submitError={addError}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
