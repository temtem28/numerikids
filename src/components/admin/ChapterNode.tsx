interface ChapterNodeProps {
  chapter: {
    id: string;
    title: string;
    description: string;
  };
  position: { x: number; y: number };
  onDragStart: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export function ChapterNode({ chapter, position, onDragStart, onClick }: ChapterNodeProps) {
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onMouseDown={onDragStart}
      onClick={onClick}
      className="cursor-pointer"
    >
      <rect
        x="-75"
        y="-40"
        width="150"
        height="80"
        rx="8"
        fill="white"
        stroke="#3b82f6"
        strokeWidth="2"
        className="hover:fill-blue-50 transition-colors"
      />
      <text
        x="0"
        y="-10"
        textAnchor="middle"
        className="text-sm font-semibold fill-gray-900 pointer-events-none"
        style={{ fontSize: '14px' }}
      >
        {chapter.title.length > 18 ? chapter.title.substring(0, 18) + '...' : chapter.title}
      </text>
      <text
        x="0"
        y="10"
        textAnchor="middle"
        className="text-xs fill-gray-500 pointer-events-none"
        style={{ fontSize: '11px' }}
      >
        {chapter.description.length > 20 ? chapter.description.substring(0, 20) + '...' : chapter.description}
      </text>
    </g>
  );
}
