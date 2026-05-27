import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Variant {
  id?: string;
  name: string;
  content: any;
  target_segments: string[];
  target_attributes: any;
  priority: number;
  active: boolean;
}

export default function ContentVariantManager({ blockId }: { blockId: string }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  useEffect(() => {
    loadVariants();
    loadSegments();
  }, [blockId]);

  const loadVariants = async () => {
    const { data } = await supabase
      .from('content_variants')
      .select('*')
      .eq('block_id', blockId);
    setVariants(data || []);
  };

  const loadSegments = async () => {
    const { data } = await supabase.from('segments').select('id, name');
    setSegments(data || []);
  };

  const saveVariant = async () => {
    if (!editingVariant) return;

    if (editingVariant.id) {
      await supabase
        .from('content_variants')
        .update(editingVariant)
        .eq('id', editingVariant.id);
    } else {
      await supabase.from('content_variants').insert({
        ...editingVariant,
        block_id: blockId
      });
    }

    loadVariants();
    setEditingVariant(null);
  };

  const deleteVariant = async (id: string) => {
    await supabase.from('content_variants').delete().eq('id', id);
    loadVariants();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Content Variants</h3>
        <Button onClick={() => setEditingVariant({
          name: '',
          content: {},
          target_segments: [],
          target_attributes: {},
          priority: 0,
          active: true
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Add Variant
        </Button>
      </div>

      <div className="grid gap-4">
        {variants.map((variant) => (
          <Card key={variant.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{variant.name}</h4>
                    <Badge variant={variant.active ? 'default' : 'secondary'}>
                      {variant.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">Priority: {variant.priority}</Badge>
                  </div>
                  {variant.target_segments.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      {variant.target_segments.length} segments targeted
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingVariant(variant)}>
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteVariant(variant.id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingVariant && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Edit Variant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Variant Name</Label>
              <Input
                value={editingVariant.name}
                onChange={(e) => setEditingVariant({ ...editingVariant, name: e.target.value })}
              />
            </div>

            <div>
              <Label>Content (JSON)</Label>
              <Textarea
                value={JSON.stringify(editingVariant.content, null, 2)}
                onChange={(e) => {
                  try {
                    setEditingVariant({ ...editingVariant, content: JSON.parse(e.target.value) });
                  } catch {}
                }}
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label>Priority</Label>
              <Input
                type="number"
                value={editingVariant.priority}
                onChange={(e) => setEditingVariant({ ...editingVariant, priority: parseInt(e.target.value) })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={editingVariant.active}
                onCheckedChange={(checked) => setEditingVariant({ ...editingVariant, active: checked })}
              />
              <Label>Active</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveVariant} className="flex-1">Save</Button>
              <Button variant="outline" onClick={() => setEditingVariant(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}