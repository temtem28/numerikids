import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Mail, TrendingUp, MousePointer, AlertCircle } from 'lucide-react';
import { EmailPerformanceChart } from './EmailPerformanceChart';
import { EmailTimeAnalysis } from './EmailTimeAnalysis';
import { EmailTemplatePerformance } from './EmailTemplatePerformance';
import { EmailAnalyticsFilters } from './EmailAnalyticsFilters';

interface AnalyticsData {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export function EmailAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    totalBounced: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0
  });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange, selectedTemplate]);

  const loadAnalytics = async () => {
    setLoading(true);
    let query = supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'sent');

    if (dateRange.from) query = query.gte('sent_at', dateRange.from);
    if (dateRange.to) query = query.lte('sent_at', dateRange.to);
    if (selectedTemplate) query = query.eq('template_name', selectedTemplate);

    const { data } = await query;

    if (data) {
      const totalSent = data.length;
      const totalOpened = data.filter(e => e.opened_at).length;
      const totalClicked = data.filter(e => e.clicked_at).length;
      const totalBounced = data.filter(e => e.bounced_at).length;

      setAnalytics({
        totalSent,
        totalOpened,
        totalClicked,
        totalBounced,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
      });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <EmailAnalyticsFilters
        onDateRangeChange={setDateRange}
        onTemplateChange={setSelectedTemplate}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{analytics.totalOpened} of {analytics.totalSent}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{analytics.totalClicked} clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{analytics.totalBounced} bounced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((analytics.openRate + analytics.clickRate) / 2).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Combined score</p>
          </CardContent>
        </Card>
      </div>

      <EmailPerformanceChart dateRange={dateRange} template={selectedTemplate} />
      <div className="grid gap-6 md:grid-cols-2">
        <EmailTimeAnalysis dateRange={dateRange} />
        <EmailTemplatePerformance />
      </div>
    </div>
  );
}
