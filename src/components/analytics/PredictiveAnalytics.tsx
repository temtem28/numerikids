import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PredictiveAnalyticsProps {
  predictions: {
    nextWeekProgress: string;
    riskAreas: string[];
    opportunityAreas: string[];
  };
}

export default function PredictiveAnalytics({ predictions }: PredictiveAnalyticsProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Next Week Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{predictions.nextWeekProgress}</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Risk Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.riskAreas.length > 0 ? (
              <div className="space-y-2">
                {predictions.riskAreas.map((area, idx) => (
                  <Alert key={idx} variant="destructive">
                    <AlertDescription>{area}</AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No significant risks detected</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Sparkles className="w-5 h-5" />
              Opportunity Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.opportunityAreas.length > 0 ? (
              <div className="space-y-2">
                {predictions.opportunityAreas.map((area, idx) => (
                  <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-800">{area}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific opportunities identified</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Sparkles className="w-4 h-4" />
        <AlertTitle>AI Prediction Confidence</AlertTitle>
        <AlertDescription>
          These predictions are based on historical learning patterns and performance trends. 
          Actual outcomes may vary based on effort, consistency, and external factors.
        </AlertDescription>
      </Alert>
    </div>
  );
}