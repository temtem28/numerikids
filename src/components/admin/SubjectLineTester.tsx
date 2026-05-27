import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestTube, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SubjectLineTester() {
  const [subjectText, setSubjectText] = useState('');
  const [testing, setTesting] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const { toast } = useToast();

  const testSubjectLine = async () => {
    if (!subjectText.trim()) return;
    
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('subject-line-ai', {
        body: { 
          action: 'predict', 
          subjectText,
          segmentData: { avg_open_rate: 25 }
        }
      });

      if (error) throw error;
      setPrediction(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Enter subject line to test..."
              value={subjectText}
              onChange={(e) => setSubjectText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && testSubjectLine()}
            />
          </div>
          <Button onClick={testSubjectLine} disabled={testing || !subjectText.trim()} className="w-full">
            <TestTube className="w-4 h-4 mr-2" />
            {testing ? 'Analyzing...' : 'Test Subject Line'}
          </Button>
        </div>
      </Card>

      {prediction && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Predicted Open Rate</p>
                <p className="text-3xl font-bold text-blue-600">{prediction.predicted_open_rate}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(prediction.score)}`}>{prediction.score}/100</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-3xl font-bold">{prediction.confidence}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Spam Risk</p>
                <Progress value={prediction.spam_score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{prediction.spam_score}% spam score</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {prediction.strengths?.map((s: string, i: number) => (
                    <Badge key={i} variant="outline" className="bg-green-50">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {prediction.weaknesses?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Areas to Improve</p>
                  <div className="flex flex-wrap gap-2">
                    {prediction.weaknesses.map((w: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-red-50">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {w}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-2">Suggestions</p>
                <ul className="text-sm space-y-1">
                  {prediction.suggestions?.map((s: string, i: number) => (
                    <li key={i} className="text-muted-foreground">• {s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
