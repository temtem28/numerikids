import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, AlertCircle, Play, Pause, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ABTest {
  id: string;
  name: string;
  status: string;
  template_name: string;
  start_date: string;
  min_sample_size: number;
  winner_variant_id: string | null;
  variants: any[];
}

export function ABTestDashboard({ onCreateNew }: { onCreateNew: () => void }) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    const { data: testsData } = await supabase
      .from('ab_tests')
      .select('*, variants:ab_test_variants(*)')
      .order('created_at', { ascending: false });

    if (testsData) {
      setTests(testsData.map(t => ({ ...t, variants: t.variants || [] })));
    }
    setLoading(false);
  };

  const startTest = async (testId: string) => {
    await supabase
      .from('ab_tests')
      .update({ status: 'active', start_date: new Date().toISOString() })
      .eq('id', testId);
    loadTests();
  };

  const pauseTest = async (testId: string) => {
    await supabase.from('ab_tests').update({ status: 'paused' }).eq('id', testId);
    loadTests();
  };

  const declareWinner = async (testId: string, variantId: string) => {
    await supabase
      .from('ab_tests')
      .update({ status: 'completed', winner_variant_id: variantId, end_date: new Date().toISOString() })
      .eq('id', testId);
    loadTests();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { label: 'Draft', variant: 'secondary' },
      active: { label: 'Active', variant: 'default' },
      paused: { label: 'Paused', variant: 'outline' },
      completed: { label: 'Completed', variant: 'success' }
    };
    const s = variants[status] || variants.draft;
    return <Badge variant={s.variant as any}>{s.label}</Badge>;
  };

  const calculateSignificance = (control: any, variant: any) => {
    if (!control || !variant || control.sent_count < 30 || variant.sent_count < 30) return null;
    
    const p1 = control.opened_count / control.sent_count;
    const p2 = variant.opened_count / variant.sent_count;
    const improvement = ((p2 - p1) / p1) * 100;
    
    return { improvement: improvement.toFixed(1), isSignificant: Math.abs(improvement) > 10 };
  };

  if (loading) return <div>Loading tests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">A/B Tests</h2>
        <Button onClick={onCreateNew}>Create New Test</Button>
      </div>

      <div className="grid gap-4">
        {tests.map(test => {
          const control = test.variants.find(v => v.is_control);
          const bestVariant = test.variants.reduce((best, v) => 
            !best || (v.open_rate || 0) > (best.open_rate || 0) ? v : best, null as any);
          const significance = control && bestVariant && !bestVariant.is_control 
            ? calculateSignificance(control, bestVariant) : null;

          return (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {test.name}
                      {getStatusBadge(test.status)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Template: {test.template_name}</p>
                  </div>
                  <div className="flex gap-2">
                    {test.status === 'draft' && (
                      <Button size="sm" onClick={() => startTest(test.id)}>
                        <Play className="w-4 h-4 mr-1" />Start
                      </Button>
                    )}
                    {test.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => pauseTest(test.id)}>
                        <Pause className="w-4 h-4 mr-1" />Pause
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {test.variants.map(variant => {
                    const openRate = variant.sent_count > 0 ? (variant.opened_count / variant.sent_count * 100).toFixed(1) : '0.0';
                    const clickRate = variant.sent_count > 0 ? (variant.clicked_count / variant.sent_count * 100).toFixed(1) : '0.0';
                    const isWinner = test.winner_variant_id === variant.id;

                    return (
                      <div key={variant.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {variant.name}
                              {variant.is_control && <Badge variant="outline">Control</Badge>}
                              {isWinner && <Trophy className="w-4 h-4 text-yellow-500" />}
                            </h4>
                            <p className="text-sm text-muted-foreground">{variant.subject_line}</p>
                          </div>
                          {test.status === 'active' && !test.winner_variant_id && variant.sent_count >= test.min_sample_size && (
                            <Button size="sm" onClick={() => declareWinner(test.id, variant.id)}>
                              <CheckCircle className="w-4 h-4 mr-1" />Declare Winner
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sent</p>
                            <p className="font-semibold">{variant.sent_count}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Open Rate</p>
                            <p className="font-semibold">{openRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Click Rate</p>
                            <p className="font-semibold">{clickRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Traffic</p>
                            <p className="font-semibold">{variant.traffic_percentage}%</p>
                          </div>
                        </div>

                        <Progress value={(variant.sent_count / test.min_sample_size) * 100} className="mt-3" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {variant.sent_count} / {test.min_sample_size} minimum samples
                        </p>
                      </div>
                    );
                  })}

                  {significance && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${significance.isSignificant ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {significance.isSignificant ? <TrendingUp className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span className="text-sm font-medium">
                        {significance.isSignificant 
                          ? `Statistically significant: ${significance.improvement}% improvement`
                          : `Not yet significant: ${significance.improvement}% difference`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
