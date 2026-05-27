import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, Star, Sparkles, Trophy, Zap } from 'lucide-react';

interface SuccessAnimationProps {
  onComplete?: () => void;
  type?: 'lesson' | 'badge' | 'streak' | 'levelUp';
  message?: string;
  subMessage?: string;
  xpEarned?: number;
  coinsEarned?: number;
  soundEnabled?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  type: 'confetti' | 'sparkle' | 'star';
}

// Sound preference utility
const getSoundPreference = (): boolean => {
  try {
    const stored = localStorage.getItem('numerikids_sound_enabled');
    return stored !== null ? stored === 'true' : true;
  } catch {
    return true;
  }
};

export const setSoundPreference = (enabled: boolean): void => {
  try {
    localStorage.setItem('numerikids_sound_enabled', String(enabled));
  } catch {
    // Silent fail for localStorage issues
  }
};

// Check if device is in silent mode (best effort)
const canPlaySound = (): boolean => {
  // Check user preference first
  if (!getSoundPreference()) return false;
  
  // Check if audio context is available and not suspended
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const canPlay = ctx.state !== 'suspended';
      ctx.close();
      return canPlay;
    }
  } catch {
    return false;
  }
  return true;
};

// Victory sound as a simple tone
const playVictorySound = () => {
  if (!canPlaySound()) return;
  
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    
    // Create a pleasant victory chord
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const duration = 0.3;
    
    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime + index * 0.1);
      oscillator.stop(ctx.currentTime + duration + index * 0.1);
    });
    
    // Cleanup
    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Silent fail if audio context is not supported
  }
};

