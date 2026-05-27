import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

interface EmailPerformanceChartProps {
  dateRange: { from: string; to: string };
  template: string;
}

export function EmailPerformanceChart({ dateRange, template }: EmailPerformanceChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadChartData();
  }, [dateRange, template]);

  const loadChartData = async () => {
    let query = supabase
      .from('email_queue')
      .select('sent_at, opened_at, clicked_at, status')
      .eq('status', 'sent')
      .order('sent_at');

    if (dateRange.from) query = query.gte('sent_at', dateRange.from);
    if (dateRange.to) query = query.lte('sent_at', dateRange.to);
    if (template) query = query.eq('template_name', template);

    const { data } = await query;

    if (data) {
      const grouped = data.reduce((acc: any, email) => {
        const date = new Date(email.sent_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, sent: 0, opened: 0, clicked: 0 };
        }
        acc[date].sent++;
        if (email.opened_at) acc[date].opened++;
        if (email.clicked_at) acc[date].clicked++;
        return acc;
      }, {});

      const formatted = Object.values(grouped).map((day: any) => ({
        ...day,
        openRate: ((day.opened / day.sent) * 100).toFixed(1),
        clickRate: ((day.clicked / day.sent) * 100).toFixed(1)
      }));

      setChartData(formatted);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="sent" stroke="#8884d8" name="Sent" />
            <Line type="monotone" dataKey="opened" stroke="#82ca9d" name="Opened" />
            <Line type="monotone" dataKey="clicked" stroke="#ffc658" name="Clicked" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
