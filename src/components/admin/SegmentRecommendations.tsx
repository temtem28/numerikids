import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Lightbulb, TrendingUp, CheckCircle, Sparkles } from 'lucide-react';

export default function SegmentRecommendations({ segmentId }: { segmentId: string }) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [segmentId]);

  const loadRecommendations = async () => {
    const { data } = await supabase
      .from('segment_recommendations')
      .select('*')
      .eq('segment_id', segmentId)
      .order('confidence_score', { ascending: false });
    setRecommendations(data || []);
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('segment-analyzer', {
        body: { action: 'generate_recommendations', segmentId }
      });
      await loadRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendation = async (id: string) => {
    await supabase
      .from('segment_recommendations')
      .update({ is_applied: true, applied_at: new Date().toISOString() })
      .eq('id', id);
    loadRecommendations();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'subject_line': return '📧';
      case 'content': return '📝';
      case 'send_time': return '⏰';
      case 'frequency': return '📅';
      case 'template': return '🎨';
      default: return '💡';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>AI Recommendations</CardTitle>
        <Button onClick={generateRecommendations} disabled={loading} size="sm">
          <Sparkles className="w-4 h-4 mr-2" />
          Generate New
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-center text-gray-400 py-4">No recommendations yet</p>
        ) : (
          recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{getTypeIcon(rec.recommendation_type)}</span>
                  <div>
                    <p className="font-medium">{rec.recommendation_text}</p>
                    <p className="text-sm text-gray-500 mt-1">{rec.reasoning}</p>
                  </div>
                </div>
                {rec.is_applied && <Badge variant="outline" className="bg-green-50"><CheckCircle className="w-3 h-3 mr-1" />Applied</Badge>}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">Confidence: <strong>{rec.confidence_score}%</strong></span>
                  <span className="text-green-600">Expected: <strong>+{rec.expected_improvement}%</strong></span>
                </div>
                {!rec.is_applied && (
                  <Button onClick={() => applyRecommendation(rec.id)} size="sm" variant="outline">
                    Apply
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
