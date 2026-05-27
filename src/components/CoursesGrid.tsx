import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Shield, Palette, Wrench, Sparkles, Gamepad2, Brain, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureGate } from './FeatureGate';

const CoursesGrid: React.FC = () => {
  const navigate = useNavigate();
  const subscription = useSubscription();


  const courses = [
    {
      id: 1,
      courseId: 'pixel-kingdom',
      title: "Le Royaume des Pixels",
      subtitle: "Saga Épique - 15 Quêtes",
      description: "Embarque pour une aventure médiévale-fantasy où la magie rencontre le code",
      age: "7-12 ans",
      duration: "15 quêtes",
      icon: <Gamepad2 className="w-6 h-6" />,
      image: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763342398107_10dca743.webp",
      color: "from-purple-400 to-blue-500",
      glow: "shadow-purple-500/50",
      requiredTier: 'free'
    },
    {
      id: 4,
      courseId: 'novaville',
      title: "Nova-Ville",
      subtitle: "Cité Numérique Durable",
      description: "Construis et gère une ville virtuelle intelligente et durable",
      age: "10-14 ans",
      duration: "8 quêtes",
      icon: <Sparkles className="w-6 h-6" />,
      image: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763347980380_54e02547.webp",
      color: "from-green-400 to-emerald-500",
      glow: "shadow-green-500/50",
      requiredTier: 'basic'
    },
    {
      id: 7,
      courseId: 'digitalart',
      title: "Les Maîtres de l'Art Numérique",
      subtitle: "Saga Digital Art",
      description: "Crée des médias expressifs: design, animation, vidéo et web",
      age: "10-14 ans",
      duration: "8 quêtes",
      icon: <Palette className="w-6 h-6" />,
      image: "https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763509349328_149425d0.webp",
      color: "from-pink-400 to-purple-500",
      glow: "shadow-pink-500/50",
      requiredTier: 'premium'
    },
    {
      id: 2,
      courseId: 'python',
      title: "Le Temple du Serpent de Code",
      subtitle: "Saga Python",
      description: "Explore les mystères du temple et deviens maître du Python",
      age: "10-14 ans",
      duration: "8 quêtes",
      icon: <Code className="w-6 h-6" />,
      image: "https://d64gsuwffb70l.cloudfront.net/686d05e55b5989285f2bd17e_1760942505004_0a00edf8.jpeg",
      color: "from-blue-400 to-cyan-500",
      glow: "shadow-blue-500/50",
      requiredTier: 'basic'
    },
    {
      id: 3,
      courseId: 'ai',
      title: "Les Gardiens de l'Intelligence",
      subtitle: "Saga IA",
      description: "Découvre les secrets de l'intelligence artificielle",
      age: "10-14 ans",
      duration: "8 quêtes",
      icon: <Brain className="w-6 h-6" />,
      image: "https://d64gsuwffb70l.cloudfront.net/686d05e55b5989285f2bd17e_1760942505902_46381c4a.jpeg",
      color: "from-purple-400 to-pink-500",
      glow: "shadow-purple-500/50",
      requiredTier: 'premium'
    },
    {
      id: 5,
      courseId: 'nocode',
      title: "Les Architectes du Futur",
      subtitle: "Saga No-Code",
      description: "Construis des applications sans écrire une ligne de code",
      age: "10-14 ans",
      duration: "8 quêtes",
      icon: <Wrench className="w-6 h-6" />,
      image: "https://d64gsuwffb70l.cloudfront.net/686d05e55b5989285f2bd17e_1760942506844_ff73844d.jpeg",
      color: "from-cyan-400 to-blue-500",
      glow: "shadow-cyan-500/50",
      requiredTier: 'premium'
    },
    {
      id: 6,
      courseId: 'cybersecurity',
      title: "Les Chevaliers du Pare-Feu",
      subtitle: "Saga Cybersécurité",
      description: "Protège le royaume numérique contre les menaces",
      age: "10-14 ans",
      duration: "8 quêtes",
      icon: <Lock className="w-6 h-6" />,
      image: "https://d64gsuwffb70l.cloudfront.net/686d05e55b5989285f2bd17e_1760942507760_67165431.jpeg",
      color: "from-cyan-400 to-teal-500",
      glow: "shadow-teal-500/50",
      requiredTier: 'premium'
    },
    {
      id: 8,
      courseId: 'design',
      title: "Les Artistes de la Lumière",
      subtitle: "Saga Design",
      description: "Crée des œuvres visuelles époustouflantes",
      age: "10-14 ans",
      duration: "8 quêtes",
      icon: <Palette className="w-6 h-6" />,
      image: "https://d64gsuwffb70l.cloudfront.net/686d05e55b5989285f2bd17e_1760942508660_2cfa8f74.jpeg",
      color: "from-purple-400 to-pink-500",
      glow: "shadow-purple-500/50",
      requiredTier: 'family'
    }
  ];

  const getTierLevel = (tier: string) => {
    const levels = { free: 0, basic: 1, premium: 2, family: 3 };
    return levels[tier as keyof typeof levels] || 0;
  };

  const isLocked = (courseTier: string) => {
    return getTierLevel(courseTier) > getTierLevel(subscription.tier);
  };


  return (
    <section id="parcours" className="py-20 cyber-gradient relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
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
            <Sparkles className="inline w-10 h-10 mb-2" /> SAGAS ÉPIQUES
          </h2>
          <p className="text-xl text-cyan-100 max-w-3xl mx-auto">
            Choisis ta quête et deviens un héros du numérique
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const locked = isLocked(course.requiredTier);
            return (
              <FeatureGate
                key={course.id}
                isLocked={locked}
                featureName={course.title}
                requiredTier={course.requiredTier.toUpperCase()}
                description={`Passez au plan ${course.requiredTier.toUpperCase()} pour accéder à cette saga.`}
              >
                <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl overflow-hidden group hover:scale-105 transition-all duration-300 neon-border backdrop-blur-sm">
                  <div className="relative overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute top-4 left-4 bg-gradient-to-r ${course.color} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg`}>
                      {course.age}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900 to-transparent opacity-60"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-r ${course.color} text-white rounded-xl ${course.glow} shadow-lg`}>
                        {course.icon}
                      </div>
                      <span className="text-sm text-cyan-300 font-bold bg-blue-900/50 px-3 py-1 rounded-full">{course.duration}</span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-cyan-300 mb-2" style={{fontFamily: 'Orbitron, sans-serif'}}>{course.title}</h3>
                    <p className="text-cyan-100 mb-4 text-sm">{course.description}</p>
                    
                    <button 
                      onClick={() => !locked && navigate(course.courseId === 'pixel-kingdom' ? '/pixel-kingdom' : `/saga/${course.courseId}`)}
                      className={`w-full bg-gradient-to-r ${course.color} text-white py-3 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 ${course.glow}`}
                    >
                      Commencer l'aventure
                    </button>
                  </div>
                </div>
              </FeatureGate>
            );
          })}

        </div>
      </div>
    </section>
  );
};

export default CoursesGrid;
