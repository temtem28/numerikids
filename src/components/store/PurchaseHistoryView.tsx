import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Coins, Package, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PurchaseRecord {
  id: string;
  item_name: string;
  item_type: string;
  cost: number;
  purchased_at: string;
  was_approved: boolean;
  child_id: string;
}

interface Child {
  id: string;
  name: string;
}

export function PurchaseHistoryView() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    loadPurchaseHistory();
  }, [selectedChildId]);

  const loadChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('children')
      .select('id, name')
      .eq('parent_id', user.id)
      .order('name');

    setChildren(data || []);
  };

  const loadPurchaseHistory = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let query = supabase
      .from('purchase_history')
      .select('*, children!inner(parent_id)')
      .eq('children.parent_id', user.id)
      .order('purchased_at', { ascending: false });

    if (selectedChildId !== 'all') {
      query = query.eq('child_id', selectedChildId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPurchases(data);
      const total = data.reduce((sum, p) => sum + p.cost, 0);
      setTotalSpent(total);
    }
    setLoading(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'avatar':
        return '👤';
      case 'theme':
        return '🎨';
      case 'power-up':
        return '⚡';
      default:
        return '📦';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Purchase History
        </CardTitle>
        <CardDescription>
          View all store purchases made by your children
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              {children.map(child => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold">{totalSpent}</span>
            <span className="text-muted-foreground">coins spent</span>
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading...
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No purchases yet
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getTypeIcon(purchase.item_type)}</div>
                    <div>
                      <div className="font-medium">{purchase.item_name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(purchase.purchased_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {purchase.was_approved && (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 font-semibold">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      {purchase.cost}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
