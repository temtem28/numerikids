import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface Variant {
  id: string;
  name: string;
  isControl: boolean;
  trafficPercentage: number;
  subjectLine: string;
  templateContent: string;
}

interface ABTestCreatorProps {
  templates: any[];
  onSave: (test: any) => void;
  onCancel: () => void;
}

export function ABTestCreator({ templates, onSave, onCancel }: ABTestCreatorProps) {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [testType, setTestType] = useState('subject_line');
  const [minSampleSize, setMinSampleSize] = useState(100);
  const [variants, setVariants] = useState<Variant[]>([
    { id: '1', name: 'Control', isControl: true, trafficPercentage: 50, subjectLine: '', templateContent: '' },
    { id: '2', name: 'Variant A', isControl: false, trafficPercentage: 50, subjectLine: '', templateContent: '' }
  ]);

  const addVariant = () => {
    const newVariant: Variant = {
      id: Date.now().toString(),
      name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      isControl: false,
      trafficPercentage: 0,
      subjectLine: '',
      templateContent: ''
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 2) {
      setVariants(variants.filter(v => v.id !== id));
    }
  };

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleSave = () => {
    onSave({
      name: testName,
      description,
      templateName,
      testType,
      minSampleSize,
      variants
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Test Name</Label>
          <Input value={testName} onChange={(e) => setTestName(e.target.value)} placeholder="Summer Campaign Test" />
        </div>
        <div>
          <Label>Base Template</Label>
          <Select value={templateName} onValueChange={setTemplateName}>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(t => <SelectItem key={t.name} value={t.name}>{t.display_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Test Type</Label>
          <Select value={testType} onValueChange={setTestType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="subject_line">Subject Line</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="send_time">Send Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Min Sample Size</Label>
          <Input type="number" value={minSampleSize} onChange={(e) => setMinSampleSize(parseInt(e.target.value))} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Variants</h3>
          <Button onClick={addVariant} size="sm"><Plus className="w-4 h-4 mr-1" />Add Variant</Button>
        </div>

        {variants.map((variant, idx) => (
          <Card key={variant.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">{variant.name}</CardTitle>
                {!variant.isControl && variants.length > 2 && (
                  <Button variant="ghost" size="sm" onClick={() => removeVariant(variant.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Traffic %</Label>
                <Input type="number" value={variant.trafficPercentage} 
                  onChange={(e) => updateVariant(variant.id, 'trafficPercentage', parseInt(e.target.value))} />
              </div>
              <div>
                <Label>Subject Line</Label>
                <Input value={variant.subjectLine} 
                  onChange={(e) => updateVariant(variant.id, 'subjectLine', e.target.value)} />
              </div>
              {testType === 'content' && (
                <div>
                  <Label>Content</Label>
                  <Textarea value={variant.templateContent} rows={3}
                    onChange={(e) => updateVariant(variant.id, 'templateContent', e.target.value)} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave}>Create Test</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
