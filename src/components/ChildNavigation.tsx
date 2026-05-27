import React from 'react';
import { Home, BookOpen, Trophy, User, Star, Flame, ShoppingBag, Package, Sparkles, MessageSquare, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MessagingPanel } from './MessagingPanel';
import { useAuth } from '@/contexts/AuthContext';

interface ChildNavigationProps {
  childName: string;
  avatarUrl: string;
  points: number;
  progress: number;
  streak?: number;
  coins?: number;
  childId?: string;
}


const ChildNavigation: React.FC<ChildNavigationProps> = ({ childName, avatarUrl, points, progress, streak = 0, coins = 0, childId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  
  return (

    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={avatarUrl} alt={childName} className="w-12 h-12 rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-500/50" />
            <div>
              <h2 className="text-lg font-bold text-white">Salut {childName}! 👋</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-cyan-400">{points} points</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">🪙</span>
                  <span className="text-sm font-semibold text-yellow-400">{coins} coins</span>
                </div>
                {streak > 0 && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-2 py-1 rounded-full border border-orange-500/30">
                    <Flame className={`w-4 h-4 ${streak >= 7 ? 'text-orange-500' : 'text-orange-400'} fill-current animate-pulse`} />
                    <span className="text-sm font-bold text-orange-400">{streak} jours 🔥</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6">

            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm text-slate-400">Progression</span>
              <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm font-bold text-cyan-400">{progress}%</span>
            </div>
            <div className="flex gap-2">
              {childId && <MessagingPanel currentUserId={childId} userRole="child" />}
              <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Accueil">
                <Home className="w-5 h-5 text-slate-400" />
              </button>
              <button onClick={() => navigate('/my-goals')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors relative group" title="Mes objectifs">
                <Target className="w-5 h-5 text-cyan-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              </button>
              <button onClick={() => navigate('/achievements')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Succès">
                <Trophy className="w-5 h-5 text-slate-400" />
              </button>
              <button onClick={() => navigate('/store')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Boutique">
                <ShoppingBag className="w-5 h-5 text-yellow-400" />
              </button>
              <button onClick={() => navigate('/inventory')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Inventaire">
                <Package className="w-5 h-5 text-slate-400" />
              </button>
              <button onClick={() => navigate('/showcase')} className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Vitrine">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>


  );
};

export default ChildNavigation;
