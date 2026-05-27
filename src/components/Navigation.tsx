import React, { useState } from 'react';
import { Menu, X, LogOut, Rocket, Trophy, Home, Users } from 'lucide-react';


import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChildSelector } from './ChildSelector';



const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-xl border-b-2 border-cyan-500/30 sticky top-0 z-50 neon-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(user ? '/dashboard' : '/')}>
              <div className="relative">
                <Rocket className="w-10 h-10 text-cyan-400" />
                <div className="absolute inset-0 blur-xl bg-cyan-400/50 animate-pulse"></div>
              </div>
              <span className="text-3xl font-black neon-text" style={{fontFamily: 'Orbitron, sans-serif'}}>
                NumériKids
              </span>
            </div>


            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#parcours" className="text-cyan-200 hover:text-cyan-400 font-bold transition-all hover:scale-110 transform" style={{fontFamily: 'Orbitron, sans-serif'}}>
                PARCOURS
              </a>
              <a href="#parents" className="text-cyan-200 hover:text-cyan-400 font-bold transition-all hover:scale-110 transform" style={{fontFamily: 'Orbitron, sans-serif'}}>
                PARENTS
              </a>
              <a href="#pricing" className="text-cyan-200 hover:text-cyan-400 font-bold transition-all hover:scale-110 transform" style={{fontFamily: 'Orbitron, sans-serif'}}>
                TARIFS
              </a>
            </div>

          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <ChildSelector />
                <button
                  onClick={() => navigate('/household')}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Household
                </button>
                <button
                  onClick={() => navigate('/comparison')}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  <Users className="w-5 h-5" />
                  Compare
                </button>

                <button
                  onClick={() => navigate('/achievements')}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  <Trophy className="w-5 h-5" />
                  Achievements
                </button>




                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                >
                  Connexion
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all font-black neon-glow" style={{fontFamily: 'Orbitron, sans-serif'}}
                >
                  ESSAI GRATUIT
                </button>

              </>
            )}
          </div>

          <button
            className="md:hidden text-slate-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-cyan-500/20">
            <div className="flex flex-col space-y-4">
              <a href="#parcours" className="text-slate-300 hover:text-cyan-400 font-medium">
                Parcours
              </a>
              <a href="#parents" className="text-slate-300 hover:text-cyan-400 font-medium">
                Parents
              </a>
              <a href="#pricing" className="text-slate-300 hover:text-cyan-400 font-medium">
                Tarifs
              </a>
               <div className="flex flex-col space-y-2 pt-4 border-t border-cyan-500/20">
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('/household')}
                      className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 font-medium text-left"
                    >
                      <Home className="w-4 h-4" />
                      Household
                    </button>

                    <button
                      onClick={() => navigate('/comparison')}
                      className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 font-medium text-left"
                    >
                      <Users className="w-4 h-4" />
                      Compare
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 font-medium text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </>

                ) : (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="text-slate-300 hover:text-cyan-400 font-medium text-left"
                    >
                      Connexion
                    </button>
                    <button
                      onClick={() => navigate('/signup')}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all font-medium"
                    >
                      Essai gratuit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
