import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Play, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TestResult {
  name: string;
  type: string;
  passed: boolean;
  message?: string;
  error?: string;
}

interface TestResults {
  totalTests: number;
  passed: number;
  failed: number;
  tests: TestResult[];
}

export function RLSTestRunner() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResults | null>(null);
  const [selectedSuite, setSelectedSuite] = useState<string>('all');

  const runTests = async (testSuite: string) => {
    setLoading(true);
    setSelectedSuite(testSuite);
    
    try {
      const { data, error } = await supabase.functions.invoke('rls-test-runner', {
        body: { action: 'runTests', testSuite }
      });

      if (error) throw error;

      setResults(data);
      
      if (data.failed === 0) {
        toast.success(`All ${data.totalTests} tests passed!`);
      } else {
        toast.error(`${data.failed} of ${data.totalTests} tests failed`);
      }
    } catch (error) {
      console.error('Test execution error:', error);
      toast.error('Failed to run tests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <CardTitle>RLS Policy Test Suite</CardTitle>
          </div>
          <CardDescription>
            Automated testing for Row Level Security policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="parent">Parent Access</TabsTrigger>
              <TabsTrigger value="child">Child Access</TabsTrigger>
              <TabsTrigger value="crossHousehold">Cross-Household</TabsTrigger>
              <TabsTrigger value="edgeCases">Edge Cases</TabsTrigger>
            </TabsList>

            {['all', 'parent', 'child', 'crossHousehold', 'edgeCases'].map((suite) => (
              <TabsContent key={suite} value={suite} className="space-y-4">
                <Button
                  onClick={() => runTests(suite)}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && selectedSuite === suite ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run {suite === 'all' ? 'All' : suite.charAt(0).toUpperCase() + suite.slice(1)} Tests
                    </>
                  )}
                </Button>
              </TabsContent>
            ))}
          </Tabs>

          {results && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{results.totalTests}</div>
                      <div className="text-sm text-muted-foreground">Total Tests</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{results.passed}</div>
                      <div className="text-sm text-muted-foreground">Passed</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{results.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                {results.tests.map((test, index) => (
                  <Alert key={index} variant={test.passed ? 'default' : 'destructive'}>
                    <div className="flex items-start gap-3">
                      {test.passed ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{test.name}</span>
                          <Badge variant="outline">{test.type}</Badge>
                        </div>
                        <AlertDescription>
                          {test.message || test.error || 'Test completed'}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These tests verify that RLS policies properly restrict data access. 
              All tests should pass to ensure security compliance.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}