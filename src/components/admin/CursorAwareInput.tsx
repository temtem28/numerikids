import React, { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CursorIndicator } from './CursorIndicator';

interface CursorAwareInputProps {
  fieldId: string;
  value: string;
  onChange: (e: any) => void;
  onCursorMove: (fieldId: string, position: number) => void;
  cursors: Array<{ userId: string; userName: string; fieldId: string; position: number; color: string }>;
  multiline?: boolean;
  [key: string]: any;
}

export const CursorAwareInput: React.FC<CursorAwareInputProps> = ({
  fieldId,
  value,
  onChange,
  onCursorMove,
  cursors,
  multiline = false,
  ...props
}) => {
  const inputRef = useRef<any>(null);

  const handleSelectionChange = () => {
    if (inputRef.current) {
      const position = inputRef.current.selectionStart || 0;
      onCursorMove(fieldId, position);
    }
  };

  const fieldCursors = cursors.filter(c => c.fieldId === fieldId);
  const Component = multiline ? Textarea : Input;

  return (
    <div className="relative">
      <Component
        ref={inputRef}
        value={value}
        onChange={onChange}
        onKeyUp={handleSelectionChange}
        onClick={handleSelectionChange}
        {...props}
      />
      {fieldCursors.map((cursor) => (
        <CursorIndicator
          key={cursor.userId}
          userName={cursor.userName}
          color={cursor.color}
          position={cursor.position}
          fieldId={fieldId}
        />
      ))}
    </div>
  );
};

export default CursorAwareInput;

