import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function BranchEditor({ chapterId, branches, setBranches }: any) {
  const { toast } = useToast();

  const addBranch = () => {
    setBranches([...branches, { condition_type: 'choice', branch_label: '', condition_value: {} }]);
  };

  const updateBranch = (index: number, field: string, value: any) => {
    const updated = [...branches];
    updated[index] = { ...updated[index], [field]: value };
    setBranches(updated);
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_: any, i: number) => i !== index));
  };

  const saveBranches = async () => {
    const branchesWithChapter = branches.map((b: any) => ({ ...b, chapter_id: chapterId }));
    const { error } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'save_branches', data: { chapterId, branches: branchesWithChapter } }
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Branches saved!' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Story Branches</h3>
        <div className="space-x-2">
          <Button onClick={addBranch} size="sm"><Plus className="h-4 w-4 mr-2" />Add</Button>
          <Button onClick={saveBranches} size="sm"><Save className="h-4 w-4 mr-2" />Save</Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Create branching paths based on user choices or progress</p>
      {branches.map((branch: any, index: number) => (
        <Card key={index} className="p-4">
          <div className="flex justify-between items-center gap-3">
            <Select value={branch.condition_type} onValueChange={(v) => updateBranch(index, 'condition_type', v)}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="choice">User Choice</SelectItem>
                <SelectItem value="score">Score Threshold</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="item">Has Item</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Branch Label" value={branch.branch_label} onChange={(e) => updateBranch(index, 'branch_label', e.target.value)} className="flex-1" />
            <Input placeholder="Next Chapter ID" value={branch.next_chapter_id || ''} onChange={(e) => updateBranch(index, 'next_chapter_id', e.target.value)} className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => removeBranch(index)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}