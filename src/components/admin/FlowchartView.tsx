import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { ChapterNode } from './ChapterNode';
import { ConnectionLine } from './ConnectionLine';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

interface Branch {
  id: string;
  from_chapter_id: string;
  to_chapter_id: string;
  condition_type: string;
  label?: string;
}

interface FlowchartViewProps {
  chapters: Chapter[];
  branches: Branch[];
  onChapterClick: (chapterId: string) => void;
}

export function FlowchartView({ chapters, branches, onChapterClick }: FlowchartViewProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    chapters.forEach((ch, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      positions[ch.id] = { x: 150 + col * 300, y: 100 + row * 200 };
    });
    setNodePositions(positions);
  }, [chapters]);

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.3));
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleNodeDragStart = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const pos = nodePositions[chapterId];
    setDragging(chapterId);
    setDragOffset({ x: e.clientX - pos.x * zoom, y: e.clientY - pos.y * zoom });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && nodePositions[dragging]) {
      setNodePositions({
        ...nodePositions,
        [dragging]: {
          x: (e.clientX - dragOffset.x) / zoom,
          y: (e.clientY - dragOffset.y) / zoom
        }
      });
    }
  };

  const handleMouseUp = () => setDragging(null);

  return (
    <div className="relative w-full h-[600px] border rounded-lg bg-slate-50 overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button size="sm" variant="outline" onClick={handleZoomIn}><ZoomIn className="h-4 w-4" /></Button>
        <Button size="sm" variant="outline" onClick={handleZoomOut}><ZoomOut className="h-4 w-4" /></Button>
        <Button size="sm" variant="outline" onClick={handleReset}><Maximize2 className="h-4 w-4" /></Button>
      </div>
      
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {branches.map((branch) => {
            const from = nodePositions[branch.from_chapter_id];
            const to = nodePositions[branch.to_chapter_id];
            if (!from || !to) return null;
            return <ConnectionLine key={branch.id} from={from} to={to} label={branch.label} />;
          })}
          
          {chapters.map((chapter) => {
            const pos = nodePositions[chapter.id];
            if (!pos) return null;
            return (
              <ChapterNode
                key={chapter.id}
                chapter={chapter}
                position={pos}
                onDragStart={(e) => handleNodeDragStart(chapter.id, e)}
                onClick={() => onChapterClick(chapter.id)}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
