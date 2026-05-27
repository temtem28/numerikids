import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StrugglingArea {
  area: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
  recommendation: string;
}

interface StrugglingAreasPanelProps {
  strugglingAreas: StrugglingArea[];
}

export default function StrugglingAreasPanel({ strugglingAreas }: StrugglingAreasPanelProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    return severity === 'high' ? 
      <AlertTriangle className="w-5 h-5 text-red-500" /> : 
      <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  };

  if (strugglingAreas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription>
              Great news! No significant struggling areas detected. Keep up the excellent work!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {strugglingAreas.map((area, idx) => (
        <Card key={idx} className="border-l-4" style={{
          borderLeftColor: area.severity === 'high' ? '#ef4444' : 
                          area.severity === 'medium' ? '#f59e0b' : '#94a3b8'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getSeverityIcon(area.severity)}
                {area.area}
              </div>
              <Badge variant={getSeverityColor(area.severity) as any}>
                {area.severity.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Evidence:</h4>
              <p className="text-sm text-muted-foreground">{area.evidence}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Recommendation:
              </h4>
              <p className="text-sm">{area.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}