import { Sparkles } from 'lucide-react';

interface PixelWizardAvatarProps {
  isThinking?: boolean;
}

export function PixelWizardAvatar({ isThinking }: PixelWizardAvatarProps) {
  return (
    <div className="relative">
      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-400 shadow-lg">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1763343568075_58c501d5.webp"
          alt="Merlin le Sage"
          className="w-full h-full object-cover"
        />
      </div>
      {isThinking && (
        <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-1">
          <Sparkles className="w-3 h-3 text-white animate-pulse" />
        </div>
      )}
    </div>
  );
}
