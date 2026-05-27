import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, RefreshCw } from 'lucide-react';
import { VariableImpactChart } from './VariableImpactChart';

interface MVTest {
  id: string;
  name: string;
  status: string;
  variables: any[];
}


export function MVTDashboard() {
  const [tests, setTests] = useState<MVTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [variableImpact, setVariableImpact] = useState<any[]>([]);
  const [combinations, setCombinations] = useState<any[]>([]);

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadTestData(selectedTest);
    }
  }, [selectedTest]);

  const loadTests = async () => {
    const { data } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('test_type', 'multivariate')
      .order('created_at', { ascending: false });
    
    if (data) setTests(data);
  };

  const loadTestData = async (testId: string) => {
    await supabase.rpc('calculate_variable_impact', { test_id: testId });

    const { data: impact } = await supabase
      .from('ab_variable_impact')
      .select(`
        *,
        variable:ab_test_variables(variable_name, variable_type),
        value:ab_test_variable_values(value_label)
      `)
      .eq('ab_test_id', testId);

    const { data: combs } = await supabase
      .from('ab_test_combinations')
      .select('*')
      .eq('ab_test_id', testId)
      .order('open_rate', { ascending: false })
      .limit(10);

    if (impact) setVariableImpact(impact);
    if (combs) setCombinations(combs);
  };

  const getImpactChartData = () => {
    const grouped = variableImpact.reduce((acc, item) => {
      if (item.metric_type === 'open_rate') {
        const key = `${item.variable.variable_name}: ${item.value.value_label}`;
        acc.push({
          name: key,
          impact: parseFloat(item.impact_score || 0),
          performance: parseFloat(item.avg_performance || 0)
        });
      }
      return acc;
    }, []);
    return grouped.sort((a, b) => b.impact - a.impact);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Multi-Variate Test Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tests.map(test => (
            <Card
              key={test.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedTest === test.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTest(test.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{test.name}</h3>
                <Badge variant={test.status === 'active' ? 'default' : 'secondary'}>
                  {test.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {test.variables?.length || 0} variables
              </p>
            </Card>
          ))}
        </div>
      </div>

      {selectedTest && variableImpact.length > 0 && (
        <>
          <VariableImpactChart data={variableImpact} metricType="open_rate" />
          <VariableImpactChart data={variableImpact} metricType="click_rate" />


          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Top Performing Combinations</h3>
            </div>
            <div className="space-y-3">
              {combinations.map((combo, idx) => (
                <div key={combo.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {idx === 0 && <Badge variant="default">Winner</Badge>}
                      <span className="font-medium">Combination #{idx + 1}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sent: {combo.sent_count} | Opened: {combo.opened_count} | Clicked: {combo.clicked_count}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{combo.open_rate}%</div>
                    <div className="text-sm text-muted-foreground">{combo.click_rate}% CTR</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}