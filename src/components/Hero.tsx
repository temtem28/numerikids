import React from 'react';
import { Play, Star, Users, Clock, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative cyber-gradient min-h-[90vh] flex items-center overflow-hidden">
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-black text-cyan-400 leading-tight neon-text" style={{fontFamily: 'Orbitron, sans-serif'}}>
                DÉCOUVRE LE NUMÉRIQUE
              </h1>
              <p className="text-2xl text-cyan-100 leading-relaxed">
                Transforme l'apprentissage en <span className="text-purple-400 font-bold">aventure épique</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-6 text-cyan-200">
              <div className="flex items-center gap-2 bg-blue-900/30 px-4 py-2 rounded-lg neon-border">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>20-40 min/session</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-lg neon-border">
                <Users className="w-5 h-5 text-purple-400" />
                <span>3x par semaine</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-900/30 px-4 py-2 rounded-lg neon-border">
                <Star className="w-5 h-5 text-orange-400" />
                <span>Progression mesurable</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-cyan-400 hover:to-blue-500 transform hover:scale-105 transition-all duration-200 neon-glow flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Commencer l'aventure
              </button>
              <button className="flex items-center gap-3 bg-purple-600/20 text-cyan-300 px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-600/30 transition-all duration-200 border-2 border-purple-500">
                <Play className="w-5 h-5" />
                Voir la démo
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full"></div>
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/686d05e55b5989285f2bd17e_1762156850380_70392b44.jpeg"
              alt="Enfants apprenant le numérique"
              className="w-full rounded-2xl shadow-2xl relative z-10 neon-border"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
