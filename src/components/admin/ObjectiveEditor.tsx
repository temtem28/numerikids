import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CursorAwareInput } from './CursorAwareInput';

export function ObjectiveEditor({ chapterId, questId, objectives, setObjectives }: any) {
  const { toast } = useToast();

  const addObjective = () => {
    setObjectives([...objectives, { title: '', description: '', objective_type: 'lesson', is_optional: false, order_index: objectives.length }]);
  };

  const updateObjective = (index: number, field: string, value: any) => {
    const updated = [...objectives];
    updated[index] = { ...updated[index], [field]: value };
    setObjectives(updated);
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_: any, i: number) => i !== index));
  };

  const saveObjectives = async () => {
    const objectivesWithIds = objectives.map((o: any) => ({ ...o, chapter_id: chapterId, quest_id: questId }));
    const { error } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'save_objectives', data: { chapterId, objectives: objectivesWithIds } }
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Objectives saved!' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Quest Objectives</h3>
        <div className="space-x-2">
          <Button onClick={addObjective} size="sm"><Plus className="h-4 w-4 mr-2" />Add</Button>
          <Button onClick={saveObjectives} size="sm"><Save className="h-4 w-4 mr-2" />Save</Button>
        </div>
      </div>
      {objectives.map((objective: any, index: number) => (
        <Card key={index} className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <CursorAwareInput 
                placeholder="Objective Title" 
                value={objective.title} 
                onChange={(e) => updateObjective(index, 'title', e.target.value)}
                fieldId={`objective-${chapterId}-${index}-title`}
                questId={questId}
              />
              <CursorAwareInput 
                placeholder="Description" 
                value={objective.description} 
                onChange={(e) => updateObjective(index, 'description', e.target.value)}
                fieldId={`objective-${chapterId}-${index}-description`}
                questId={questId}
                multiline
                rows={2}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select value={objective.objective_type} onValueChange={(v) => updateObjective(index, 'objective_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lesson">Lesson</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                    <SelectItem value="exploration">Exploration</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Switch checked={objective.is_optional} onCheckedChange={(v) => updateObjective(index, 'is_optional', v)} />
                  <Label>Optional</Label>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeObjective(index)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </Card>
      ))}
    </div>
  );
}