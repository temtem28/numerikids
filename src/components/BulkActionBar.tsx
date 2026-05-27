import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, X } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onClear: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onEdit, onDelete, onClear }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-full px-6 py-3 shadow-2xl backdrop-blur-xl flex items-center gap-4">
        <span className="text-white font-semibold">
          {selectedCount} enfant(s) sélectionné(s)
        </span>
        
        <div className="flex gap-2">
          <Button
            onClick={onEdit}
            size="sm"
            className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-full"
          >
            <Edit className="w-4 h-4 mr-1" />
            Modifier
          </Button>
          
          <Button
            onClick={onDelete}
            size="sm"
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Supprimer
          </Button>
          
          <Button
            onClick={onClear}
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
