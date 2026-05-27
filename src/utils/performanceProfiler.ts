export interface LineProfile {
  lineNumber: number;
  executionTime: number;
  executionCount: number;
  memoryDelta: number;
}

export interface ProfileResult {
  totalTime: number;
  lineProfiles: LineProfile[];
  memoryUsage: { time: number; memory: number }[];
  bottlenecks: number[];
  suggestions: OptimizationSuggestion[];
}

export interface OptimizationSuggestion {
  lineNumber: number;
  issue: string;
  suggestion: string;
  category: 'performance' | 'memory' | 'best-practice';
  severity: 'low' | 'medium' | 'high';
}

export class PerformanceProfiler {
  private lineTimings: Map<number, number[]> = new Map();
  private memorySnapshots: { time: number; memory: number }[] = [];
  private startTime: number = 0;

  instrumentCode(code: string): string {
    const lines = code.split('\n');
    const instrumented: string[] = [];
    
    instrumented.push('import time');
    instrumented.push('import sys');
    instrumented.push('_profiler_data = {"timings": {}, "memory": []}');
    instrumented.push('_profiler_start = time.perf_counter()');
    
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      
      if (trimmed && !trimmed.startsWith('#')) {
        instrumented.push(`_line_start = time.perf_counter()`);
        instrumented.push(line);
        instrumented.push(`_line_time = time.perf_counter() - _line_start`);
        instrumented.push(`if ${lineNum} not in _profiler_data["timings"]: _profiler_data["timings"][${lineNum}] = []`);
        instrumented.push(`_profiler_data["timings"][${lineNum}].append(_line_time * 1000)`);
      } else {
        instrumented.push(line);
      }
    });
    
    return instrumented.join('\n');
  }

  analyzeProfile(timings: Record<number, number[]>, code: string): ProfileResult {
    const lineProfiles: LineProfile[] = [];
    let totalTime = 0;

    Object.entries(timings).forEach(([lineNum, times]) => {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      totalTime += avgTime * times.length;
      
      lineProfiles.push({
        lineNumber: parseInt(lineNum),
        executionTime: avgTime,
        executionCount: times.length,
        memoryDelta: 0
      });
    });

    lineProfiles.sort((a, b) => b.executionTime - a.executionTime);
    const bottlenecks = lineProfiles.slice(0, 3).map(p => p.lineNumber);
    const suggestions = this.generateSuggestions(code, lineProfiles);

    return {
      totalTime,
      lineProfiles,
      memoryUsage: this.memorySnapshots,
      bottlenecks,
      suggestions
    };
  }

  private generateSuggestions(code: string, profiles: LineProfile[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const lines = code.split('\n');

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();
      const profile = profiles.find(p => p.lineNumber === lineNum);

      if (trimmed.includes('for') && trimmed.includes('range') && trimmed.includes('len(')) {
        suggestions.push({
          lineNumber: lineNum,
          issue: 'Using range(len()) pattern',
          suggestion: 'Use enumerate() or iterate directly over the collection',
          category: 'best-practice',
          severity: 'medium'
        });
      }

      if (trimmed.includes('+=') && trimmed.includes('[') && profile && profile.executionCount > 100) {
        suggestions.push({
          lineNumber: lineNum,
          issue: 'List concatenation in loop',
          suggestion: 'Use list.append() or list comprehension for better performance',
          category: 'performance',
          severity: 'high'
        });
      }

      if (trimmed.match(/\bfor\b.*\bfor\b/)) {
        suggestions.push({
          lineNumber: lineNum,
          issue: 'Nested loops detected',
          suggestion: 'Consider using list comprehension or vectorized operations',
          category: 'performance',
          severity: 'medium'
        });
      }

      if (trimmed.includes('.append(') && profile && profile.executionCount > 1000) {
        suggestions.push({
          lineNumber: lineNum,
          issue: 'Frequent append operations',
          suggestion: 'Consider preallocating list size or using list comprehension',
          category: 'performance',
          severity: 'medium'
        });
      }
    });

    return suggestions;
  }
}
