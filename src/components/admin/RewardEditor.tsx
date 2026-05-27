import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function RewardEditor({ chapterId, questId, rewards, setRewards }: any) {
  const { toast } = useToast();

  const addReward = () => {
    setRewards([...rewards, { reward_type: 'coins', reward_value: 100, reward_description: '' }]);
  };

  const updateReward = (index: number, field: string, value: any) => {
    const updated = [...rewards];
    updated[index] = { ...updated[index], [field]: value };
    setRewards(updated);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_: any, i: number) => i !== index));
  };

  const saveRewards = async () => {
    const rewardsWithIds = rewards.map((r: any) => ({ ...r, chapter_id: chapterId, quest_id: questId }));
    const { error } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'save_rewards', data: { chapterId, rewards: rewardsWithIds } }
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Rewards saved!' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Quest Rewards</h3>
        <div className="space-x-2">
          <Button onClick={addReward} size="sm"><Plus className="h-4 w-4 mr-2" />Add</Button>
          <Button onClick={saveRewards} size="sm"><Save className="h-4 w-4 mr-2" />Save</Button>
        </div>
      </div>
      {rewards.map((reward: any, index: number) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center gap-3">
            <Select value={reward.reward_type} onValueChange={(v) => updateReward(index, 'reward_type', v)}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="coins">Coins</SelectItem>
                <SelectItem value="xp">XP</SelectItem>
                <SelectItem value="badge">Badge</SelectItem>
                <SelectItem value="item">Item</SelectItem>
                <SelectItem value="unlock">Unlock</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Value" value={reward.reward_value} onChange={(e) => updateReward(index, 'reward_value', parseInt(e.target.value))} className="w-[120px]" />
            <Input placeholder="Description" value={reward.reward_description} onChange={(e) => updateReward(index, 'reward_description', e.target.value)} className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => removeReward(index)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}