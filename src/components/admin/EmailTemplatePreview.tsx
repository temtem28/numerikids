import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EmailTemplate {
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
}

interface EmailTemplatePreviewProps {
  template: EmailTemplate;
}

export default function EmailTemplatePreview({ template }: EmailTemplatePreviewProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    template.variables.reduce((acc, variable) => {
      acc[variable] = `Sample ${variable}`;
      return acc;
    }, {} as Record<string, string>)
  );

  const replaceVariables = (content: string) => {
    let result = content;
    Object.entries(variableValues).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  };

  const previewSubject = replaceVariables(template.subject);
  const previewHtml = replaceVariables(template.html_content);
  const previewText = replaceVariables(template.text_content);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Variable Values</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {template.variables.map((variable) => (
              <div key={variable}>
                <Label htmlFor={variable}>{variable}</Label>
                <Input
                  id={variable}
                  value={variableValues[variable] || ''}
                  onChange={(e) => setVariableValues({ ...variableValues, [variable]: e.target.value })}
                  placeholder={`Enter ${variable}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <Label>Subject Line</Label>
        <div className="p-3 bg-muted rounded-md font-semibold">{previewSubject}</div>
      </div>

      <Tabs defaultValue="html">
        <TabsList>
          <TabsTrigger value="html">HTML Preview</TabsTrigger>
          <TabsTrigger value="text">Plain Text</TabsTrigger>
        </TabsList>
        <TabsContent value="html">
          <div className="border rounded-lg p-4 bg-white">
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[600px] border-0"
              title="Email Preview"
            />
          </div>
        </TabsContent>
        <TabsContent value="text">
          <div className="border rounded-lg p-4 bg-muted whitespace-pre-wrap font-mono text-sm">
            {previewText}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
