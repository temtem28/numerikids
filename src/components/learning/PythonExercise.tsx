import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { CodeEditorWithDebugger } from './CodeEditorWithDebugger';
import { SuccessAnimation } from './SuccessAnimation';
import { executePythonCode, initializePyodide, isPyodideLoaded } from '../../utils/pythonExecutor';


interface PythonExerciseProps {
  starterCode: string;
  onComplete: (score: number) => void;
  expectedOutput?: string;
  validationPattern?: string;
  challenge?: string;
}


const PythonExercise: React.FC<PythonExerciseProps> = ({ 
  starterCode, 
  onComplete, 
  expectedOutput = '',
  validationPattern,
  challenge
}) => {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(true);
  const [testsPassed, setTestsPassed] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);


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
    const cleanOutput = output.trim();
    let passed = 1;
    let message = '';
    let isSuccess = false;
    
    if (validationPattern) {
      try {
        const regex = new RegExp(validationPattern, 'i');
        if (regex.test(cleanOutput)) {
          passed = 2;
          message = '✓ La sortie correspond au pattern attendu!';
          isSuccess = true;
        } else {
          message = '✗ La sortie ne correspond pas au pattern attendu.';
        }
      } catch (e) {
        message = '✗ Pattern de validation invalide.';
      }
    } else if (expectedOutput) {
      if (cleanOutput.includes(expectedOutput.trim())) {
        passed = 2;
        message = `✓ Bravo! La sortie contient "${expectedOutput}"`;
        isSuccess = true;
      } else {
        message = `✗ La sortie devrait contenir: "${expectedOutput}"`;
      }
    } else {
      if (cleanOutput.length > 0) {
        passed = 2;
        message = '✓ Le programme produit une sortie.';
      }
    }
    
    return { passed, message, isSuccess };
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('>>> Exécution du programme...\n');
    
    try {
      const result = await executePythonCode(code);
      
      if (result.error) {
        setOutput(`>>> Erreur:\n${result.error}\n\nTu y es presque ! Essaie encore.\nTemps: ${result.executionTime.toFixed(2)}ms`);
        setTestsPassed(0);
      } else {
        const validation = validateOutput(result.output);
        setTestsPassed(validation.passed);
        
        let outputMessage = `${result.output}\n\n${validation.message}\nTemps: ${result.executionTime.toFixed(2)}ms`;
        
        if (validation.isSuccess) {
          outputMessage += '\n\n🎉 GAGNÉ! Exercice réussi!';
          setShowSuccess(true);
          setTimeout(() => onComplete(100), 3000);
        } else if (validation.passed < 2) {
          outputMessage += '\n\nTu y es presque ! Essaie encore.';
        }
        
        setOutput(outputMessage);
      }
    } catch (error: any) {
      setOutput(`>>> Erreur système:\n${error.message}\n\nTu y es presque ! Essaie encore.`);
      setTestsPassed(0);
    } finally {
      setIsRunning(false);
    }
  };



  return (
    <div className="space-y-4">
      <CodeEditorWithDebugger
        code={code}
        onChange={setCode}
        onRun={runCode}
        isRunning={isRunning}
        disabled={pyodideLoading}
      />

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-green-400">📟 Console</h3>
        <div className="bg-[#1e1e1e] text-green-400 font-mono text-sm p-4 rounded-lg border-2 border-green-500/30 min-h-[150px] max-h-[300px] overflow-y-auto">
          {output ? (
            <pre className="whitespace-pre-wrap">{output}</pre>
          ) : (
            <p className="text-slate-500">La sortie de ton programme apparaîtra ici...</p>
          )}
        </div>
      </div>

      {showSuccess && <SuccessAnimation onComplete={() => setShowSuccess(false)} />}

      <button 
        onClick={() => onComplete(100)} 
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-5 h-5" />
        Valider l'exercice
      </button>
    </div>

  );
};

export default PythonExercise;
