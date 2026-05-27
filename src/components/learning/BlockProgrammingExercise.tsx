import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUp, RotateCw, Lightbulb, Trash2 } from 'lucide-react';

interface Block {
  id: string;
  type: string;
  icon: any;
  label: string;
}

const AVAILABLE_BLOCKS: Block[] = [
  { id: 'forward', type: 'forward', icon: ArrowUp, label: 'Avancer' },
  { id: 'turn', type: 'turn', icon: RotateCw, label: 'Tourner' },
  { id: 'light', type: 'light', icon: Lightbulb, label: 'Allumer' },
];

interface Props {
  solutionSequence: string[];
  onComplete: (score: number) => void;
}

export default function BlockProgrammingExercise({ solutionSequence, onComplete }: Props) {
  const [program, setProgram] = useState<Block[]>([]);
  const [executing, setExecuting] = useState(-1);
  const [message, setMessage] = useState('');
  const popSound = useRef<HTMLAudioElement | null>(null);
  const successSound = useRef<HTMLAudioElement | null>(null);
  const errorSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    popSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGm98OScTgwOUKnl8bllHAU2jdXzzn0vBSh+zPLaizsKElyw6OyrWBUIQ5zd8sFuJAUuhM/y2Ik2CBdqvvDjm08NEE6n5fK8aB0FNIzU8tGAMQYnfsvx3I4+CxFYr+ftrVwWCECZ3PLEcSYELIHO8tmJNggYar7w45xPDQ9Nqebxu2kdBTOM1PLRgDEGKH7M8dyOPgsRWK/n7a1cFghAmdzyx');
    successSound.current = new Audio('data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0Yb4AAAA=');
    errorSound.current = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=');
  }, []);


  const handleDragStart = (e: React.DragEvent, block: Block) => {
    e.dataTransfer.setData('block', JSON.stringify(block));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockData = e.dataTransfer.getData('block');
    if (blockData) {
      const block = JSON.parse(blockData);
      setProgram([...program, { ...block, id: `${block.type}-${Date.now()}` }]);
      popSound.current?.play().catch(() => {});
    }
  };


  const testSequence = async () => {
    const sequence = program.map(b => b.type);
    setMessage('');
    
    for (let i = 0; i < program.length; i++) {
      setExecuting(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setExecuting(-1);

    if (JSON.stringify(sequence) === JSON.stringify(solutionSequence)) {
      successSound.current?.play().catch(() => {});
      setMessage('🎉 GAGNÉ! Séquence correcte!');
      setTimeout(() => onComplete(100), 2000);
    } else {
      errorSound.current?.play().catch(() => {});
      setMessage('Tu y es presque ! Essaie encore.');
    }
  };


  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-4 min-h-[500px]">

      <Card className="p-4">
        <h3 className="font-bold mb-4">Boîte à outils</h3>
        <div className="space-y-2">
          {AVAILABLE_BLOCKS.map(block => {
            const Icon = block.icon;
            return (
              <div
                key={block.id}
                draggable
                onDragStart={(e) => handleDragStart(e, block)}
                className="p-3 bg-blue-500 text-white rounded-lg cursor-move hover:bg-blue-600 transition flex items-center gap-2"
              >
                <Icon className="w-5 h-5" />
                <span>{block.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-bold mb-4">Programme</h3>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="min-h-[300px] border-2 border-dashed rounded-lg p-4 space-y-2"
        >
          {program.map((block, idx) => {
            const Icon = block.icon;
            return (
              <div
                key={block.id}
                className={`p-3 bg-green-500 text-white rounded-lg flex items-center gap-2 transition ${
                  executing === idx ? 'ring-4 ring-yellow-400 scale-105' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{block.label}</span>
                <button onClick={() => setProgram(program.filter((_, i) => i !== idx))} className="ml-auto">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-2">
          <Button onClick={testSequence} disabled={program.length === 0} className="w-full">
            Tester
          </Button>
          {message && <p className="text-center font-bold">{message}</p>}
        </div>
      </Card>
    </div>
  );
}
