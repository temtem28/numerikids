import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Award, Clock, Zap } from 'lucide-react';

interface PerformanceOverviewProps {
  insights: any;
}

export default function PerformanceOverview({ insights }: PerformanceOverviewProps) {
  const { overallPerformance, strengths, learningPatterns, adaptiveDifficulty, motivationalInsights } = insights;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Overall Performance
            {getTrendIcon(overallPerformance.trend)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Performance Score</span>
              <span className="text-2xl font-bold">{overallPerformance.score}/100</span>
            </div>
            <Progress value={overallPerformance.score} className="h-3" />
          </div>
          <p className="text-sm text-muted-foreground">{overallPerformance.summary}</p>
          <Badge variant={overallPerformance.trend === 'improving' ? 'default' : 'secondary'}>
            {overallPerformance.trend.toUpperCase()}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Key Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {strengths.map((strength: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium">{strength}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Learning Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Best Time of Day</span>
            <Badge>{learningPatterns.bestTimeOfDay}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Avg Session Length</span>
            <span className="font-medium">{learningPatterns.averageSessionLength}</span>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Consistency Score</span>
              <span className="font-medium">{learningPatterns.consistencyScore}/100</span>
            </div>
            <Progress value={learningPatterns.consistencyScore} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Engagement Level</span>
            <div className={`w-3 h-3 rounded-full ${getEngagementColor(learningPatterns.engagementLevel)}`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Adaptive Difficulty
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Current Level</span>
            <Badge variant="outline">{adaptiveDifficulty.currentLevel}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Suggested Level</span>
            <Badge>{adaptiveDifficulty.suggestedLevel}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{adaptiveDifficulty.reasoning}</p>
        </CardContent>
      </Card>
    </div>
  );
}