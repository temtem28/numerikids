import React, { useState } from 'react';
import { CheckCircle, Play, RotateCcw, Sparkles } from 'lucide-react';
import { AICodingAssistant } from './AICodingAssistant';

// Sound effects
const playSound = (type: 'pop' | 'success' | 'error') => {
  const audio = new Audio();
  if (type === 'pop') audio.src = 'data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA=';
  else if (type === 'success') audio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVYAAAA=';
  else audio.src = 'data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA=';
  audio.play().catch(() => {});
};

interface Block {
  id: string;
  label: string;
  color: string;
  category: string;
}

interface EnhancedScratchExerciseProps {
  onComplete: (score: number) => void;
  challenge: string;
  requiredBlocks?: string[];
  lessonTitle: string;
}


const EnhancedScratchExercise: React.FC<EnhancedScratchExerciseProps> = ({ 
  onComplete, 
  challenge, 
  requiredBlocks = [],
  lessonTitle 
}) => {
  const [workspace, setWorkspace] = useState<Block[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [spritePosition, setSpritePosition] = useState({ x: 50, y: 50 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  
  const availableBlocks: Block[] = [
    { id: 'move', label: 'Avancer de 10 pas', color: 'bg-blue-500', category: 'Mouvement' },
    { id: 'turn-right', label: 'Tourner à droite 90°', color: 'bg-blue-600', category: 'Mouvement' },
    { id: 'turn-left', label: 'Tourner à gauche 90°', color: 'bg-blue-600', category: 'Mouvement' },
    { id: 'repeat', label: 'Répéter 4 fois', color: 'bg-green-500', category: 'Contrôle' },
    { id: 'say', label: 'Dire "Bonjour!"', color: 'bg-purple-500', category: 'Apparence' },
    { id: 'wait', label: 'Attendre 1 seconde', color: 'bg-green-600', category: 'Contrôle' },
    { id: 'change-color', label: 'Changer de couleur', color: 'bg-purple-600', category: 'Apparence' },
    { id: 'play-sound', label: 'Jouer un son', color: 'bg-pink-500', category: 'Son' },
  ];

  const addBlock = (block: Block) => {
    playSound('pop');
    setWorkspace([...workspace, { ...block, id: `${block.id}-${Date.now()}` }]);
  };

  const removeBlock = (index: number) => {
    playSound('pop');
    setWorkspace(workspace.filter((_, i) => i !== index));
  };

  const resetWorkspace = () => {
    playSound('pop');
    setWorkspace([]);
    setSpritePosition({ x: 50, y: 50 });
    setShowSuccess(false);
  };

  const runCode = () => {
    playSound('pop');
    setIsRunning(true);
    let newX = spritePosition.x;
    let newY = spritePosition.y;
    
    workspace.forEach((block, index) => {
      setTimeout(() => {
        if (block.id.includes('move')) {
          newX += 20;
          setSpritePosition({ x: newX, y: newY });
        } else if (block.id.includes('turn')) {
          newY += 15;
          setSpritePosition({ x: newX, y: newY });
        }
      }, index * 500);
    });

    setTimeout(() => {
      setIsRunning(false);
      if (workspace.length >= 3) {
        playSound('success');
        setShowSuccess(true);
        setTimeout(() => onComplete(100), 1500);
      } else {
        playSound('error');
      }
    }, workspace.length * 500 + 500);
  };


  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2 text-sm md:text-base">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
              Défi: {lessonTitle}
            </h4>
            <p className="text-slate-300 text-xs md:text-sm">{challenge}</p>
          </div>
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 md:px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-2 shadow-lg text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Assistant IA
          </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-bold text-cyan-400">🧩 Blocs disponibles</h3>
          <div className="space-y-2 max-h-60 md:max-h-96 overflow-y-auto pr-2">
            {availableBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => addBlock(block)}
                className={`w-full ${block.color} text-white p-2 md:p-3 rounded-lg text-xs md:text-sm font-medium hover:opacity-80 transition-all hover:scale-105 shadow-lg`}
              >
                {block.label}
              </button>
            ))}
          </div>
        </div>


        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-bold text-purple-400">⚡ Zone de code</h3>
            <button onClick={resetWorkspace} className="text-slate-400 hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-slate-800/50 border-2 border-dashed border-purple-500/30 rounded-lg p-3 md:p-4 min-h-[250px] md:min-h-[300px]">
            {workspace.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <p className="text-slate-400 mb-2 text-sm md:text-base">Clique sur les blocs</p>
                <p className="text-slate-500 text-xs md:text-sm">pour construire ton programme</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workspace.map((block, index) => (
                  <div key={block.id} className={`${block.color} text-white p-2 md:p-3 rounded-lg text-xs md:text-sm flex justify-between items-center shadow-md animate-in slide-in-from-top`}>
                    <span className="font-medium">{block.label}</span>
                    <button onClick={() => removeBlock(index)} className="text-white/70 hover:text-white hover:bg-white/20 rounded px-2 transition-all">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={runCode} disabled={isRunning || workspace.length === 0} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 md:py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">
            <Play className="w-4 h-4 md:w-5 md:h-5" />
            {isRunning ? 'En cours...' : 'Exécuter'}
          </button>
        </div>


        <div className="space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-bold text-pink-400">🎭 Scène</h3>
          <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-lg aspect-square relative overflow-hidden border-2 md:border-4 border-slate-700">
            <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-yellow-300 rounded-full w-8 h-8 md:w-12 md:h-12"></div>
            <div className="absolute bottom-0 left-0 right-0 h-12 md:h-20 bg-green-600"></div>
            <div 
              className={`absolute w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-full flex items-center justify-center text-xl md:text-2xl transition-all duration-500 ${isRunning ? 'animate-pulse' : ''}`}
              style={{ left: `${spritePosition.x}%`, top: `${spritePosition.y}%` }}
            >
              🐱
            </div>
            {showSuccess && (
              <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                <div className="text-4xl md:text-6xl animate-bounce">🎉</div>
              </div>
            )}
          </div>
        </div>
      </div>


      <AICodingAssistant
        lessonContext={{
          title: lessonTitle,
          description: challenge
        }}
        exerciseType="scratch"
        currentCode={workspace.map(b => b.label).join('\n')}
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </div>
  );
};

export default EnhancedScratchExercise;
