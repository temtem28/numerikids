import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import EmailTemplateEditor from './EmailTemplateEditor';
import EmailTemplatePreview from './EmailTemplatePreview';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template_type: string;
  html_content: string;
  text_content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EmailTemplateManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (template: EmailTemplate) => {
    try {
      if (template.id) {
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: template.name,
            subject: template.subject,
            template_type: template.template_type,
            html_content: template.html_content,
            text_content: template.text_content,
            variables: template.variables,
            is_active: template.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', template.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Template updated successfully' });
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert([template]);

        if (error) throw error;
        toast({ title: 'Success', description: 'Template created successfully' });
      }

      setShowEditor(false);
      setEditingTemplate(null);
      loadTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Template deleted successfully' });
      loadTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Email Templates</h2>
          <p className="text-muted-foreground">Manage email templates with dynamic content</p>
        </div>
        <Button onClick={() => { setEditingTemplate(null); setShowEditor(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {loading ? (
        <p>Loading templates...</p>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {template.name}
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{template.template_type}</Badge>
                    </CardTitle>
                    <CardDescription>{template.subject}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setPreviewTemplate(template); setShowPreview(true); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingTemplate(template); setShowEditor(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
          </DialogHeader>
          <EmailTemplateEditor
            template={editingTemplate}
            onSave={handleSave}
            onCancel={() => { setShowEditor(false); setEditingTemplate(null); }}
            onPreview={(template) => { setPreviewTemplate(template); setShowPreview(true); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
          </DialogHeader>
          {previewTemplate && <EmailTemplatePreview template={previewTemplate} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
