import React from 'react';
import { Trophy, Star, Award, Zap, Flame } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  isStreak?: boolean;
}

const BadgeDisplay: React.FC<{ badges: Badge[] }> = ({ badges }) => {
  const icons = [Trophy, Star, Award, Zap, Flame];

  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => {
        const Icon = icons[index % icons.length];
        return (
          <div
            key={badge.id}
            className={`p-4 rounded-xl text-center transition-all ${
              badge.earned
                ? badge.isStreak 
                  ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-400 animate-pulse'
                  : 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400'
                : 'bg-slate-800/50 border-2 border-slate-700 opacity-50'
            }`}
          >
            <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
              badge.earned 
                ? badge.isStreak
                  ? 'bg-gradient-to-br from-orange-500 to-red-500'
                  : 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                : 'bg-slate-700'
            }`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">{badge.name}</h4>
            <p className="text-xs text-slate-400">{badge.description}</p>
          </div>

        );
      })}
    </div>
  );
};

export default BadgeDisplay;
