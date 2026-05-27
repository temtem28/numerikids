import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

interface EmailAnalyticsFiltersProps {
  onDateRangeChange: (range: { from: string; to: string }) => void;
  onTemplateChange: (template: string) => void;
}

export function EmailAnalyticsFilters({ onDateRangeChange, onTemplateChange }: EmailAnalyticsFiltersProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    onDateRangeChange({ from: fromDate, to: toDate });
  }, [fromDate, toDate]);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('email_templates')
      .select('name')
      .order('name');
    if (data) setTemplates(data);
  };

  const handlePresetRange = (preset: string) => {
    const now = new Date();
    let from = new Date();

    switch (preset) {
      case 'today':
        from = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        from = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        from = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'all':
        setFromDate('');
        setToDate('');
        return;
    }

    setFromDate(from.toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <Label htmlFor="preset">Quick Range</Label>
            <Select onValueChange={handlePresetRange}>
              <SelectTrigger id="preset">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="from">From Date</Label>
            <Input
              id="from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="to">To Date</Label>
            <Input
              id="to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="template">Template</Label>
            <Select onValueChange={onTemplateChange}>
              <SelectTrigger id="template">
                <SelectValue placeholder="All templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Templates</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.name} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
