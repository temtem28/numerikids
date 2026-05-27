import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Coins, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PendingPurchase {
  id: string;
  child_id: string;
  item_id: string;
  cost: number;
  requested_at: string;
  children: { name: string };
  store_items: { name: string; type: string };
}

export function PendingApprovalsPanel() {
  const [pending, setPending] = useState<PendingPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<PendingPurchase | null>(null);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPendingPurchases();
    
    // Subscribe to changes
    const channel = supabase
      .channel('pending_purchases_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pending_purchases'
      }, () => {
        loadPendingPurchases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadPendingPurchases = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('pending_purchases')
      .select(`
        *,
        children!inner(name, parent_id),
        store_items(name, type)
      `)
      .eq('children.parent_id', user.id)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });

    if (!error && data) {
      setPending(data);
    }
    setLoading(false);
  };

  const handleDecision = async (purchaseId: string, approve: boolean) => {
    setProcessing(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const status = approve ? 'approved' : 'rejected';

    // Update pending purchase
    const { error: updateError } = await supabase
      .from('pending_purchases')
      .update({
        status,
        resolved_at: new Date().toISOString(),
        resolved_by: user.id,
        parent_note: note || null
      })
      .eq('id', purchaseId);

    if (updateError) {
      toast.error('Failed to process decision');
      setProcessing(false);
      return;
    }

    // If approved, execute the purchase
    if (approve && selectedPurchase) {
      const { error: purchaseError } = await supabase.rpc('purchase_store_item', {
        p_child_id: selectedPurchase.child_id,
        p_item_id: selectedPurchase.item_id,
        p_cost: selectedPurchase.cost
      });

      if (purchaseError) {
        toast.error('Purchase approved but failed to complete');
        setProcessing(false);
        return;
      }

      // Record in history
      await supabase.from('purchase_history').insert({
        child_id: selectedPurchase.child_id,
        item_id: selectedPurchase.item_id,
        item_name: selectedPurchase.store_items.name,
        item_type: selectedPurchase.store_items.type,
        cost: selectedPurchase.cost,
        approved_by: user.id,
        was_approved: true
      });
    }

    toast.success(approve ? 'Purchase approved' : 'Purchase rejected');
    setSelectedPurchase(null);
    setNote('');
    setProcessing(false);
    loadPendingPurchases();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Pending Approvals
            {pending.length > 0 && (
              <Badge variant="destructive">{pending.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and approve purchase requests from your children
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : pending.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending approvals
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{purchase.store_items.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {purchase.children.name} • {format(new Date(purchase.requested_at), 'MMM d, h:mm a')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 font-semibold">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        {purchase.cost}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPurchase(purchase)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedPurchase} onOpenChange={() => setSelectedPurchase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Purchase Request</DialogTitle>
            <DialogDescription>
              Decide whether to approve or reject this purchase
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Child:</span>
                  <span className="font-medium">{selectedPurchase.children.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Item:</span>
                  <span className="font-medium">{selectedPurchase.store_items.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Cost:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    {selectedPurchase.cost}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Requested:</span>
                  <span className="font-medium">
                    {format(new Date(selectedPurchase.requested_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Note (optional)</label>
                <Textarea
                  placeholder="Add a note for your child..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleDecision(selectedPurchase!.id, false)}
              disabled={processing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleDecision(selectedPurchase!.id, true)}
              disabled={processing}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
