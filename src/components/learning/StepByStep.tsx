import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronRight, Lightbulb } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  hint?: string;
}

interface StepByStepProps {
  steps: Step[];
  title: string;
}

const StepByStep: React.FC<StepByStepProps> = ({ steps, title }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);

  const completeStep = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowHint(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
        📝 {title}
      </h3>
      
      <div className="flex gap-2 mb-6">
        {steps.map((_, index) => (
          <div key={index} className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
            <div className={`h-full transition-all ${completedSteps.includes(index) ? 'bg-green-500' : index === currentStep ? 'bg-cyan-500 w-1/2' : 'w-0'}`} />
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border-2 border-purple-500/30">
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${completedSteps.includes(currentStep) ? 'bg-green-500' : 'bg-cyan-500'}`}>
            {completedSteps.includes(currentStep) ? <CheckCircle className="w-6 h-6 text-white" /> : <span className="text-white font-bold">{currentStep + 1}</span>}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white mb-2">{steps[currentStep].title}</h4>
            <p className="text-slate-300 leading-relaxed">{steps[currentStep].description}</p>
          </div>
        </div>

        {steps[currentStep].hint && (
          <div className="mt-4">
            <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors">
              <Lightbulb className="w-4 h-4" />
              <span className="text-sm font-semibold">{showHint ? 'Masquer' : 'Voir'} l'indice</span>
            </button>
            {showHint && (
              <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-200 text-sm">{steps[currentStep].hint}</p>
              </div>
            )}
          </div>
        )}

        <button onClick={completeStep} className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2">
          {currentStep < steps.length - 1 ? (
            <>Étape suivante <ChevronRight className="w-5 h-5" /></>
          ) : (
            <>Terminer <CheckCircle className="w-5 h-5" /></>
          )}
        </button>
      </div>

      <div className="flex gap-2">
        {steps.map((step, index) => (
          <button key={index} onClick={() => setCurrentStep(index)} className={`flex-1 p-3 rounded-lg text-left transition-all ${index === currentStep ? 'bg-purple-500/20 border-2 border-purple-400' : completedSteps.includes(index) ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800/30 border border-slate-700'}`}>
            <div className="flex items-center gap-2">
              {completedSteps.includes(index) ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Circle className="w-4 h-4 text-slate-500" />}
              <span className="text-xs text-white font-medium truncate">{step.title}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepByStep;
