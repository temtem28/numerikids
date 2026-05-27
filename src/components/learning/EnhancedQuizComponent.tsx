import React, { useState } from 'react';
import { CheckCircle, XCircle, Award, ArrowRight } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface EnhancedQuizComponentProps {
  onComplete: (score: number) => void;
  questions: Question[];
  quizTitle: string;
}

const EnhancedQuizComponent: React.FC<EnhancedQuizComponentProps> = ({ 
  onComplete, 
  questions,
  quizTitle 
}) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const selectAnswer = (index: number) => {
    if (!showFeedback) {
      setSelectedAnswer(index);
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer !== null) {
      setShowFeedback(true);
      const newAnswers = [...answers];
      newAnswers[currentQ] = selectedAnswer;
      setAnswers(newAnswers);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      const score = Math.round((answers.filter((a, i) => a === questions[i].correct).length / questions.length) * 100);
      setShowResults(true);
      onComplete(score);
    }
  };

  if (showResults) {
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    const percentage = Math.round((correct / questions.length) * 100);
    
    return (
      <div className="text-center space-y-6 py-8">
        <div className="text-8xl animate-bounce">
          {percentage >= 80 ? '🏆' : percentage >= 60 ? '🎉' : '💪'}
        </div>
        <h3 className="text-3xl font-bold text-cyan-400">Quiz terminé!</h3>
        <div className="bg-slate-800/50 border-2 border-cyan-500/30 rounded-xl p-8 max-w-md mx-auto">
          <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
            {percentage}%
          </div>
          <p className="text-xl text-slate-300 mb-6">
            {correct}/{questions.length} bonnes réponses
          </p>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded ${answers[i] === q.correct ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {answers[i] === q.correct ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm text-white">Question {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        {percentage >= 70 && (
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <Award className="w-6 h-6" />
            <span className="font-semibold">Badge débloqué!</span>
          </div>
        )}
      </div>
    );
  }

  const isCorrect = selectedAnswer === questions[currentQ].correct;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-cyan-400">📝 {quizTitle}</h3>
        <span className="text-slate-400 font-semibold">Question {currentQ + 1}/{questions.length}</span>
      </div>

      <div className="flex gap-2 mb-6">
        {questions.map((_, i) => (
          <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < currentQ ? 'bg-green-500' : i === currentQ ? 'bg-cyan-500' : 'bg-slate-700'}`} />
        ))}
      </div>

      <div className="bg-slate-800/50 border-2 border-cyan-500/30 rounded-xl p-6">
        <h4 className="text-xl font-bold text-white mb-6">{questions[currentQ].question}</h4>
        
        <div className="space-y-3 mb-6">
          {questions[currentQ].options.map((option, index) => {
            let buttonClass = 'bg-slate-700 text-slate-300 hover:bg-slate-600';
            
            if (showFeedback) {
              if (index === questions[currentQ].correct) {
                buttonClass = 'bg-green-500 text-white border-2 border-green-300';
              } else if (index === selectedAnswer) {
                buttonClass = 'bg-red-500 text-white border-2 border-red-300';
              } else {
                buttonClass = 'bg-slate-800 text-slate-500';
              }
            } else if (selectedAnswer === index) {
              buttonClass = 'bg-cyan-500 text-white border-2 border-cyan-300';
            }

            return (
              <button
                key={index}
                onClick={() => selectAnswer(index)}
                disabled={showFeedback}
                className={`w-full p-4 rounded-lg text-left transition-all ${buttonClass} flex items-center gap-3 disabled:cursor-not-allowed`}
              >
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${showFeedback && index === questions[currentQ].correct ? 'border-white' : 'border-current'}`}>
                  {showFeedback && index === questions[currentQ].correct && <CheckCircle className="w-5 h-5" />}
                  {showFeedback && index === selectedAnswer && index !== questions[currentQ].correct && <XCircle className="w-5 h-5" />}
                  {!showFeedback && <span className="font-bold">{String.fromCharCode(65 + index)}</span>}
                </div>
                <span className="font-medium">{option}</span>
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className={`p-4 rounded-lg border-2 mb-4 ${isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="font-bold text-green-400">Correct! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-red-400">Pas tout à fait...</span>
                </>
              )}
            </div>
            <p className="text-slate-300 text-sm">{questions[currentQ].explanation}</p>
          </div>
        )}

        {!showFeedback ? (
          <button 
            onClick={submitAnswer} 
            disabled={selectedAnswer === null}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Valider ma réponse
          </button>
        ) : (
          <button 
            onClick={nextQuestion}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {currentQ < questions.length - 1 ? (
              <>Question suivante <ArrowRight className="w-5 h-5" /></>
            ) : (
              <>Voir les résultats <Award className="w-5 h-5" /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EnhancedQuizComponent;
