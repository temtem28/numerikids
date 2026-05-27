import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, RefreshCw, Save, TestTube } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SubjectLineGenerator() {
  const [category, setCategory] = useState('educational');
  const [tone, setTone] = useState('friendly');
  const [generating, setGenerating] = useState(false);
  const [generatedLines, setGeneratedLines] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState('');
  const { toast } = useToast();

  const generateSubjectLines = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('subject-line-ai', {
        body: { action: 'generate', category, tone, count: 5 }
      });

      if (error) throw error;
      setGeneratedLines(data.subjectLines || []);
      toast({ title: 'Subject lines generated!', description: `Created ${data.subjectLines?.length || 0} variants` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const saveSubjectLine = async (text: string) => {
    try {
      const { error } = await supabase.from('subject_lines').insert({
        subject_text: text,
        category,
        tone,
        generated_by_ai: true,
        status: 'draft'
      });

      if (error) throw error;
      toast({ title: 'Saved!', description: 'Subject line saved to library' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="educational">Educational</SelectItem>
              <SelectItem value="promotional">Promotional</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tone</Label>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="playful">Playful</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button onClick={generateSubjectLines} disabled={generating} className="w-full">
            {generating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Generate
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {generatedLines.map((line, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{line.text}</p>
                <p className="text-sm text-muted-foreground mt-1">{line.reasoning}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => saveSubjectLine(line.text)}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
