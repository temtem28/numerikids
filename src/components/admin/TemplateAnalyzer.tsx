import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { AlertCircle, TrendingUp, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TemplateAnalyzer() {
  const [subjectLine, setSubjectLine] = useState('');
  const [content, setContent] = useState('');
  const [sendTime, setSendTime] = useState(new Date().toISOString().slice(0, 16));
  const [recipientEmail, setRecipientEmail] = useState('test@example.com');
  const [prediction, setPrediction] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeCampaign = async () => {
    setAnalyzing(true);
    try {
      const { data } = await supabase.functions.invoke('email-predictions', {
        body: {
          action: 'predict',
          subjectLine,
          content,
          sendTime: new Date(sendTime),
          recipientEmail
        }
      });

      setPrediction(data.prediction);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    setAnalyzing(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Campaign Analyzer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Subject Line</label>
            <Input
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              placeholder="Enter email subject line..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {subjectLine.length} characters
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Email Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter email content..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length} characters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Send Time</label>
              <Input
                type="datetime-local"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Recipient</label>
              <Input
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
          </div>

          <Button onClick={analyzeCampaign} disabled={analyzing || !subjectLine || !content}>
            <Sparkles className="h-4 w-4 mr-2" />
            {analyzing ? 'Analyzing...' : 'Analyze Campaign'}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Predicted Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {(prediction.predicted_open_rate * 100).toFixed(1)}%
                </div>
                <p className={`text-sm ${getConfidenceColor(prediction.confidence_score)}`}>
                  {(prediction.confidence_score * 100).toFixed(0)}% confidence
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Predicted Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {(prediction.predicted_click_rate * 100).toFixed(1)}%
                </div>
                <p className={`text-sm ${getConfidenceColor(prediction.confidence_score)}`}>
                  {(prediction.confidence_score * 100).toFixed(0)}% confidence
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {(prediction.predicted_engagement_score * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Overall quality</p>
              </CardContent>
            </Card>
          </div>

          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="mb-2">{rec.recommendation_type}</Badge>
                        <p className="text-sm font-medium mb-1">{rec.reasoning}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Current: {rec.current_value}</p>
                          <p className="text-green-600">Recommended: {rec.recommended_value}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-green-600">
                          +{(rec.expected_improvement * 100).toFixed(0)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(rec.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}