import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SendTimeHeatmapProps {
  data: number[][];
}

export const SendTimeHeatmap: React.FC<SendTimeHeatmapProps> = ({ data }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100';
    if (value < 25) return 'bg-blue-200';
    if (value < 50) return 'bg-blue-300';
    if (value < 75) return 'bg-blue-400';
    return 'bg-blue-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-1">
              <div className="w-12"></div>
              {hours.map(h => (
                <div key={h} className="w-6 text-xs text-center text-gray-600">
                  {h}
                </div>
              ))}
            </div>
            {data.map((row, dayIdx) => (
              <div key={dayIdx} className="flex gap-1 mt-1">
                <div className="w-12 text-xs text-gray-600 flex items-center">
                  {days[dayIdx]}
                </div>
                {row.map((value, hourIdx) => (
                  <div
                    key={hourIdx}
                    className={`w-6 h-6 ${getColor(value)} rounded cursor-pointer hover:opacity-80 transition-opacity`}
                    title={`${days[dayIdx]} ${hourIdx}:00 - Score: ${value.toFixed(1)}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs">
            <span className="text-gray-600">Low</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <div className="w-4 h-4 bg-blue-300 rounded"></div>
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
            </div>
            <span className="text-gray-600">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};