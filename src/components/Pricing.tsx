import React from 'react';
import { Check, Star } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "DÉCOUVERTE",
      price: "Gratuit",
      period: "",
      description: "Parfait pour tester",
      features: ["1 module complet", "7 jours d'accès", "Suivi basique", "Support email"],
      cta: "COMMENCER",
      popular: false,
      color: "from-cyan-400 to-blue-500"
    },
    {
      name: "ENFANT SOLO",
      price: "9,90€",
      period: "/mois",
      description: "Idéal pour un enfant",
      features: ["Tous les modules", "Accès illimité", "Dashboard parent", "Rapports hebdo", "Support prioritaire", "Nouveaux contenus"],
      cta: "CHOISIR",
      popular: true,
      color: "from-purple-400 to-pink-500"
    },
    {
      name: "PACK FAMILLE",
      price: "24,90€",
      period: "/mois",
      description: "Jusqu'à 4 enfants",
      features: ["Avantages Solo", "4 profils enfants", "Dashboard famille", "Comparaison progrès", "Sessions famille", "Réductions"],
      cta: "CHOISIR",
      popular: false,
      color: "from-cyan-400 to-purple-500"
    }
  ];

  return (
    <section id="pricing" className="py-20 cyber-gradient relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-cyan-400 rounded-full star" style={{left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`}} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-cyan-400 mb-4 neon-text" style={{fontFamily: 'Orbitron, sans-serif'}}>TARIFS</h2>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto">Pas d'engagement, résiliation à tout moment</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl p-8 relative neon-border backdrop-blur-sm hover:scale-105 transition-all duration-300">
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`bg-gradient-to-r ${plan.color} text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 neon-glow`}>
                    <Star className="w-4 h-4" />POPULAIRE
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-cyan-300 mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>{plan.name}</h3>
                <p className="text-cyan-200 mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-5xl font-black text-cyan-400 neon-text">{plan.price}</span>
                  <span className="text-cyan-300">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-cyan-100">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-xl font-black transition-all duration-300 bg-gradient-to-r ${plan.color} text-white hover:scale-105 neon-glow`} style={{fontFamily: 'Orbitron, sans-serif'}}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-cyan-200 mb-4">🔒 Paiement sécurisé • 🚫 Aucune publicité • 📱 Compatible tous appareils</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
