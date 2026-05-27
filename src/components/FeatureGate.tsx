import React, { useState } from 'react';
import { Lock, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UpgradePrompt } from './UpgradePrompt';

interface FeatureGateProps {
  isLocked: boolean;
  featureName: string;
  requiredTier: string;
  children: React.ReactNode;
  showBadge?: boolean;
  onClick?: () => void;
  description?: string;
}

export function FeatureGate({ 
  isLocked, 
  featureName, 
  requiredTier, 
  children, 
  showBadge = true,
  onClick,
  description 
}: FeatureGateProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      setShowUpgrade(true);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <>
      <div 
        className={`relative ${isLocked ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
            <div className="text-center">
              <Lock className="w-12 h-12 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Fonctionnalité verrouillée</p>
              <p className="text-slate-300 text-sm">Cliquez pour débloquer</p>
            </div>
          </div>
        )}
        {showBadge && isLocked && (
          <Badge className="absolute top-2 right-2 z-20 bg-gradient-to-r from-amber-500 to-orange-600">
            <Crown className="w-3 h-3 mr-1" />
            {requiredTier}
          </Badge>
        )}
        <div className={isLocked ? 'pointer-events-none' : ''}>
          {children}
        </div>
      </div>

      <UpgradePrompt
        open={showUpgrade}
        onOpenChange={setShowUpgrade}
        featureName={featureName}
        requiredTier={requiredTier}
        description={description}
      />
    </>
  );
}
