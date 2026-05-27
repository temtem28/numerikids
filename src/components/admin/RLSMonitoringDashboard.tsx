import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, CheckCircle, TrendingUp, TrendingDown, Play } from 'lucide-react';
import { toast } from 'sonner';

interface TestRun {
  id: string;
  run_date: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  status: string;
  duration_ms: number;
}

export default function RLSMonitoringDashboard() {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    loadTestHistory();
  }, []);

  const loadTestHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('rls_test_runs')
        .select('*')
        .order('run_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      setTestRuns(data || []);
    } catch (error) {
      console.error('Error loading test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('rls-test-runner', {
        body: { action: 'runAll' }
      });

      if (error) throw error;
      toast.success('RLS tests completed');
      await loadTestHistory();
    } catch (error) {
      toast.error('Failed to run tests');
    } finally {
      setRunning(false);
    }
  };

  const chartData = testRuns.slice().reverse().map(run => ({
    date: new Date(run.run_date).toLocaleDateString(),
    passed: run.passed_tests,
    failed: run.failed_tests,
    successRate: ((run.passed_tests / run.total_tests) * 100).toFixed(1)
  }));

  const latestRun = testRuns[0];
  const avgSuccessRate = testRuns.length > 0
    ? (testRuns.reduce((sum, run) => sum + (run.passed_tests / run.total_tests), 0) / testRuns.length * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">RLS Security Monitoring</h2>
        <Button onClick={runTests} disabled={running}>
          <Play className="w-4 h-4 mr-2" />
          {running ? 'Running...' : 'Run Tests Now'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Latest Status</CardTitle>
          </CardHeader>
          <CardContent>
            {latestRun?.status === 'success' ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-green-500">Passing</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold text-red-500">Failing</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Avg Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {Number(avgSuccessRate) >= 95 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <span className="text-2xl font-bold">{avgSuccessRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{latestRun?.total_tests || 0}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-sm">
              {latestRun ? new Date(latestRun.run_date).toLocaleString() : 'Never'}
            </span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="passed" stroke="#22c55e" name="Passed" />
              <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Test Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {testRuns.slice(0, 10).map(run => (
              <div key={run.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  {run.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {new Date(run.run_date).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {run.passed_tests} passed, {run.failed_tests} failed
                    </div>
                  </div>
                </div>
                <Badge variant={run.status === 'success' ? 'default' : 'destructive'}>
                  {run.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}