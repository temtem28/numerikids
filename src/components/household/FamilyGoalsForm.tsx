import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface FamilyGoalsFormProps {
  householdId: string;
  initialGoals?: any;
}

export default function FamilyGoalsForm({ householdId, initialGoals }: FamilyGoalsFormProps) {
  const [weeklyLessons, setWeeklyLessons] = useState(initialGoals?.weekly_lessons || 3);
  const [dailyMinutes, setDailyMinutes] = useState(initialGoals?.daily_minutes || 30);
  const [familyGoal, setFamilyGoal] = useState(initialGoals?.description || '');
  const [enableRewards, setEnableRewards] = useState(initialGoals?.enable_rewards ?? true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('households')
        .update({
          family_goals: {
            weekly_lessons: weeklyLessons,
            daily_minutes: dailyMinutes,
            description: familyGoal,
            enable_rewards: enableRewards
          }
        })
        .eq('id', householdId);

      if (error) throw error;
      toast.success('Family goals updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Family Learning Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="weekly-lessons">Weekly Lessons Target</Label>
            <Input
              id="weekly-lessons"
              type="number"
              min="1"
              max="20"
              value={weeklyLessons}
              onChange={(e) => setWeeklyLessons(parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="daily-minutes">Daily Learning Minutes</Label>
            <Input
              id="daily-minutes"
              type="number"
              min="10"
              max="180"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="family-goal">Family Goal Description</Label>
            <Textarea
              id="family-goal"
              value={familyGoal}
              onChange={(e) => setFamilyGoal(e.target.value)}
              placeholder="Describe your family's learning goals..."
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-rewards">Enable Reward System</Label>
            <Switch
              id="enable-rewards"
              checked={enableRewards}
              onCheckedChange={setEnableRewards}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Goals'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
