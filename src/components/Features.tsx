import React from 'react';
import { Shield, Clock, BarChart3, Users, Heart, Zap } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "100% SÉCURISÉ",
      description: "Aucune publicité, données protégées, environnement sécurisé RGPD",
      color: "from-cyan-400 to-blue-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "SESSIONS COURTES",
      description: "20-40 minutes par session, 3 fois par semaine pour un apprentissage optimal",
      color: "from-blue-400 to-purple-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "PROGRESSION MESURABLE",
      description: "Suivi détaillé des progrès avec rapports parents et badges motivation",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "ADAPTÉ À L'ÂGE",
      description: "Parcours spécialement conçus pour les 7-12 ans et 13-16 ans",
      color: "from-cyan-400 to-teal-500"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "PÉDAGOGIE BIENVEILLANTE",
      description: "Méthodes d'apprentissage positives, sans stress ni compétition",
      color: "from-pink-400 to-purple-500"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "INTERACTIF & LUDIQUE",
      description: "Exercices pratiques, projets créatifs et gamification motivante",
      color: "from-orange-400 to-pink-500"
    }
  ];

  return (
    <section className="py-20 purple-gradient relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
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

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-cyan-400 mb-4 neon-text" style={{fontFamily: 'Orbitron, sans-serif'}}>
            POURQUOI NUMERIKIDS ?
          </h2>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
            Une approche pédagogique unique qui respecte le rythme de chaque enfant
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-all duration-300">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg neon-glow`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-black text-cyan-300 mb-3" style={{fontFamily: 'Orbitron, sans-serif'}}>{feature.title}</h3>
              <p className="text-cyan-100 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl p-8 max-w-4xl mx-auto neon-border backdrop-blur-sm">
            <h3 className="text-3xl font-black text-cyan-400 mb-4 neon-text" style={{fontFamily: 'Orbitron, sans-serif'}}>
              GARANTIE SATISFACTION
            </h3>
            <p className="text-cyan-100 mb-6 text-lg">
              Si votre enfant ne progresse pas après 30 jours, nous vous remboursons intégralement.
            </p>
            <button className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-10 py-4 rounded-xl font-black hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 neon-glow text-lg" style={{fontFamily: 'Orbitron, sans-serif'}}>
              ESSAI GRATUIT 7 JOURS
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
