import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export const EmailTimeAnalysis: React.FC = () => {
  const [segments, setSegments] = useState<any[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [performance, setPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadSegments();
  }, []);

  useEffect(() => {
    if (selectedSegment) {
      loadPerformance();
    }
  }, [selectedSegment]);

  const loadSegments = async () => {
    const { data } = await supabase.from('segments').select('id, name').limit(20);
    setSegments(data || []);
  };

  const loadPerformance = async () => {
    const { data } = await supabase
      .from('send_time_performance')
      .select('*')
      .eq('segment_id', selectedSegment)
      .order('engagement_score', { ascending: false })
      .limit(20);
    
    const formatted = data?.map(d => ({
      time: `${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.day_of_week]} ${d.hour_of_day}:00`,
      openRate: d.open_rate,
      clickRate: d.click_rate,
      score: d.engagement_score
    })) || [];
    
    setPerformance(formatted);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Segment Send Time Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedSegment} onValueChange={setSelectedSegment}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {performance.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="openRate" fill="#3b82f6" name="Open Rate %" />
                <Bar dataKey="clickRate" fill="#10b981" name="Click Rate %" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};