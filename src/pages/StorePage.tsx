import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { StoreItemCard } from '@/components/store/StoreItemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import { useChildStats } from '@/hooks/useChildStats';
import { Coins, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getChildSessionProfile } from '@/utils/childSession';

export default function StorePage() {
  const { user, currentChild } = useAuth();
  const pinChild = !user ? getChildSessionProfile() : null;
  const effectiveChildId = currentChild?.id ?? pinChild?.id ?? null;

  const [items, setItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const { coinBalance: coins, loading: coinsLoading } = useChildStats(effectiveChildId);

  const loadStoreSettings = useCallback(async () => {
    if (!effectiveChildId) return;

    const { data } = await supabase
      .from('store_settings')
      .select('*')
      .eq('child_id', effectiveChildId)
      .single();

    setStoreSettings(data);
  }, [effectiveChildId]);

  const loadStoreData = useCallback(async () => {
    if (!effectiveChildId) {
      setItems([]);
      setInventory([]);
      setLoading(false);
      return;
    }

    const [itemsRes, invRes] = await Promise.all([
      supabase.from('store_items').select('*').eq('is_available', true),
      supabase.from('user_inventory').select('item_id').eq('user_id', effectiveChildId),
    ]);

    if (itemsRes.data) setItems(itemsRes.data);
    if (invRes.data) setInventory(invRes.data.map((i) => i.item_id));
    setLoading(false);
  }, [effectiveChildId]);

  useEffect(() => {
    setLoading(true);
    loadStoreData();
    loadStoreSettings();
  }, [loadStoreData, loadStoreSettings]);

  const handlePurchase = async (itemId: string) => {
    if (purchasing) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (storeSettings && !storeSettings.store_enabled) {
      toast.error('Boutique désactivée', {
        description: 'L\'accès à la boutique a été désactivé par vos parents.'
      });
      return;
    }

    if (inventory.includes(itemId)) {
      toast.error('Déjà possédé', {
        description: 'Vous possédez déjà cet article !'
      });
      return;
    }

    if (coins < item.price) {
      toast.error('Fonds insuffisants', {
        description: `Il vous manque ${item.price - coins} pièces.`
      });
      return;
    }

    if (!effectiveChildId) return;

    if (storeSettings?.approval_threshold && item.price >= storeSettings.approval_threshold) {
      setPurchasing(true);
      try {
        const { error } = await supabase.from('pending_purchases').insert({
          child_id: effectiveChildId,
          item_id: itemId,
          cost: item.price
        });

        if (error) throw error;

        toast.info('Approbation requise', {
          description: 'Votre demande d\'achat a été envoyée à vos parents pour approbation.'
        });
      } catch (error: any) {
        toast.error('Erreur', {
          description: error.message || 'Échec de la soumission de la demande'
        });
      } finally {
        setPurchasing(false);
      }
      return;
    }

    const { data: limitCheck } = await supabase.rpc('check_spending_limits', {
      p_child_id: effectiveChildId,
      p_cost: item.price
    });

    if (limitCheck && !limitCheck.allowed) {
      toast.error('Limite de dépenses', {
        description: limitCheck.reason || 'Vous avez atteint votre limite de dépenses.'
      });
      return;
    }

    setPurchasing(true);

    try {
      const { data, error } = await supabase.rpc('purchase_store_item', {
        p_user_id: effectiveChildId,
        p_item_id: itemId,
        p_item_cost: item.price
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; new_balance?: number };

      if (!result.success) {
        toast.error('Achat échoué', {
          description: result.error || 'Une erreur est survenue'
        });
        return;
      }

      await supabase.from('purchase_history').insert({
        child_id: effectiveChildId,
        item_id: itemId,
        item_name: item.name,
        item_type: item.category,
        cost: item.price,
        was_approved: false
      });

      setInventory(prev => [...prev, itemId]);
      
      toast.success('Achat réussi !', {
        description: `${item.name} ajouté à l'inventaire !`
      });
      
    } catch (error: any) {
      toast.error('Erreur', {
        description: error.message || 'Échec de l\'achat'
      });
    } finally {
      setPurchasing(false);
    }
  };

  const filterByCategory = (category: string) => 
    items.filter(i => i.category === category);

  if (loading || coinsLoading) {
    return (
      <DashboardLayout title="Boutique de récompenses">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Boutique de récompenses" 
      subtitle="Dépensez vos pièces pour des récompenses exclusives"
      actions={
        <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-lg">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-xl font-bold text-yellow-400">{coins}</span>
        </div>
      }
    >
      <div className="p-6">
        <Tabs defaultValue="all">
          <TabsList className="bg-slate-900/50 border border-cyan-500/20">
            <TabsTrigger value="all">Tous</TabsTrigger>
            <TabsTrigger value="avatar">Avatars</TabsTrigger>
            <TabsTrigger value="powerup">Power-ups</TabsTrigger>
            <TabsTrigger value="badge">Badges</TabsTrigger>
            <TabsTrigger value="theme">Thèmes</TabsTrigger>
            <TabsTrigger value="bonus_lesson">Bonus</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {items.map(item => (
              <StoreItemCard 
                key={item.id} 
                item={item} 
                owned={inventory.includes(item.id)}
                onPurchase={handlePurchase}
                disabled={purchasing}
                userCoins={coins}
              />
            ))}
          </TabsContent>

          {['avatar', 'powerup', 'badge', 'theme', 'bonus_lesson'].map(cat => (
            <TabsContent key={cat} value={cat} className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {filterByCategory(cat).map(item => (
                <StoreItemCard 
                  key={item.id} 
                  item={item} 
                  owned={inventory.includes(item.id)}
                  onPurchase={handlePurchase}
                  disabled={purchasing}
                  userCoins={coins}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
