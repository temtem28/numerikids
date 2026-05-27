import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CursorAwareInput } from './CursorAwareInput';

export function DialogueEditor({ chapterId, dialogues, setDialogues }: any) {
  const { toast } = useToast();

  const addDialogue = () => {
    setDialogues([...dialogues, { 
      character_name: '', 
      dialogue_text: '', 
      emotion: 'neutral', 
      order_index: dialogues.length,
      response_options: []
    }]);
  };

  const updateDialogue = (index: number, field: string, value: any) => {
    const updated = [...dialogues];
    updated[index] = { ...updated[index], [field]: value };
    setDialogues(updated);
  };

  const removeDialogue = (index: number) => {
    setDialogues(dialogues.filter((_: any, i: number) => i !== index));
  };

  const addResponseOption = (dialogueIndex: number) => {
    const updated = [...dialogues];
    const responses = updated[dialogueIndex].response_options || [];
    updated[dialogueIndex].response_options = [...responses, { text: '', next_dialogue_id: null }];
    setDialogues(updated);
  };

  const updateResponseOption = (dialogueIndex: number, responseIndex: number, field: string, value: any) => {
    const updated = [...dialogues];
    updated[dialogueIndex].response_options[responseIndex][field] = value;
    setDialogues(updated);
  };

  const removeResponseOption = (dialogueIndex: number, responseIndex: number) => {
    const updated = [...dialogues];
    updated[dialogueIndex].response_options = updated[dialogueIndex].response_options.filter((_: any, i: number) => i !== responseIndex);
    setDialogues(updated);
  };

  const saveDialogues = async () => {
    const dialoguesWithChapter = dialogues.map((d: any) => ({ ...d, chapter_id: chapterId }));
    const { error } = await supabase.functions.invoke('saga-manager', {
      body: { action: 'save_dialogues', data: { chapterId, dialogues: dialoguesWithChapter } }
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Dialogues saved!' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">Character Dialogues</h3>
        <div className="space-x-2">
          <Button onClick={addDialogue} size="sm"><Plus className="h-4 w-4 mr-2" />Add</Button>
          <Button onClick={saveDialogues} size="sm"><Save className="h-4 w-4 mr-2" />Save</Button>
        </div>
      </div>
      {dialogues.map((dialogue: any, index: number) => (
        <Card key={index} className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <CursorAwareInput 
                  fieldId={`dialogue-${chapterId}-${index}-character_name`}
                  placeholder="Character Name" 
                  value={dialogue.character_name} 
                  onChange={(e) => updateDialogue(index, 'character_name', e.target.value)} 
                />
                <Select value={dialogue.emotion} onValueChange={(v) => updateDialogue(index, 'emotion', v)}>
                  <SelectTrigger><SelectValue placeholder="Emotion" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="happy">Happy</SelectItem>
                    <SelectItem value="sad">Sad</SelectItem>
                    <SelectItem value="excited">Excited</SelectItem>
                    <SelectItem value="thinking">Thinking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CursorAwareInput 
                fieldId={`dialogue-${chapterId}-${index}-dialogue_text`}
                placeholder="Dialogue text..." 
                value={dialogue.dialogue_text} 
                onChange={(e) => updateDialogue(index, 'dialogue_text', e.target.value)} 
                multiline
                rows={2}
              />
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Options</span>
                  <Button onClick={() => addResponseOption(index)} size="sm" variant="outline">
                    <Plus className="h-3 w-3 mr-1" />Add Response
                  </Button>
                </div>
                {(dialogue.response_options || []).map((response: any, responseIndex: number) => (
                  <div key={responseIndex} className="flex gap-2 items-center">
                    <CursorAwareInput 
                      fieldId={`dialogue-${chapterId}-${index}-response-${responseIndex}-text`}
                      placeholder="Response option text..." 
                      value={response.text} 
                      onChange={(e) => updateResponseOption(index, responseIndex, 'text', e.target.value)} 
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeResponseOption(index, responseIndex)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => removeDialogue(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}