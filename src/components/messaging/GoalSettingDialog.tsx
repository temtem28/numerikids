import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface GoalSettingDialogProps {
  childId: string;
  parentId: string;
  onGoalCreated?: () => void;
}

export function GoalSettingDialog({ childId, parentId, onGoalCreated }: GoalSettingDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState('lessons');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [rewardCoins, setRewardCoins] = useState('50');
  const [loading, setLoading] = useState(false);

  const handleCreateGoal = async () => {
    if (!title.trim() || !targetValue) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('learning_goals').insert({
        child_id: childId,
        parent_id: parentId,
        title: title.trim(),
        description: description.trim(),
        goal_type: goalType,
        target_value: parseInt(targetValue),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        reward_coins: parseInt(rewardCoins)
      });

      if (error) throw error;

      // Send notification message to child
      await supabase.from('messages').insert({
        sender_id: parentId,
        receiver_id: childId,
        content: `New goal set: ${title}`,
        message_type: 'goal',
        metadata: { goalType, targetValue: parseInt(targetValue), rewardCoins: parseInt(rewardCoins) }
      });

      toast.success('Goal created successfully!');
      setOpen(false);
      resetForm();
      onGoalCreated?.();
    } catch (error) {
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGoalType('lessons');
    setTargetValue('');
    setDeadline('');
    setRewardCoins('50');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Target className="w-4 h-4 mr-2" />
          Set Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Learning Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Goal Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Complete 5 lessons this week" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details about this goal..." rows={2} />
          </div>
          <div>
            <Label>Goal Type *</Label>
            <Select value={goalType} onValueChange={setGoalType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lessons">Complete Lessons</SelectItem>
                <SelectItem value="xp">Earn XP Points</SelectItem>
                <SelectItem value="time">Study Time (minutes)</SelectItem>
                <SelectItem value="achievements">Unlock Achievements</SelectItem>
                <SelectItem value="custom">Custom Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Target Value *</Label>
              <Input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="5" />
            </div>
            <div>
              <Label>Reward Coins</Label>
              <Input type="number" value={rewardCoins} onChange={(e) => setRewardCoins(e.target.value)} placeholder="50" />
            </div>
          </div>
          <div>
            <Label>Deadline (Optional)</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <Button onClick={handleCreateGoal} disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Goal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
