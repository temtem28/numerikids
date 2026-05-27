interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label?: string;
}

export function ConnectionLine({ from, to, label }: ConnectionLineProps) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx);
  
  const arrowSize = 8;
  const arrowX = to.x - Math.cos(angle) * 75;
  const arrowY = to.y - Math.sin(angle) * 40;

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#94a3b8"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="5"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#94a3b8" />
        </marker>
      </defs>
      {label && (
        <g>
          <rect
            x={midX - 30}
            y={midY - 10}
            width="60"
            height="20"
            rx="4"
            fill="white"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <text
            x={midX}
            y={midY + 4}
            textAnchor="middle"
            className="text-xs fill-gray-700 pointer-events-none"
            style={{ fontSize: '10px' }}
          >
            {label.length > 10 ? label.substring(0, 10) + '...' : label}
          </text>
        </g>
      )}
    </g>
  );
}
