import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Beaker } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Variable {
  name: string;
  type: string;
  values: { label: string; data: any }[];
}

export function MultiVariateTestCreator() {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addVariable = () => {
    setVariables([...variables, { name: '', type: 'subject_line', values: [] }]);
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const updateVariable = (index: number, field: keyof Variable, value: any) => {
    const updated = [...variables];
    updated[index] = { ...updated[index], [field]: value };
    setVariables(updated);
  };

  const addValue = (varIndex: number) => {
    const updated = [...variables];
    updated[varIndex].values.push({ label: '', data: {} });
    setVariables(updated);
  };

  const removeValue = (varIndex: number, valIndex: number) => {
    const updated = [...variables];
    updated[varIndex].values = updated[varIndex].values.filter((_, i) => i !== valIndex);
    setVariables(updated);
  };

  const updateValue = (varIndex: number, valIndex: number, field: 'label' | 'data', value: any) => {
    const updated = [...variables];
    updated[varIndex].values[valIndex][field] = value;
    setVariables(updated);
  };

  const createTest = async () => {
    if (!testName || variables.length === 0) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { data: test, error: testError } = await supabase
        .from('ab_tests')
        .insert({
          name: testName,
          description,
          test_type: 'multivariate',
          status: 'active',
          variables: variables.map(v => ({ name: v.name, type: v.type }))
        })
        .select()
        .single();

      if (testError) throw testError;

      for (const variable of variables) {
        const { data: varData, error: varError } = await supabase
          .from('ab_test_variables')
          .insert({
            ab_test_id: test.id,
            variable_name: variable.name,
            variable_type: variable.type
          })
          .select()
          .single();

        if (varError) throw varError;

        for (const value of variable.values) {
          await supabase.from('ab_test_variable_values').insert({
            variable_id: varData.id,
            value_label: value.label,
            value_data: value.data
          });
        }
      }

      toast({ title: 'Success', description: 'Multi-variate test created successfully' });
      setTestName('');
      setDescription('');
      setVariables([]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Beaker className="w-5 h-5" />
        <h2 className="text-xl font-bold">Create Multi-Variate Test</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Test Name</Label>
          <Input value={testName} onChange={(e) => setTestName(e.target.value)} />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Variables</Label>
            <Button onClick={addVariable} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add Variable
            </Button>
          </div>

          {variables.map((variable, varIndex) => (
            <Card key={varIndex} className="p-4 mb-3">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <Label>Variable Name</Label>
                    <Input
                      value={variable.name}
                      onChange={(e) => updateVariable(varIndex, 'name', e.target.value)}
                      placeholder="e.g., Subject Line"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select value={variable.type} onValueChange={(v) => updateVariable(varIndex, 'type', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subject_line">Subject Line</SelectItem>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="send_time">Send Time</SelectItem>
                        <SelectItem value="cta_text">CTA Text</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={() => removeVariable(varIndex)} size="sm" variant="ghost">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="ml-4">
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm">Values</Label>
                  <Button onClick={() => addValue(varIndex)} size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-1" /> Add Value
                  </Button>
                </div>
                {variable.values.map((value, valIndex) => (
                  <div key={valIndex} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Label"
                      value={value.label}
                      onChange={(e) => updateValue(varIndex, valIndex, 'label', e.target.value)}
                    />
                    <Input
                      placeholder="Value (JSON)"
                      value={JSON.stringify(value.data)}
                      onChange={(e) => {
                        try {
                          updateValue(varIndex, valIndex, 'data', JSON.parse(e.target.value));
                        } catch {}
                      }}
                    />
                    <Button onClick={() => removeValue(varIndex, valIndex)} size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={createTest} disabled={loading} className="w-full">
          {loading ? 'Creating...' : 'Create Multi-Variate Test'}
        </Button>
      </div>
    </Card>
  );
}