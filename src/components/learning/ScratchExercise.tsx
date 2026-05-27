import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface Block {
  id: string;
  label: string;
  color: string;
}

const ScratchExercise: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [workspace, setWorkspace] = useState<Block[]>([]);
  
  const availableBlocks: Block[] = [
    { id: '1', label: 'Avancer de 10 pas', color: 'bg-blue-500' },
    { id: '2', label: 'Tourner à droite 90°', color: 'bg-purple-500' },
    { id: '3', label: 'Répéter 4 fois', color: 'bg-green-500' },
    { id: '4', label: 'Dire "Bonjour!"', color: 'bg-pink-500' },
  ];

  const addBlock = (block: Block) => {
    setWorkspace([...workspace, { ...block, id: `${block.id}-${Date.now()}` }]);
  };

  const removeBlock = (index: number) => {
    setWorkspace(workspace.filter((_, i) => i !== index));
  };

  const runCode = () => {
    if (workspace.length >= 2) {
      onComplete(100);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-cyan-400">Blocs disponibles</h3>
        <div className="space-y-2">
          {availableBlocks.map((block) => (
            <button
              key={block.id}
              onClick={() => addBlock(block)}
              className={`w-full ${block.color} text-white p-3 rounded-lg text-sm font-medium hover:opacity-80 transition-opacity`}
            >
              {block.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-purple-400">Zone de construction</h3>
        <div className="bg-slate-800/50 border-2 border-cyan-500/30 rounded-lg p-4 min-h-[200px]">
          {workspace.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Glisse tes blocs ici</p>
          ) : (
            <div className="space-y-2">
              {workspace.map((block, index) => (
                <div key={block.id} className={`${block.color} text-white p-2 rounded text-sm flex justify-between items-center`}>
                  <span>{block.label}</span>
                  <button onClick={() => removeBlock(index)} className="text-white/70 hover:text-white">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={runCode} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Exécuter le code
        </button>
      </div>
    </div>
  );
};

export default ScratchExercise;
