import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Users, TrendingUp, MousePointer, Sparkles, RefreshCw } from 'lucide-react';

export default function SegmentList({ onSelectSegment }: { onSelectSegment: (id: string) => void }) {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    const { data } = await supabase
      .from('segments')
      .select('*, segment_members(count)')
      .order('created_at', { ascending: false });
    setSegments(data || []);
  };

  const createMLSegments = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('segment-analyzer', {
        body: { action: 'create_ml_segments' }
      });
      await loadSegments();
    } catch (error) {
      console.error('Error creating ML segments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ml_cluster': return 'bg-purple-500';
      case 'rule_based': return 'bg-blue-500';
      case 'manual': return 'bg-gray-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Segments</h3>
        <Button onClick={createMLSegments} disabled={loading}>
          <Sparkles className="w-4 h-4 mr-2" />
          Auto-Create ML Segments
        </Button>
      </div>

      <div className="grid gap-4">
        {segments.map((segment) => (
          <Card key={segment.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectSegment(segment.id)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold">{segment.name}</h4>
                  <p className="text-sm text-gray-500">{segment.description}</p>
                </div>
                <Badge className={getTypeColor(segment.segment_type)}>
                  {segment.segment_type.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{segment.estimated_reach}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>{segment.predicted_open_rate}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointer className="w-4 h-4 text-orange-500" />
                  <span>{segment.predicted_click_rate}%</span>
                </div>
                <div>
                  <span className="font-medium">{segment.predicted_engagement_score}</span>
                  <span className="text-gray-500 ml-1">score</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
