import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Users, TrendingUp, MousePointer } from 'lucide-react';

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: any;
}

export default function SegmentBuilder() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fields = [
    { value: 'avg_open_rate', label: 'Average Open Rate' },
    { value: 'avg_click_rate', label: 'Average Click Rate' },
    { value: 'total_emails_received', label: 'Total Emails Received' },
    { value: 'days_since_last_open', label: 'Days Since Last Open' }
  ];

  const operators = [
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'equals', label: 'Equals' }
  ];

  const addRule = () => {
    setRules([...rules, { id: Date.now().toString(), field: 'avg_open_rate', operator: 'greater_than', value: 0 }]);
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const updateRule = (id: string, key: string, value: any) => {
    setRules(rules.map(r => r.id === id ? { ...r, [key]: value } : r));
  };

  useEffect(() => {
    if (rules.length > 0) {
      evaluateRules();
    }
  }, [rules]);

  const evaluateRules = async () => {
    try {
      const { data } = await supabase.functions.invoke('segment-analyzer', {
        body: { action: 'evaluate_rules', rules }
      });
      setPreview(data);
    } catch (error) {
      console.error('Error evaluating rules:', error);
    }
  };

  const saveSegment = async () => {
    setLoading(true);
    try {
      const { data: segment } = await supabase.from('segments').insert({
        name,
        description,
        segment_type: 'rule_based',
        rules,
        estimated_reach: preview?.estimated_reach || 0,
        predicted_open_rate: preview?.predicted_open_rate,
        predicted_click_rate: preview?.predicted_click_rate,
        predicted_engagement_score: preview?.predicted_engagement_score
      }).select().single();

      if (segment && preview?.matching_users) {
        const members = preview.matching_users.map((uid: string) => ({
          segment_id: segment.id,
          user_id: uid,
          user_type: 'parent',
          confidence_score: 100
        }));
        await supabase.from('segment_members').insert(members);
      }

      alert('Segment created successfully!');
      setName('');
      setDescription('');
      setRules([]);
      setPreview(null);
    } catch (error) {
      console.error('Error saving segment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Build Segment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Segment Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Rules</h4>
              <Button onClick={addRule} size="sm"><Plus className="w-4 h-4 mr-1" />Add Rule</Button>
            </div>
            
            {rules.map((rule) => (
              <div key={rule.id} className="flex gap-2 items-center p-3 border rounded">
                <Select value={rule.field} onValueChange={(v) => updateRule(rule.id, 'field', v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>{fields.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
                
                <Select value={rule.operator} onValueChange={(v) => updateRule(rule.id, 'operator', v)}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>{operators.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                
                <Input type="number" value={rule.value} onChange={(e) => updateRule(rule.id, 'value', parseFloat(e.target.value))} className="w-24" />
                
                <Button variant="ghost" size="sm" onClick={() => removeRule(rule.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>

          <Button onClick={saveSegment} disabled={!name || rules.length === 0 || loading} className="w-full">
            Save Segment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {preview ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{preview.estimated_reach}</p>
                  <p className="text-sm text-gray-500">Estimated Reach</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-semibold">{preview.predicted_open_rate}%</p>
                  <p className="text-xs text-gray-500">Predicted Open Rate</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{preview.predicted_click_rate}%</p>
                  <p className="text-xs text-gray-500">Predicted Click Rate</p>
                </div>
              </div>
              
              <div>
                <p className="text-lg font-semibold">{preview.predicted_engagement_score}</p>
                <p className="text-xs text-gray-500">Engagement Score</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Add rules to see preview</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
