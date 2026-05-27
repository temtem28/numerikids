import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Gift, Clock, Star, Sparkles } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  reward_type: string;
  value: number | null;
  icon: string;
  is_active: boolean;
}

export function RewardsManagement({ parentId }: { parentId: string }) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [open, setOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', cost: 50, reward_type: 'privilege', value: null as number | null, icon: '🎁' });
  const { toast } = useToast();

  useEffect(() => {
    loadRewards();
  }, [parentId]);

  const loadRewards = async () => {
    const { data } = await supabase.from('rewards').select('*').eq('parent_id', parentId).order('cost');
    if (data) setRewards(data);
  };

  const saveReward = async () => {
    if (!formData.title || formData.cost < 1) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs requis.", variant: "destructive" });
      return;
    }

    if (editingReward) {
      await supabase.from('rewards').update(formData).eq('id', editingReward.id);
      toast({ title: "Récompense mise à jour!" });
    } else {
      await supabase.from('rewards').insert({ ...formData, parent_id: parentId });
      toast({ title: "Récompense créée!" });
    }

    setOpen(false);
    setEditingReward(null);
    setFormData({ title: '', description: '', cost: 50, reward_type: 'privilege', value: null, icon: '🎁' });
    loadRewards();
  };

  const deleteReward = async (id: string) => {
    await supabase.from('rewards').delete().eq('id', id);
    toast({ title: "Récompense supprimée" });
    loadRewards();
  };

  const iconOptions = ['🎁', '⏰', '🍕', '🌙', '🎬', '🍦', '📚', '🎮', '🎡', '⭐', '🏆', '🎨', '🎵', '🚲'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestion des Récompenses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-500"><Plus className="w-4 h-4 mr-2" />Nouvelle Récompense</Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader><DialogTitle className="text-white">{editingReward ? 'Modifier' : 'Créer'} une Récompense</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label className="text-white">Titre</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-white">Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-white">Coût (pièces)</Label><Input type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })} className="bg-slate-800 border-slate-700 text-white" /></div>
              <div><Label className="text-white">Type</Label><Select value={formData.reward_type} onValueChange={(v) => setFormData({ ...formData, reward_type: v })}><SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-800 border-slate-700"><SelectItem value="privilege">Privilège</SelectItem><SelectItem value="screen_time">Temps d'écran</SelectItem><SelectItem value="physical">Récompense physique</SelectItem></SelectContent></Select></div>
              <div><Label className="text-white">Icône</Label><Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}><SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-800 border-slate-700">{iconOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
              <Button onClick={saveReward} className="w-full bg-cyan-500 hover:bg-cyan-600">Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="text-3xl">{reward.icon}</div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditingReward(reward); setFormData(reward); setOpen(true); }}><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => deleteReward(reward.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">{reward.title}</h3>
            <p className="text-sm text-slate-400 mb-3">{reward.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-500 font-bold">{reward.cost} pièces</span>
              <span className="text-slate-500 capitalize">{reward.reward_type}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default RewardsManagement;
