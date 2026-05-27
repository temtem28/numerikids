import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, TrendingUp, DollarSign, Users, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DunningDashboard() {
  const [atRisk, setAtRisk] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [riskRes, metricsRes] = await Promise.all([
        supabase.functions.invoke('dunning-manager', {
          body: { action: 'get_at_risk' }
        }),
        supabase.functions.invoke('dunning-manager', {
          body: { action: 'get_metrics' }
        })
      ]);

      setAtRisk(riskRes.data?.atRisk || []);
      setMetrics(metricsRes.data?.metrics || []);
    } catch (error) {
      console.error('Error loading dunning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAtRisk = atRisk.length;
  const totalAmount = atRisk.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const avgRecoveryRate = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + (m.recovery_rate || 0), 0) / metrics.length 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'recovering': return 'bg-orange-500';
      case 'recovered': return 'bg-green-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Subscriptions</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAtRisk}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Amount at Risk</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRecoveryRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Retries</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {atRisk.filter(p => p.status === 'recovering').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="at-risk">
        <TabsList>
          <TabsTrigger value="at-risk">At-Risk Payments</TabsTrigger>
          <TabsTrigger value="metrics">Recovery Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Payments Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRisk.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                        <span className="font-medium">${payment.amount}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Retry {payment.retry_count}/{payment.max_retries}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Grace period ends: {new Date(payment.grace_period_ends_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
                {atRisk.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No at-risk payments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>30-Day Recovery Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.slice(0, 10).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">{new Date(metric.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span>Failed: {metric.total_failed_payments}</span>
                      <span className="text-green-600">Recovered: {metric.recovered_payments}</span>
                      <span className="font-medium">{metric.recovery_rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}