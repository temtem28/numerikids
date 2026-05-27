import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Save, Eye } from 'lucide-react';

interface ContentBlock {
  id?: string;
  name: string;
  description: string;
  block_type: string;
  category: string;
  default_content: any;
  personalization_enabled: boolean;
}

export default function ContentBlockEditor({ onSave }: { onSave: (block: ContentBlock) => void }) {
  const [block, setBlock] = useState<ContentBlock>({
    name: '',
    description: '',
    block_type: 'text',
    category: 'body',
    default_content: { text: '', html: '' },
    personalization_enabled: true
  });

  const [preview, setPreview] = useState(false);

  const handleSave = () => {
    onSave(block);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Content Block
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Block Name</Label>
          <Input
            value={block.name}
            onChange={(e) => setBlock({ ...block, name: e.target.value })}
            placeholder="e.g., Welcome Header"
          />
        </div>

        <div>
          <Label>Description</Label>
          <Input
            value={block.description}
            onChange={(e) => setBlock({ ...block, description: e.target.value })}
            placeholder="Brief description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Block Type</Label>
            <Select value={block.block_type} onValueChange={(v) => setBlock({ ...block, block_type: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="recommendation">Recommendation</SelectItem>
                <SelectItem value="cta">Call to Action</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category</Label>
            <Select value={block.category} onValueChange={(v) => setBlock({ ...block, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="body">Body</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="lesson">Lesson</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Default Content</Label>
          <Textarea
            value={JSON.stringify(block.default_content, null, 2)}
            onChange={(e) => {
              try {
                setBlock({ ...block, default_content: JSON.parse(e.target.value) });
              } catch {}
            }}
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={block.personalization_enabled}
            onCheckedChange={(checked) => setBlock({ ...block, personalization_enabled: checked })}
          />
          <Label>Enable Personalization</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Block
          </Button>
          <Button variant="outline" onClick={() => setPreview(!preview)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>

        {preview && (
          <Card className="bg-muted">
            <CardContent className="p-4">
              <div dangerouslySetInnerHTML={{ __html: block.default_content.html || block.default_content.text }} />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}