import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface BadgeUnlockAnimationProps {
  badge: {
    name: string;
    description: string;
    badge_icon: string;
    xp_reward: number;
    rarity: string;
  } | null;
  onClose: () => void;
}

export function BadgeUnlockAnimation({ badge, onClose }: BadgeUnlockAnimationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (badge) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [badge, onClose]);

  if (!badge) return null;

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-yellow-600'
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-md">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`text-8xl mb-4 bg-gradient-to-br ${rarityColors[badge.rarity as keyof typeof rarityColors]} bg-clip-text text-transparent`}
          >
            {badge.badge_icon}
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Achievement Unlocked!</h2>
          <h3 className="text-2xl font-semibold text-primary mb-2">{badge.name}</h3>
          <p className="text-muted-foreground mb-4">{badge.description}</p>
          <div className="text-xl font-bold text-yellow-500">+{badge.xp_reward} XP</div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
