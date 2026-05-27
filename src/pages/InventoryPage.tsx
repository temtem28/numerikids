import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getChildSessionProfile } from '@/utils/childSession';

export default function InventoryPage() {
  const { user, currentChild } = useAuth();
  const pinChild = !user ? getChildSessionProfile() : null;
  const effectiveChildId = currentChild?.id ?? pinChild?.id ?? null;

  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadInventory = useCallback(async () => {
    if (!effectiveChildId) {
      setInventory([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('user_inventory')
      .select('*, store_items(*)')
      .eq('user_id', effectiveChildId);

    if (data) setInventory(data);
    setLoading(false);
  }, [effectiveChildId]);

  useEffect(() => {
    setLoading(true);
    loadInventory();
  }, [loadInventory]);

  const toggleEquip = async (invId: string, currentState: boolean) => {
    const { error } = await supabase
      .from('user_inventory')
      .update({ is_equipped: !currentState })
      .eq('id', invId);

    if (!error) {
      toast({ title: currentState ? 'Item unequipped' : 'Item equipped!' });
      loadInventory();
    }
  };

  const filterByCategory = (category: string) =>
    inventory.filter(i => i.store_items?.category === category);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-8 h-8" />
        <h1 className="text-4xl font-bold">My Inventory</h1>
      </div>

      {inventory.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">Your inventory is empty. Visit the store to purchase items!</p>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Items ({inventory.length})</TabsTrigger>
            <TabsTrigger value="avatar">Avatars</TabsTrigger>
            <TabsTrigger value="powerup">Power-ups</TabsTrigger>
            <TabsTrigger value="badge">Badges</TabsTrigger>
            <TabsTrigger value="theme">Themes</TabsTrigger>
            <TabsTrigger value="bonus_lesson">Bonus Lessons</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {inventory.map(inv => (
              <Card key={inv.id}>
                {inv.store_items?.image_url && (
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50">
                    <img src={inv.store_items.image_url} alt={inv.store_items.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{inv.store_items?.name}</h3>
                    {inv.is_equipped && <Badge variant="default">Equipped</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{inv.store_items?.description}</p>
                  <Button 
                    onClick={() => toggleEquip(inv.id, inv.is_equipped)}
                    variant={inv.is_equipped ? 'outline' : 'default'}
                    className="w-full"
                  >
                    {inv.is_equipped ? 'Unequip' : 'Equip'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {['avatar', 'powerup', 'badge', 'theme', 'bonus_lesson'].map(cat => (
            <TabsContent key={cat} value={cat} className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
              {filterByCategory(cat).map(inv => (
                <Card key={inv.id}>
                  {inv.store_items?.image_url && (
                    <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50">
                      <img src={inv.store_items.image_url} alt={inv.store_items.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{inv.store_items?.name}</h3>
                      {inv.is_equipped && <Badge>Equipped</Badge>}
                    </div>
                    <Button 
                      onClick={() => toggleEquip(inv.id, inv.is_equipped)}
                      variant={inv.is_equipped ? 'outline' : 'default'}
                      className="w-full mt-2"
                    >
                      {inv.is_equipped ? 'Unequip' : 'Equip'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
