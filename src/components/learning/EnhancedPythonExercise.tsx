import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, RotateCcw, Lightbulb, Terminal, Sparkles, Loader2, Bug, Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { AICodingAssistant } from './AICodingAssistant';
import { PythonDebuggerPanel } from './PythonDebuggerPanel';
import { MemoryVisualization } from './MemoryVisualization';
import { SuccessAnimation } from './SuccessAnimation';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { executePythonCode, initializePyodide, isPyodideLoaded } from '../../utils/pythonExecutor';
import { PythonDebugger } from '../../utils/pythonDebugger';

// Sound effects
const playSound = (type: 'pop' | 'success' | 'error') => {
  const audio = new Audio();
  if (type === 'pop') audio.src = 'data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA=';
  else if (type === 'success') audio.src = 'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YVYAAAA=';
  else audio.src = 'data:audio/wav;base64,UklGRhwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQA=';
  audio.play().catch(() => {});
};

interface EnhancedPythonExerciseProps {
  starterCode: string;
  onComplete: (score: number) => void;
  challenge: string;
  expectedOutput?: string;
  validationPattern?: string; // Regex pattern pour validation avancée
  hints?: string[];
  lessonTitle: string;
  questId?: number;
  isPixelKingdom?: boolean;
}


const EnhancedPythonExercise: React.FC<EnhancedPythonExerciseProps> = ({ 
  starterCode, 
  onComplete, 
  challenge,
  expectedOutput = '',
  validationPattern,
  hints = [],
  lessonTitle,
  questId,
  isPixelKingdom
}) => {
  const { hasFeatureAccess } = useSubscription();
  const hasAIAssistant = hasFeatureAccess('ai_assistant');

  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [testsPassed, setTestsPassed] = useState(0);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);


  useEffect(() => {
    const loadPyodide = async () => {
      try {
        await initializePyodide();
        setPyodideLoading(false);
      } catch (error) {
        console.error('Failed to load Pyodide:', error);
        setOutput('Erreur: Impossible de charger Python. Rechargez la page.');
        setPyodideLoading(false);
      }
    };
    
    if (!isPyodideLoaded()) {
      loadPyodide();
    } else {
      setPyodideLoading(false);
    }
  }, []);

  const validateOutput = (output: string): { passed: number; message: string; isSuccess: boolean } => {
    // Nettoyer la sortie (enlever les espaces superflus)
    const cleanOutput = output.trim();
    
    // Test 1: Syntaxe correcte (pas d'erreur)
    let passed = 1;
    let message = '';
    let isSuccess = false;
    
    // Test 2: Validation de la sortie
    if (validationPattern) {
      // Utiliser un pattern regex si fourni
      try {
        const regex = new RegExp(validationPattern, 'i');
        if (regex.test(cleanOutput)) {
          passed = 2;
          message = '✓ La sortie correspond au pattern attendu!';
        } else {
          message = '✗ La sortie ne correspond pas au pattern attendu.';
        }
      } catch (e) {
        message = '✗ Pattern de validation invalide.';
      }
    } else if (expectedOutput) {
      // Vérifier si la sortie contient la chaîne attendue
      if (cleanOutput.includes(expectedOutput.trim())) {
        passed = 2;
        message = `✓ Bravo! La sortie contient "${expectedOutput}"`;
        isSuccess = true;
      } else {
        message = `✗ La sortie devrait contenir: "${expectedOutput}"`;
      }
    } else {
      // Pas de validation spécifique, juste vérifier qu'il y a une sortie
      if (cleanOutput.length > 0) {
        passed = 2;
        message = '✓ Le programme produit une sortie.';
      } else {
        message = '✗ Le programme ne produit aucune sortie.';
      }
    }
    
    // Test 3: Bonnes pratiques (code bien structuré)
    if (passed >= 2) {
      if (code.length > 20 && !code.includes('TODO')) {
        passed = 3;
        message += '\n✓ Code bien structuré!';
      }
    }
    
    return { passed, message, isSuccess };
  };

  const runCode = async () => {
    playSound('pop');
    setIsRunning(true);
    setOutput('>>> Exécution du programme...\n');
    
    try {
      const result = await executePythonCode(code);
      
      if (result.error) {
        playSound('error');
        const errorMsg = `>>> Erreur:\n${result.error}\n\nTu y es presque ! Essaie encore.\nTemps d'exécution: ${result.executionTime.toFixed(2)}ms`;
        setOutput(errorMsg);
        setTestsPassed(0);
      } else {
        const validation = validateOutput(result.output);
        setTestsPassed(validation.passed);
        
        let outputMessage = `${result.output}\n\n${validation.message}\n\n${validation.passed}/3 tests réussis\nTemps d'exécution: ${result.executionTime.toFixed(2)}ms`;
        
        if (validation.isSuccess) {
          playSound('success');
          outputMessage += '\n\n🎉 GAGNÉ! Exercice réussi!';
          setShowSuccess(true);
          setTimeout(() => onComplete(validation.passed * 33), 3000);
        } else if (validation.passed < 2) {
          playSound('error');
          outputMessage += '\n\nTu y es presque ! Essaie encore.';
        } else {
          playSound('pop');
        }
        
        setOutput(outputMessage);
      }
    } catch (error: any) {
      playSound('error');
      setOutput(`>>> Erreur système:\n${error.message}\n\nTu y es presque ! Essaie encore.`);
      setTestsPassed(0);
    } finally {
      setIsRunning(false);
    }
  };




  const resetCode = () => {
    setCode(starterCode);
    setOutput('');
    setTestsPassed(0);
  };

  const showNextHint = () => {
    if (currentHint < hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  const handleAIAssistantClick = () => {
    if (hasAIAssistant) {
      setShowAIAssistant(!showAIAssistant);
    } else {
      setShowUpgradePrompt(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Exercice: {lessonTitle}
            </h4>
            <p className="text-slate-300">{challenge}</p>
          </div>
          <div className="relative">
            <button
              onClick={handleAIAssistantClick}
              className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg ${
                hasAIAssistant
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                  : 'bg-gray-600 text-gray-300 cursor-not-allowed'
              }`}
            >
              {hasAIAssistant ? <Sparkles className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              Assistant IA
              {!hasAIAssistant && <span className="ml-1 text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded">Premium</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-cyan-400">💻 Éditeur Python</h3>
          <button onClick={resetCode} className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-sm">
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>

        
        <div className="relative rounded-lg overflow-hidden border-2 border-cyan-500/30">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#0d0d0d] border-r border-cyan-500/30 flex flex-col items-center pt-4 text-slate-500 text-xs font-mono z-10">
            {code.split('\n').map((_, i) => <div key={i} className="leading-6 h-6">{i + 1}</div>)}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 bg-[#1e1e1e] text-green-400 font-mono text-sm p-4 pl-16 focus:outline-none resize-none"
            placeholder="# Écris ton code Python ici..."
            spellCheck={false}
            style={{ lineHeight: '1.5rem' }}
          />
        </div>
        
        <button 
          onClick={runCode} 
          disabled={isRunning || pyodideLoading} 
          className="w-full bg-gradient-to-r from-green-500 via-cyan-500 to-green-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:via-cyan-600 hover:to-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-green-500/30"
        >
          {pyodideLoading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Chargement de Python...
            </>
          ) : isRunning ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Exécution en cours...
            </>
          ) : (
            <>
              <Play className="w-6 h-6" />
              ▶️ Exécuter
            </>
          )}
        </button>
        
        {hints.length > 0 && (
          <div className="space-y-2">
            <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors">
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm font-semibold">{showHints ? 'Masquer' : 'Voir'} les indices ({currentHint + 1}/{hints.length})</span>
            </button>
            {showHints && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 space-y-2">
                <p className="text-yellow-200 text-sm">{hints[currentHint]}</p>
                {currentHint < hints.length - 1 && (
                  <button onClick={showNextHint} className="text-yellow-400 text-xs hover:text-yellow-300">
                    Indice suivant →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-bold text-green-400">📟 Console</h3>
          <div className="bg-[#1e1e1e] text-green-400 font-mono text-sm p-4 rounded-lg border-2 border-green-500/30 min-h-[200px] max-h-[300px] overflow-y-auto">
            {output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <p className="text-slate-500">La sortie de ton programme apparaîtra ici...</p>
            )}
          </div>
        </div>

        <button 
          onClick={() => onComplete(testsPassed * 33)} 
          disabled={testsPassed < 2}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CheckCircle className="w-5 h-5" />
          Valider l'exercice
        </button>

        {testsPassed > 0 && (
          <div className="bg-slate-800/50 border border-cyan-500/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Tests automatiques</h4>
            <div className="space-y-1">
              <div className={`flex items-center gap-2 text-sm ${testsPassed >= 1 ? 'text-green-400' : 'text-slate-500'}`}>
                {testsPassed >= 1 ? '✓' : '○'} Syntaxe correcte
              </div>
              <div className={`flex items-center gap-2 text-sm ${testsPassed >= 2 ? 'text-green-400' : 'text-slate-500'}`}>
                {testsPassed >= 2 ? '✓' : '○'} Code fonctionnel
              </div>
              <div className={`flex items-center gap-2 text-sm ${testsPassed >= 3 ? 'text-green-400' : 'text-slate-500'}`}>
                {testsPassed >= 3 ? '✓' : '○'} Bonnes pratiques
              </div>
            </div>
          </div>
        )}
      </div>

      {showSuccess && <SuccessAnimation onComplete={() => setShowSuccess(false)} />}

      {hasAIAssistant && (
        <AICodingAssistant
          lessonContext={{
            title: lessonTitle,
            description: challenge,
            questId: questId,
            isPixelKingdom: isPixelKingdom
          }}
          exerciseType="python"
          currentCode={code}
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        featureName="Assistant IA de Codage"
        featureDescription="Obtenez de l'aide en temps réel avec des suggestions de code, du débogage et des explications pendant vos exercices Python."
      />
    </div>
  );
};

export default EnhancedPythonExercise;
