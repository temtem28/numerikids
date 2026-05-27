import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Eye, Save, X } from 'lucide-react';

interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  template_type: string;
  html_content: string;
  text_content: string;
  variables: string[];
  is_active: boolean;
}

interface EmailTemplateEditorProps {
  template: EmailTemplate | null;
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
  onPreview: (template: EmailTemplate) => void;
}

export default function EmailTemplateEditor({ template, onSave, onCancel, onPreview }: EmailTemplateEditorProps) {
  const [formData, setFormData] = useState<EmailTemplate>(
    template || {
      name: '',
      subject: '',
      template_type: 'digest',
      html_content: '',
      text_content: '',
      variables: [],
      is_active: true,
    }
  );

  const [newVariable, setNewVariable] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const addVariable = () => {
    if (newVariable && !formData.variables.includes(newVariable)) {
      setFormData({ ...formData, variables: [...formData.variables, newVariable] });
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({ ...formData, variables: formData.variables.filter(v => v !== variable) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Template Type</Label>
          <Select value={formData.template_type} onValueChange={(value) => setFormData({ ...formData, template_type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="digest">Digest</SelectItem>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Use {{variableName}} for dynamic content"
          required
        />
      </div>

      <div>
        <Label>Variables</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            placeholder="Add variable name"
          />
          <Button type="button" onClick={addVariable}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.variables.map((variable) => (
            <Badge key={variable} variant="secondary">
              {variable}
              <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => removeVariable(variable)} />
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="html">HTML Content</Label>
        <Textarea
          id="html"
          value={formData.html_content}
          onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
          rows={12}
          className="font-mono text-sm"
          required
        />
      </div>

      <div>
        <Label htmlFor="text">Plain Text Content</Label>
        <Textarea
          id="text"
          value={formData.text_content}
          onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
          rows={8}
        />
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
          <Button type="button" variant="outline" onClick={() => onPreview(formData)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
