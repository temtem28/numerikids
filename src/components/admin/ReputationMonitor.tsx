import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function ReputationMonitor() {
  const reputation = {
    score: 87,
    domain: 'excellent',
    ip: 'good',
    auth: { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
    volumeConsistency: 92,
    engagementQuality: 85
  };

  const recommendations = [
    'Maintain consistent sending volume to improve IP reputation',
    'Continue monitoring bounce rates to stay below 2%',
    'Implement list hygiene practices to remove inactive subscribers',
    'Consider warming up new IP addresses gradually'
  ];

  const getAuthIcon = (status: string) => {
    return status === 'pass' ? <CheckCircle className="w-4 h-4 text-green-600" /> : 
           <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 mb-2">{reputation.score}</div>
            <Progress value={reputation.score} className="h-2" />
            <div className="text-xs text-muted-foreground mt-2">Excellent reputation</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Domain Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-lg px-4 py-2">{reputation.domain}</Badge>
            <div className="text-xs text-muted-foreground mt-3">Based on sending history</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">IP Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-lg px-4 py-2">{reputation.ip}</Badge>
            <div className="text-xs text-muted-foreground mt-3">Shared IP pool</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">SPF</span>
              {getAuthIcon(reputation.auth.spf)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">DKIM</span>
              {getAuthIcon(reputation.auth.dkim)}
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">DMARC</span>
              {getAuthIcon(reputation.auth.dmarc)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Volume Consistency</span>
              <span className="text-sm font-medium">{reputation.volumeConsistency}%</span>
            </div>
            <Progress value={reputation.volumeConsistency} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Engagement Quality</span>
              <span className="text-sm font-medium">{reputation.engagementQuality}%</span>
            </div>
            <Progress value={reputation.engagementQuality} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                <span className="text-sm">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}