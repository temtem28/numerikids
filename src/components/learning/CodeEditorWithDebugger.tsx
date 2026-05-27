import React, { useState, useRef } from 'react';
import { Bug, Play, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PythonDebuggerPanel } from './PythonDebuggerPanel';
import { MemoryVisualization } from './MemoryVisualization';
import { PerformanceProfilerPanel } from './PerformanceProfilerPanel';
import { PythonDebugger } from '../../utils/pythonDebugger';
import { PerformanceProfiler, ProfileResult } from '../../utils/performanceProfiler';


interface CodeEditorWithDebuggerProps {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  isRunning: boolean;
  disabled: boolean;
}

export const CodeEditorWithDebugger: React.FC<CodeEditorWithDebuggerProps> = ({
  code,
  onChange,
  onRun,
  isRunning,
  disabled
}) => {
  const [debugMode, setDebugMode] = useState(false);
  const [profileMode, setProfileMode] = useState(false);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [debugState, setDebugState] = useState<any>(null);
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null);
  const debuggerRef = useRef<PythonDebugger>(new PythonDebugger());
  const profilerRef = useRef<PerformanceProfiler>(new PerformanceProfiler());


  const toggleBreakpoint = (line: number) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(line)) {
      newBreakpoints.delete(line);
    } else {
      newBreakpoints.add(line);
    }
    setBreakpoints(newBreakpoints);
    debuggerRef.current.setBreakpoints(Array.from(newBreakpoints));
  };

  const startDebug = async () => {
    await debuggerRef.current.instrumentAndRun(code);
    const state = debuggerRef.current.stepForward();
    setDebugState(state);
  };

  const handleStepForward = () => {
    const state = debuggerRef.current.stepForward();
    setDebugState(state);
  };

  const handleStepBackward = () => {
    const state = debuggerRef.current.stepBackward();
    setDebugState(state);
  };

  const handleReset = () => {
    debuggerRef.current.reset();
    setDebugState(null);
  };

  const startProfile = async () => {
    const instrumented = profilerRef.current.instrumentCode(code);
    const mockTimings: Record<number, number[]> = {};
    code.split('\n').forEach((line, idx) => {
      if (line.trim() && !line.trim().startsWith('#')) {
        mockTimings[idx + 1] = [Math.random() * 10 + 0.5];
      }
    });
    const result = profilerRef.current.analyzeProfile(mockTimings, code);
    setProfileResult(result);
  };


  const lines = code.split('\n');
  const currentLine = debugState?.line;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setDebugMode(!debugMode);
              setProfileMode(false);
            }}
            variant={debugMode ? 'default' : 'outline'}
            size="sm"
            className={debugMode ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            <Bug className="w-4 h-4 mr-1" />
            {debugMode ? 'Mode Debug' : 'Debug'}
          </Button>
          <Button
            onClick={() => {
              setProfileMode(!profileMode);
              setDebugMode(false);
              if (!profileMode) startProfile();
            }}
            variant={profileMode ? 'default' : 'outline'}
            size="sm"
            className={profileMode ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <Activity className="w-4 h-4 mr-1" />
            {profileMode ? 'Profiling' : 'Profile'}
          </Button>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={(debugMode || profileMode) ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/30">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0d0d0d] border-r border-cyan-500/30 flex flex-col items-center pt-4 text-slate-500 text-xs font-mono z-10">
              {lines.map((_, i) => {
                const lineNum = i + 1;
                const isBreakpoint = breakpoints.has(lineNum);
                const isCurrent = lineNum === currentLine;
                const profile = profileResult?.lineProfiles.find(p => p.lineNumber === lineNum);
                const isBottleneck = profileResult?.bottlenecks.includes(lineNum);
                
                return (
                  <div
                    key={i}
                    onClick={() => debugMode && toggleBreakpoint(lineNum)}
                    className={`leading-6 h-6 w-full flex items-center justify-center cursor-pointer hover:bg-gray-700/50 ${
                      isBreakpoint ? 'bg-red-600 text-white' : ''
                    } ${isCurrent ? 'bg-yellow-500 text-black' : ''} ${
                      isBottleneck ? 'bg-red-900 text-white' : ''
                    }`}
                  >
                    {lineNum}
                  </div>
                );
              })}
            </div>
            <textarea
              value={code}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-96 bg-[#1e1e1e] text-green-400 font-mono text-sm p-4 pl-16 focus:outline-none resize-none"
              placeholder="# Écris ton code Python ici..."
              spellCheck={false}
              style={{ lineHeight: '1.5rem' }}
            />
          </div>

          {debugMode ? (
            <Button onClick={startDebug} disabled={disabled} className="w-full mt-4 bg-orange-600 hover:bg-orange-700">
              <Play className="w-4 h-4 mr-2" />
              Déboguer
            </Button>
          ) : profileMode ? (
            <Button onClick={startProfile} disabled={disabled} className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
              <Activity className="w-4 h-4 mr-2" />
              Profiler
            </Button>
          ) : (
            <Button onClick={onRun} disabled={disabled || isRunning} className="w-full mt-4 bg-gradient-to-r from-green-500 to-cyan-600">
              <Play className="w-4 h-4 mr-2" />
              ▶️ Exécuter
            </Button>
          )}
        </div>
        {debugMode && (
          <div className="lg:col-span-1 space-y-4">
            <PythonDebuggerPanel
              currentState={debugState}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onReset={handleReset}
              canStepForward={debuggerRef.current.canStepForward()}
              canStepBackward={debuggerRef.current.canStepBackward()}
            />
            {debugState?.variables && (
              <MemoryVisualization 
                variables={debugState.variables} 
                className="mt-4"
              />
            )}
          </div>
        )}
        {profileMode && (
          <div className="lg:col-span-1">
            <PerformanceProfilerPanel
              profileResult={profileResult}
              code={code}
            />
          </div>
        )}
      </div>
    </div>
  );
};
