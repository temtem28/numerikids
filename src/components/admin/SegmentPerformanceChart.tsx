import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';

export default function SegmentPerformanceChart({ segmentId }: { segmentId: string }) {
  const [data, setData] = useState<any[]>([]);
  const [segment, setSegment] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [segmentId]);

  const loadData = async () => {
    const { data: segmentData } = await supabase
      .from('segments')
      .select('*')
      .eq('id', segmentId)
      .single();
    setSegment(segmentData);

    const { data: perfData } = await supabase
      .from('segment_performance')
      .select('*')
      .eq('segment_id', segmentId)
      .order('date', { ascending: true })
      .limit(30);

    setData(perfData || []);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{segment?.name} Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avg_open_rate" stroke="#3b82f6" name="Open Rate %" />
            <Line type="monotone" dataKey="avg_click_rate" stroke="#f97316" name="Click Rate %" />
            <Line type="monotone" dataKey="avg_engagement_score" stroke="#10b981" name="Engagement Score" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
