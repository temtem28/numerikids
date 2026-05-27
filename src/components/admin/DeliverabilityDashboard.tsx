import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function DeliverabilityDashboard() {
  const [metrics, setMetrics] = useState({
    deliveryRate: 98.5,
    bounceRate: 1.2,
    spamRate: 0.08,
    engagementRate: 45.3,
    reputationScore: 87
  });

  const [alerts, setAlerts] = useState([
    { id: 1, severity: 'warning', title: 'Bounce rate increasing', description: 'Hard bounces up 0.3% this week' },
    { id: 2, severity: 'info', title: 'Good engagement', description: 'Open rates above average' }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.deliveryRate}%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +0.5% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bounceRate}%</div>
            <div className="flex items-center text-xs text-red-600 mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +0.3% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Spam Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.spamRate}%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingDown className="w-3 h-3 mr-1" />
              -0.02% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getReputationColor(metrics.reputationScore)}`}>
              {metrics.reputationScore}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">Excellent</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map(alert => (
            <Alert key={alert.id}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{alert.title}</div>
                    <div className="text-sm">{alert.description}</div>
                  </div>
                  <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}