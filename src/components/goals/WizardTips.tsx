import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Sparkles, 
  Target, 
  Coins, 
  Calendar, 
  TrendingUp,
  Flame,
  Clock,
  Rocket,
  Star,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WizardTipsProps {
  // Parent view props
  category?: string;
  ageGroup?: string;
  skillLevel?: string;
  // Child view props
  goalType?: string;
  progress?: number;
  isNearDeadline?: boolean;
  isAlmostComplete?: boolean;
}

// Parent-focused tips for goal creation
const parentTips = [
  {
    icon: Target,
    title: 'Objectifs SMART',
    description: 'Des objectifs Spécifiques, Mesurables, Atteignables, Réalistes et Temporels sont plus efficaces.',
    color: 'cyan'
  },
  {
    icon: Coins,
    title: 'Récompenses équilibrées',
    description: 'Ajustez les récompenses selon la difficulté. Trop facile = moins de pièces, plus difficile = plus de pièces.',
    color: 'yellow'
  },
  {
    icon: Calendar,
    title: 'Durée adaptée',
    description: 'Les objectifs courts (1-7 jours) maintiennent la motivation. Les objectifs longs nécessitent des étapes intermédiaires.',
    color: 'purple'
  },
  {
    icon: TrendingUp,
    title: 'Progression graduelle',
    description: 'Commencez par des objectifs faciles pour construire la confiance, puis augmentez progressivement la difficulté.',
    color: 'green'
  }
];

// Child-focused tips based on context
const getChildTips = (goalType?: string, progress?: number, isNearDeadline?: boolean, isAlmostComplete?: boolean) => {
  const tips: { icon: React.ElementType; title: string; description: string; color: string }[] = [];

  // Progress-based tips
  if (progress !== undefined) {
    if (progress < 25) {
      tips.push({
        icon: Rocket,
        title: 'C\'est parti !',
        description: 'Chaque petit pas compte. Commence par une petite session aujourd\'hui !',
        color: 'cyan'
      });
    } else if (progress < 50) {
      tips.push({
        icon: TrendingUp,
        title: 'Bien joué !',
        description: 'Tu progresses bien ! Continue sur cette lancée.',
        color: 'blue'
      });
    } else if (progress < 75) {
      tips.push({
        icon: Star,
        title: 'Plus de la moitié !',
        description: 'Tu as dépassé la moitié du chemin. Tu peux y arriver !',
        color: 'yellow'
      });
    } else if (isAlmostComplete) {
      tips.push({
        icon: Sparkles,
        title: 'Presque là !',
        description: 'Tu y es presque ! Un dernier effort et tu auras ta récompense !',
        color: 'green'
      });
    }
  }

  // Deadline-based tips
  if (isNearDeadline) {
    tips.push({
      icon: Clock,
      title: 'Attention au temps !',
      description: 'La date limite approche. Concentre-toi sur cet objectif en priorité !',
      color: 'orange'
    });
  }

  // Goal type specific tips
  if (goalType) {
    switch (goalType) {
      case 'lessons':
        tips.push({
          icon: Target,
          title: 'Conseil leçons',
          description: 'Essaie de faire au moins une leçon par jour pour progresser régulièrement.',
          color: 'cyan'
        });
        break;
      case 'xp':
        tips.push({
          icon: Zap,
          title: 'Conseil XP',
          description: 'Complète des quiz et des exercices pour gagner plus de points XP !',
          color: 'yellow'
        });
        break;
      case 'streak':
        tips.push({
          icon: Flame,
          title: 'Conseil série',
          description: 'Connecte-toi chaque jour, même juste 5 minutes, pour garder ta série !',
          color: 'orange'
        });
        break;
      case 'time':
        tips.push({
          icon: Clock,
          title: 'Conseil temps',
          description: 'Divise ton temps en petites sessions de 10-15 minutes pour rester concentré.',
          color: 'purple'
        });
        break;
    }
  }

  // Default tip if no specific tips
  if (tips.length === 0) {
    tips.push({
      icon: Sparkles,
      title: 'Tu peux le faire !',
      description: 'Chaque objectif atteint te rapproche de devenir un vrai champion du code !',
      color: 'purple'
    });
  }

  return tips;
};

const ageSpecificTips: Record<string, { title: string; description: string }[]> = {
  young: [
    { title: 'Objectifs visuels', description: 'Les jeunes enfants répondent mieux aux objectifs avec des images et des couleurs vives.' },
    { title: 'Récompenses immédiates', description: 'Préférez des objectifs courts avec des récompenses rapides pour maintenir l\'intérêt.' }
  ],
  middle: [
    { title: 'Défis progressifs', description: 'Les enfants de 8-10 ans aiment les défis qui augmentent en difficulté.' },
    { title: 'Compétition amicale', description: 'Introduisez des éléments de comparaison avec leurs propres records.' }
  ],
  older: [
    { title: 'Autonomie', description: 'Laissez-les participer au choix de leurs objectifs pour plus d\'engagement.' },
    { title: 'Objectifs à long terme', description: 'Ils peuvent gérer des objectifs plus complexes sur plusieurs semaines.' }
  ]
};

export const WizardTips: React.FC<WizardTipsProps> = ({ 
  category, 
  ageGroup, 
  skillLevel,
  goalType,
  progress,
  isNearDeadline,
  isAlmostComplete
}) => {
  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  };

  // Determine if this is parent view or child view
  const isChildView = goalType !== undefined || progress !== undefined;
  
  const tips = isChildView 
    ? getChildTips(goalType, progress, isNearDeadline, isAlmostComplete)
    : parentTips;

  const ageTips = !isChildView && ageGroup && ageGroup !== 'all' ? ageSpecificTips[ageGroup] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className={`p-2 rounded-lg ${isChildView ? 'bg-purple-500/20' : 'bg-amber-500/20'}`}>
          <Lightbulb className={`w-5 h-5 ${isChildView ? 'text-purple-400' : 'text-amber-400'}`} />
        </div>
        <h3 className="text-lg font-semibold text-white">
          {isChildView ? 'Conseils du Pixel Wizard' : 'Conseils pour créer de bons objectifs'}
        </h3>
      </div>

      <div className={`grid grid-cols-1 ${isChildView ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-3`}>
        {tips.map((tip, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`bg-slate-900/50 border ${colorClasses[tip.color].split(' ')[2]}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses[tip.color].split(' ').slice(0, 2).join(' ')}`}>
                    <tip.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white text-sm">{tip.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{tip.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Age-specific tips for parent view */}
      {!isChildView && ageTips.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h4 className="text-sm font-medium text-purple-400">
              Conseils pour les {ageGroup === 'young' ? '5-7 ans' : ageGroup === 'middle' ? '8-10 ans' : '11-13 ans'}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ageTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-purple-500/10 border-purple-500/20">
                  <CardContent className="p-3">
                    <h5 className="font-medium text-white text-sm">{tip.title}</h5>
                    <p className="text-xs text-slate-400 mt-1">{tip.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational message for child view */}
      {isChildView && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-xl border border-purple-500/20"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              🧙‍♂️
            </motion.div>
            <div>
              <p className="text-white font-medium">Le Pixel Wizard croit en toi !</p>
              <p className="text-sm text-purple-300">
                {progress !== undefined && progress >= 75 
                  ? "Tu es sur le point de réussir. Continue !" 
                  : "Chaque ligne de code te rend plus fort !"}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WizardTips;
