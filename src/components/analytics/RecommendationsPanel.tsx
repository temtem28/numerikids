import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Target } from 'lucide-react';

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
}

export default function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'hard': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <h3 className="text-xl font-semibold">Personalized Action Plan</h3>
      </div>

      {sortedRecommendations.map((rec, idx) => (
        <Card key={idx} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span className="text-base">Recommendation #{idx + 1}</span>
              </div>
              <div className="flex gap-2">
                <Badge variant={getPriorityColor(rec.priority) as any}>
                  {rec.priority.toUpperCase()}
                </Badge>
                <Badge className={getDifficultyColor(rec.difficulty)}>
                  {rec.difficulty}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Action:</h4>
              <p className="text-base">{rec.action}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Expected Impact:</h4>
              <p className="text-sm">{rec.expectedImpact}</p>
            </div>
            <Button className="w-full" variant="outline">
              Implement This Recommendation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}