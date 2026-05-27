import React from 'react';

interface CursorIndicatorProps {
  userName: string;
  color: string;
  position: number;
  fieldId: string;
}

export const CursorIndicator: React.FC<CursorIndicatorProps> = ({
  userName,
  color,
  position,
}) => {
  return (
    <span
      className="absolute pointer-events-none z-50 transition-all duration-100"
      style={{
        left: `${position}ch`,
        top: '0',
      }}
    >
      <div
        className="w-0.5 h-5 animate-pulse"
        style={{ backgroundColor: color }}
      />
      <div
        className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap mt-0.5 shadow-md"
        style={{ backgroundColor: color, color: 'white' }}
      >
        {userName}
      </div>
    </span>
  );
};
