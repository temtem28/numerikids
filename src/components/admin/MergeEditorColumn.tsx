import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface MergeEditorColumnProps {
  title: string;
  content: any;
  onSelect?: (field: string, value: any) => void;
  isBase?: boolean;
  conflicts?: string[];
  selectedFields?: Record<string, string>;
  onEdit?: (field: string, value: any) => void;
  editable?: boolean;
}

export const MergeEditorColumn: React.FC<MergeEditorColumnProps> = ({
  title,
  content,
  onSelect,
  isBase,
  conflicts = [],
  selectedFields = {},
  onEdit,
  editable = false
}) => {
  const renderValue = (value: any): string => {
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const fields = Object.keys(content || {});

  return (
    <div className="flex-1 border rounded-lg overflow-hidden">
      <div className="bg-slate-800 text-white px-4 py-2 font-semibold">{title}</div>
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto bg-slate-50">
        {fields.map(field => {
          const isConflict = conflicts.includes(field);
          const isSelected = selectedFields[field] === title;
          
          return (
            <div key={field} className={`border rounded p-3 ${isConflict ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-700">{field}</span>
                {!isBase && onSelect && (
                  <Button size="sm" variant={isSelected ? "default" : "outline"} onClick={() => onSelect(field, content[field])}>
                    <Check className="w-4 h-4 mr-1" />
                    Use This
                  </Button>
                )}
              </div>
              <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">{renderValue(content[field])}</pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};
