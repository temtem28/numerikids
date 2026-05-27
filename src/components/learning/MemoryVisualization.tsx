import React from 'react';
import { Card } from '@/components/ui/card';
import { analyzeMemory, resetMemoryAnalyzer } from '@/utils/memoryAnalyzer';

interface MemoryVisualizationProps {
  variables: Record<string, any>;
  className?: string;
}

export const MemoryVisualization: React.FC<MemoryVisualizationProps> = ({ 
  variables, 
  className = '' 
}) => {
  const memoryState = React.useMemo(() => {
    resetMemoryAnalyzer();
    return analyzeMemory(variables);
  }, [variables]);

  const { objects, variableRefs, connections } = memoryState;

  const renderValue = (value: any, type: string) => {
    if (type === 'list') {
      return (
        <div className="space-y-1">
          {(value as any[]).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">[{idx}]</span>
              <span className="font-mono">{JSON.stringify(item)}</span>
            </div>
          ))}
        </div>
      );
    } else if (type === 'dict') {
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">'{key}':</span>
              <span className="font-mono">{JSON.stringify(val)}</span>
            </div>
          ))}
        </div>
      );
    }
    return <span className="font-mono text-sm">{JSON.stringify(value)}</span>;
  };

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        Memory Visualization
      </h3>
      
      <div className="space-y-6">
        {/* Variables Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Variables (Stack)</h4>
          <div className="space-y-2">
            {Array.from(variableRefs.entries()).map(([name, objId]) => {
              const obj = objects.get(objId);
              if (!obj) return null;
              
              return (
                <div key={name} className="flex items-center gap-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <span className="font-mono font-semibold text-blue-700">{name}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-xs text-gray-500 font-mono">{obj.address}</span>
                  {obj.refCount > 1 && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                      Shared ({obj.refCount} refs)
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Memory Objects Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Heap Memory</h4>
          <div className="space-y-3">
            {Array.from(objects.values()).map((obj) => (
              <div key={obj.id} className="border rounded-lg p-3 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-purple-700 font-semibold">{obj.address}</span>
                  <span className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded">{obj.type}</span>
                </div>
                <div className="mb-2">
                  {renderValue(obj.value, obj.type)}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Refs: {obj.refCount}</span>
                  {obj.referencedBy.length > 0 && (
                    <span className="text-xs">← {obj.referencedBy.join(', ')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reference Connections Info */}
        {connections.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Object References</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {connections.map((conn, idx) => {
                const fromObj = objects.get(conn.from);
                const toObj = objects.get(conn.to);
                return (
                  <div key={idx} className="flex items-center gap-2 p-1 bg-gray-50 rounded">
                    <span className="font-mono">{fromObj?.address}</span>
                    <span>→</span>
                    <span className="font-mono">{toObj?.address}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

