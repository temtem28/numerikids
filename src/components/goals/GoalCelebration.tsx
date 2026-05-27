import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, Coins, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoalCelebrationProps {
  isVisible: boolean;
  goalTitle: string;
  rewardCoins: number;
  onClose: () => void;
}

const Confetti = ({ delay }: { delay: number }) => {
  const colors = ['#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomX = Math.random() * 100;
  const randomRotation = Math.random() * 360;
  const randomSize = 8 + Math.random() * 8;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${randomX}%`,
        top: '-20px',
        width: randomSize,
        height: randomSize,
        backgroundColor: randomColor,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{
        y: window.innerHeight + 50,
        rotate: randomRotation + 720,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: 'easeOut',
      }}
    />
  );
};

const FloatingStar = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute"
    style={{ left: `${x}%`, bottom: '20%' }}
    initial={{ y: 0, opacity: 0, scale: 0 }}
    animate={{
      y: -200,
      opacity: [0, 1, 1, 0],
      scale: [0, 1.5, 1, 0.5],
    }}
    transition={{
      duration: 2,
      delay: delay,
      ease: 'easeOut',
    }}
  >
    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
  </motion.div>
);

export const GoalCelebration: React.FC<GoalCelebrationProps> = ({
  isVisible,
  goalTitle,
  rewardCoins,
  onClose,
}) => {
  const [confettiPieces, setConfettiPieces] = useState<number[]>([]);
  const [stars, setStars] = useState<{ delay: number; x: number }[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate confetti
      setConfettiPieces(Array.from({ length: 50 }, (_, i) => i * 0.05));
      // Generate floating stars
      setStars([
        { delay: 0.2, x: 20 },
        { delay: 0.4, x: 40 },
        { delay: 0.3, x: 60 },
        { delay: 0.5, x: 80 },
        { delay: 0.6, x: 30 },
        { delay: 0.7, x: 70 },
      ]);

      // Play celebration sound if enabled
      const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
      if (soundEnabled) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const playNote = (freq: number, time: number) => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, audioContext.currentTime + time);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.3);
            osc.start(audioContext.currentTime + time);
            osc.stop(audioContext.currentTime + time + 0.3);
          };
          // Victory fanfare
          playNote(523.25, 0); // C
          playNote(659.25, 0.15); // E
          playNote(783.99, 0.3); // G
          playNote(1046.50, 0.45); // High C
        } catch (e) {
          // Audio not available
        }
      }
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiPieces.map((delay, i) => (
              <Confetti key={i} delay={delay} />
            ))}
            {stars.map((star, i) => (
              <FloatingStar key={`star-${i}`} delay={star.delay} x={star.x} />
            ))}
          </div>

          {/* Main celebration card */}
          <motion.div
            className="relative bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 border-2 border-yellow-500/50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 10 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl" />

            {/* Content */}
            <div className="relative text-center space-y-6">
              {/* Trophy icon with animation */}
              <motion.div
                className="relative inline-block"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="relative">
                  <Trophy className="w-24 h-24 text-yellow-400 mx-auto" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2" />
                    <Sparkles className="w-6 h-6 text-purple-400 absolute -bottom-1 -left-2" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Celebration text */}
              <div className="space-y-2">
                <motion.div
                  className="flex items-center justify-center gap-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <PartyPopper className="w-6 h-6 text-pink-400" />
                  <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Objectif Atteint !
                  </h2>
                  <PartyPopper className="w-6 h-6 text-pink-400 scale-x-[-1]" />
                </motion.div>

                <motion.p
                  className="text-lg text-slate-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {goalTitle}
                </motion.p>
              </div>

              {/* Reward display */}
              <motion.div
                className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <Coins className="w-10 h-10 text-yellow-400" />
                  </motion.div>
                  <div className="text-left">
                    <p className="text-sm text-yellow-300/80">Récompense gagnée</p>
                    <p className="text-3xl font-black text-yellow-400">+{rewardCoins} pièces</p>
                  </div>
                </div>
              </motion.div>

              {/* Continue button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-6 text-lg rounded-xl shadow-lg shadow-yellow-500/25"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Continuer l'aventure !
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalCelebration;
