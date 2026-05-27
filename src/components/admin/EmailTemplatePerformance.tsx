import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TemplateStats {
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

export function EmailTemplatePerformance() {
  const [templates, setTemplates] = useState<TemplateStats[]>([]);

  useEffect(() => {
    loadTemplateStats();
  }, []);

  const loadTemplateStats = async () => {
    const { data } = await supabase
      .from('email_queue')
      .select('template_name, opened_at, clicked_at')
      .eq('status', 'sent');

    if (data) {
      const stats = data.reduce((acc: any, email) => {
        const name = email.template_name || 'Unknown';
        if (!acc[name]) {
          acc[name] = { name, sent: 0, opened: 0, clicked: 0 };
        }
        acc[name].sent++;
        if (email.opened_at) acc[name].opened++;
        if (email.clicked_at) acc[name].clicked++;
        return acc;
      }, {});

      const formatted = Object.values(stats).map((t: any) => ({
        ...t,
        openRate: (t.opened / t.sent) * 100,
        clickRate: (t.clicked / t.sent) * 100
      })).sort((a: any, b: any) => b.openRate - a.openRate);

      setTemplates(formatted);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {templates.map((template, idx) => (
            <div key={template.name} className="flex items-center justify-between border-b pb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{template.name}</span>
                  {idx === 0 && <Badge variant="default">Top Performer</Badge>}
                  {idx === templates.length - 1 && templates.length > 1 && (
                    <Badge variant="destructive">Needs Improvement</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {template.sent} sent · {template.opened} opened · {template.clicked} clicked
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {template.openRate > 30 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-bold">{template.openRate.toFixed(1)}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {template.clickRate.toFixed(1)}% CTR
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
