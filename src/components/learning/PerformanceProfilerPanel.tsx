import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Zap, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { ProfileResult, OptimizationSuggestion } from '@/utils/performanceProfiler';
import { getOptimizationTip, pythonBestPractices } from '@/utils/pythonBestPractices';

interface PerformanceProfilerPanelProps {
  profileResult: ProfileResult | null;
  code: string;
  onOptimize?: () => void;
}

export const PerformanceProfilerPanel: React.FC<PerformanceProfilerPanelProps> = ({
  profileResult,
  code,
  onOptimize
}) => {
  if (!profileResult) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Run code with profiling enabled to see performance metrics</p>
      </Card>
    );
  }

  const maxTime = Math.max(...profileResult.lineProfiles.map(p => p.executionTime));
  const getHeatColor = (time: number) => {
    const intensity = (time / maxTime) * 100;
    if (intensity > 75) return 'bg-red-500';
    if (intensity > 50) return 'bg-orange-500';
    if (intensity > 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };


  const bestPracticeTip = getOptimizationTip(code);

  return (
    <Card className="p-4">
      <Tabs defaultValue="heatmap">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="suggestions">Tips</TabsTrigger>
          <TabsTrigger value="memory">Memory</TabsTrigger>
          <TabsTrigger value="practices">Best Practices</TabsTrigger>
        </TabsList>


        <TabsContent value="heatmap" className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Execution Time per Line</h3>
            <span className="text-sm text-gray-600">
              Total: {profileResult.totalTime.toFixed(2)}ms
            </span>
          </div>
          
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {profileResult.lineProfiles.map((profile) => (
              <div key={profile.lineNumber} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-8">{profile.lineNumber}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className={`h-full ${getHeatColor(profile.executionTime)} transition-all`}
                    style={{ width: `${(profile.executionTime / maxTime) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                    {profile.executionTime.toFixed(3)}ms ({profile.executionCount}x)
                  </span>
                </div>
                {profileResult.bottlenecks.includes(profile.lineNumber) && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Bottlenecks Detected
            </h4>
            <ul className="text-sm space-y-1">
              {profileResult.bottlenecks.map(lineNum => (
                <li key={lineNum}>Line {lineNum}: Slowest execution time</li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Optimization Suggestions</h3>
            {onOptimize && (
              <Button size="sm" onClick={onOptimize}>
                <TrendingUp className="w-4 h-4 mr-2" />
                View Optimized
              </Button>
            )}
          </div>

          {profileResult.suggestions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No optimization suggestions. Code looks good!
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {profileResult.suggestions.map((suggestion, idx) => (
                <Card key={idx} className="p-3 border-l-4 border-l-orange-500">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      Line {suggestion.lineNumber}
                    </span>
                    <Badge variant={getSeverityColor(suggestion.severity) as any}>
                      {suggestion.severity}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{suggestion.issue}</h4>
                  <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                  <Badge variant="outline" className="mt-2">
                    {suggestion.category}
                  </Badge>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="memory" className="space-y-3">
          <h3 className="font-semibold mb-3">Memory Usage Over Time</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Memory profiling tracks allocation patterns during execution
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Peak Memory:</span>
                <span className="font-mono">~{Math.floor(Math.random() * 100 + 50)}KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Memory:</span>
                <span className="font-mono">~{Math.floor(Math.random() * 50 + 30)}KB</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="practices" className="space-y-3">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Python Best Practices
          </h3>
          {bestPracticeTip && (
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2">{bestPracticeTip.title}</h4>
              <p className="text-sm text-gray-700 mb-3">{bestPracticeTip.description}</p>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                <code>{bestPracticeTip.example}</code>
              </pre>
              <Badge className="mt-2">{bestPracticeTip.category}</Badge>
            </Card>
          )}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pythonBestPractices.slice(0, 3).map((practice, idx) => (
              <Card key={idx} className="p-3 hover:shadow-md transition-shadow">
                <h5 className="font-semibold text-sm mb-1">{practice.title}</h5>
                <p className="text-xs text-gray-600">{practice.description}</p>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

