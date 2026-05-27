import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Play, TrendingUp, Clock, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function AutoOptimizationDashboard() {
  const [actions, setActions] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: actionsData } = await supabase
      .from('optimization_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: rulesData } = await supabase
      .from('auto_optimization_rules')
      .select('*');

    setActions(actionsData || []);
    setRules(rulesData || []);
  };

  const runOptimization = async (type: string) => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('auto-optimizer', {
        body: { action: type }
      });
      console.log('Optimization result:', data);
      await fetchData();
    } catch (error) {
      console.error('Optimization error:', error);
    }
    setLoading(false);
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_time_adjusted': return <Clock className="w-4 h-4" />;
      case 'subject_changed': return <Mail className="w-4 h-4" />;
      case 'content_selected': return <Mail className="w-4 h-4" />;
      case 'test_promoted': return <TrendingUp className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-500';
      case 'validated': return 'bg-green-500';
      case 'rolled_back': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Auto-Optimization Dashboard</h2>
        <div className="flex gap-2">
          <Button onClick={() => runOptimization('optimize_send_times')} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            Optimize Send Times
          </Button>
          <Button onClick={() => runOptimization('select_best_content')} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            Select Best Content
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{rule.rule_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                  {rule.enabled ? 'Active' : 'Disabled'}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  Min Confidence: {rule.min_confidence_score}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Min Sample: {rule.min_sample_size}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Optimization Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actions.map((action) => (
              <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getActionIcon(action.action_type)}
                  <div>
                    <div className="font-medium">{action.action_type.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-muted-foreground">
                      {action.predicted_improvement && `+${action.predicted_improvement.toFixed(1)}% predicted`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {action.confidence_score && (
                    <Badge variant="outline">{action.confidence_score}% confidence</Badge>
                  )}
                  <Badge className={getStatusColor(action.status)}>
                    {action.status}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {new Date(action.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
