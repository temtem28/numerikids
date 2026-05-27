import React from 'react';
import { User, Edit, Trash2, Calendar, Coins, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface ChildCardProps {
  child: any;
  onEdit: () => void;
  onDelete: () => void;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  selectionMode?: boolean;
}

const ChildCard: React.FC<ChildCardProps> = ({ 
  child, 
  onEdit, 
  onDelete, 
  selected = false, 
  onSelect, 
  selectionMode = false 
}) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - (child.birth_year || currentYear - 8);
  const coins = child.coins || 0;
  const xp = child.xp || 0;
  const level = child.level || 1;
  const gradeLevel = child.grade_level || 'N/A';

  return (
    <div className={`bg-slate-800/50 border rounded-lg p-6 hover:border-cyan-500/50 transition-all relative ${
      selected ? 'border-cyan-500 ring-2 ring-cyan-500/50' : 'border-slate-700'
    }`}>
      {selectionMode && onSelect && (
        <div className="absolute top-4 right-4">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="border-cyan-500 data-[state=checked]:bg-cyan-500"
          />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            {child.avatar_url ? (
              <img src={child.avatar_url} alt={child.pseudo} className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-white text-lg">{child.pseudo}</h4>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <Calendar className="w-3 h-3" />
              <span>{age} ans</span>
            </div>
            <Badge variant="outline" className="mt-1 border-purple-500/50 text-purple-400 text-xs">
              {gradeLevel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Coins className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-xs text-slate-400">Pièces</p>
          <p className="text-lg font-bold text-yellow-400">{coins}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xs text-slate-400">XP</p>
          <p className="text-lg font-bold text-cyan-400">{xp}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xs text-slate-400">Niveau</p>
          <p className="text-lg font-bold text-purple-400">{level}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onEdit}
          variant="outline"
          size="sm"
          className="flex-1 border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-400"
        >
          <Edit className="w-4 h-4 mr-1" />
          Modifier
        </Button>
        <Button
          onClick={onDelete}
          variant="outline"
          size="sm"
          className="flex-1 border-red-500/30 hover:bg-red-500/10 text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default ChildCard;