const COLORS = {
  confetti: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
  sparkle: ['#fbbf24', '#fcd34d', '#fde68a', '#ffffff'],
  star: ['#fbbf24', '#f59e0b', '#d97706']
};

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  onComplete,
  type = 'lesson',
  message,
  subMessage,
  xpEarned,
  coinsEarned,
  soundEnabled = true
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    
    // Confetti particles
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        color: COLORS.confetti[Math.floor(Math.random() * COLORS.confetti.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.8,
        duration: 2.5 + Math.random() * 1.5,
        type: 'confetti'
      });
    }
    
    // Sparkle particles
    for (let i = 60; i < 90; i++) {
      newParticles.push({
        id: i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        color: COLORS.sparkle[Math.floor(Math.random() * COLORS.sparkle.length)],
        size: 4 + Math.random() * 6,
        rotation: Math.random() * 360,
        delay: Math.random() * 1.5,
        duration: 0.8 + Math.random() * 0.5,
        type: 'sparkle'
      });
    }
    
    // Star particles
    for (let i = 90; i < 105; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: COLORS.star[Math.floor(Math.random() * COLORS.star.length)],
        size: 12 + Math.random() * 12,
        rotation: Math.random() * 360,
        delay: 0.2 + Math.random() * 0.8,
        duration: 1.2 + Math.random() * 0.8,
        type: 'star'
      });
    }
    
    return newParticles;
  }, []);

  useEffect(() => {
    setParticles(generateParticles());
    
    // Play sound if enabled
    if (soundEnabled) {
      playVictorySound();
    }
    
    // Show content with delay
    const contentTimer = setTimeout(() => setShowContent(true), 200);
    const rewardsTimer = setTimeout(() => setShowRewards(true), 800);
    
    // Auto-complete after animation
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 4000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(rewardsTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, soundEnabled, generateParticles]);

  const getIcon = () => {
    switch (type) {
      case 'badge':
        return <Trophy className="w-20 h-20 text-yellow-400" strokeWidth={2} />;
      case 'streak':
        return <Zap className="w-20 h-20 text-orange-400" strokeWidth={2} />;
      case 'levelUp':
        return <Star className="w-20 h-20 text-purple-400" strokeWidth={2} />;
      default:
        return <CheckCircle className="w-20 h-20 text-green-400" strokeWidth={2.5} />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'badge':
        return 'Nouveau Badge!';
      case 'streak':
        return 'Série Continue!';
      case 'levelUp':
        return 'Niveau Supérieur!';
      default:
        return 'Bravo!';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'badge':
        return 'from-yellow-500/20 via-orange-500/20 to-red-500/20';
      case 'streak':
        return 'from-orange-500/20 via-red-500/20 to-pink-500/20';
      case 'levelUp':
        return 'from-purple-500/20 via-pink-500/20 to-cyan-500/20';
      default:
        return 'from-green-500/20 via-cyan-500/20 to-blue-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* Background overlay with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} backdrop-blur-sm animate-pulse`} />
      
      {/* Confetti particles */}
      {particles.filter(p => p.type === 'confetti').map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size * 0.6}px`,
            backgroundColor: particle.color,
            borderRadius: '2px',
            transform: `rotate(${particle.rotation}deg)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
      
      {/* Sparkle particles */}
      {particles.filter(p => p.type === 'sparkle').map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-sparkle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <Sparkles 
            className="text-yellow-300" 
            style={{ 
              width: `${particle.size}px`, 
              height: `${particle.size}px`,
              filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.8))'
            }} 
          />
        </div>
      ))}
      
      {/* Star particles */}
      {particles.filter(p => p.type === 'star').map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-star-burst"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          <Star 
            className="fill-current" 
            style={{ 
              width: `${particle.size}px`, 
              height: `${particle.size}px`,
              color: particle.color,
              filter: `drop-shadow(0 0 6px ${particle.color})`
            }} 
          />
        </div>
      ))}

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-center transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          {/* Icon with glow effect */}
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 blur-2xl bg-current opacity-50 animate-pulse" />
            <div className="relative animate-bounce-slow">
              {getIcon()}
            </div>
          </div>
          
          {/* Message */}
          <h2 className="text-4xl md:text-5xl font-black text-white mb-2 drop-shadow-lg animate-scale-in">
            {message || getDefaultMessage()}
          </h2>
          
          {subMessage && (
            <p className="text-xl text-white/80 mb-4 animate-fade-in-up">
              {subMessage}
            </p>
          )}
          
          {/* Rewards display */}
          {showRewards && (xpEarned || coinsEarned) && (
            <div className="flex items-center justify-center gap-6 mt-6 animate-fade-in-up">
              {xpEarned && (
                <div className="flex items-center gap-2 bg-purple-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/50">
                  <Star className="w-6 h-6 text-purple-400 fill-purple-400" />
                  <span className="text-xl font-bold text-white">+{xpEarned} XP</span>
                </div>
              )}
              {coinsEarned && (
                <div className="flex items-center gap-2 bg-yellow-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/50">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-900">$</span>
                  </div>
                  <span className="text-xl font-bold text-white">+{coinsEarned}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ring burst effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-32 h-32 rounded-full border-4 border-white/30 animate-ring-burst" />
        <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-white/20 animate-ring-burst-delayed" />
      </div>
    </div>
  );
};

// CSS animations (add to index.css or tailwind config)
export const successAnimationStyles = `
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 1;
  }
}

@keyframes star-burst {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: scale(1.2) rotate(72deg);
    opacity: 1;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
}

@keyframes ring-burst {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes ring-burst-delayed {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  20% {
    opacity: 0;
  }
  30% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes scale-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fade-in-up {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-confetti-fall {
  animation: confetti-fall linear forwards;
}

.animate-sparkle {
  animation: sparkle ease-in-out infinite;
}

.animate-star-burst {
  animation: star-burst ease-out forwards;
}

.animate-ring-burst {
  animation: ring-burst 1s ease-out forwards;
}

.animate-ring-burst-delayed {
  animation: ring-burst-delayed 1.5s ease-out forwards;
}

.animate-bounce-slow {
  animation: bounce-slow 2s ease-in-out infinite;
}

.animate-scale-in {
  animation: scale-in 0.5s ease-out forwards;
}

.animate-fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
`;

export default SuccessAnimation;
