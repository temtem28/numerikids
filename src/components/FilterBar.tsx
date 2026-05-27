import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  ageRange: [number, number];
  onAgeRangeChange: (value: [number, number]) => void;
  levelRange: [number, number];
  onLevelRangeChange: (value: [number, number]) => void;
  xpRange: [number, number];
  onXpRangeChange: (value: [number, number]) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  ageRange,
  onAgeRangeChange,
  levelRange,
  onLevelRangeChange,
  xpRange,
  onXpRangeChange,
  onResetFilters,
  hasActiveFilters
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Rechercher par pseudo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-slate-800/50 border-cyan-500/20 text-white"
          />
        </div>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[200px] bg-slate-800/50 border-cyan-500/20 text-white">
            <SelectValue placeholder="Trier par..." />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-cyan-500/20">
            <SelectItem value="pseudo-asc">Pseudo (A-Z)</SelectItem>
            <SelectItem value="pseudo-desc">Pseudo (Z-A)</SelectItem>
            <SelectItem value="age-asc">Âge (croissant)</SelectItem>
            <SelectItem value="age-desc">Âge (décroissant)</SelectItem>
            <SelectItem value="level-asc">Niveau (croissant)</SelectItem>
            <SelectItem value="level-desc">Niveau (décroissant)</SelectItem>
            <SelectItem value="xp-asc">XP (croissant)</SelectItem>
            <SelectItem value="xp-desc">XP (décroissant)</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filtres avancés
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-slate-800 border-cyan-500/20 text-white">
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-slate-300">Âge: {currentYear - ageRange[1]} - {currentYear - ageRange[0]} ans</Label>
                <Slider
                  min={currentYear - 18}
                  max={currentYear - 4}
                  step={1}
                  value={ageRange}
                  onValueChange={(val) => onAgeRangeChange(val as [number, number])}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-slate-300">Niveau: {levelRange[0]} - {levelRange[1]}</Label>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={levelRange}
                  onValueChange={(val) => onLevelRangeChange(val as [number, number])}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm text-slate-300">XP: {xpRange[0]} - {xpRange[1]}</Label>
                <Slider
                  min={0}
                  max={10000}
                  step={100}
                  value={xpRange}
                  onValueChange={(val) => onXpRangeChange(val as [number, number])}
                  className="mt-2"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            onClick={onResetFilters}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <X className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
