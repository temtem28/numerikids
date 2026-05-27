import React, { useState } from 'react';
import { SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface DebugState {
  line: number;
  variables: Record<string, any>;
  callStack: Array<{ name: string; line: number; locals: Record<string, any> }>;
  output: string;
  error?: string;
}

interface PythonDebuggerPanelProps {
  currentState: DebugState | null;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  canStepForward: boolean;
  canStepBackward: boolean;
}

export const PythonDebuggerPanel: React.FC<PythonDebuggerPanelProps> = ({
  currentState,
  onStepForward,
  onStepBackward,
  onReset,
  canStepForward,
  canStepBackward,
}) => {
  const [watchExpressions, setWatchExpressions] = useState<string[]>([]);
  const [newWatch, setNewWatch] = useState('');

  const addWatch = () => {
    if (newWatch.trim()) {
      setWatchExpressions([...watchExpressions, newWatch.trim()]);
      setNewWatch('');
    }
  };

  const removeWatch = (index: number) => {
    setWatchExpressions(watchExpressions.filter((_, i) => i !== index));
  };

  const evaluateWatch = (expr: string): string => {
    if (!currentState?.variables) return 'N/A';
    try {
      if (expr in currentState.variables) {
        return currentState.variables[expr];
      }
      const varPattern = /^(\w+)\s*([+\-*/])\s*(\w+|\d+)$/;
      const match = expr.match(varPattern);
      if (match) {
        const [, left, op, right] = match;
        const leftVal = parseFloat(currentState.variables[left] || left);
        const rightVal = parseFloat(currentState.variables[right] || right);
        if (!isNaN(leftVal) && !isNaN(rightVal)) {
          switch(op) {
            case '+': return String(leftVal + rightVal);
            case '-': return String(leftVal - rightVal);
            case '*': return String(leftVal * rightVal);
            case '/': return String(leftVal / rightVal);
          }
        }
      }
      return 'Invalid';
    } catch {
      return 'Error';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gray-900 border-gray-700">
        <div className="flex items-center gap-2">
          <Button onClick={onReset} size="sm" variant="outline" className="bg-gray-800 hover:bg-gray-700">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button onClick={onStepBackward} disabled={!canStepBackward} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button onClick={onStepForward} disabled={!canStepForward} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <SkipForward className="w-4 h-4" />
          </Button>
          {currentState && <span className="ml-auto text-sm text-gray-400">Line: {currentState.line}</span>}
        </div>
      </Card>

      <Card className="p-4 bg-gray-900 border-gray-700">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Variables</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {currentState?.variables && Object.keys(currentState.variables).length > 0 ? (
            Object.entries(currentState.variables).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm font-mono">
                <span className="text-purple-400">{key}</span>
                <span className="text-green-400">{String(value)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No variables yet</p>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-gray-900 border-gray-700">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3">Watch</h3>
        <div className="flex gap-2 mb-3">
          <Input
            value={newWatch}
            onChange={(e) => setNewWatch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addWatch()}
            placeholder="Variable or expression..."
            className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
          />
          <Button onClick={addWatch} size="sm" className="bg-cyan-600 hover:bg-cyan-700">Add</Button>
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {watchExpressions.map((expr, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm font-mono gap-2">
              <span className="text-yellow-400">{expr}:</span>
              <span className="text-green-400 flex-1">{evaluateWatch(expr)}</span>
              <Button onClick={() => removeWatch(idx)} size="sm" variant="ghost" className="h-6 px-2 text-red-400">×</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
