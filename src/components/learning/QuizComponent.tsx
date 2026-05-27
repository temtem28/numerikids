import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const QuizComponent: React.FC<{ onComplete: (score: number) => void }> = ({ onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions: Question[] = [
    {
      question: "Quel bloc fait avancer le sprite?",
      options: ["Avancer de 10 pas", "Tourner à droite", "Dire Bonjour", "Changer de costume"],
      correct: 0
    },
    {
      question: "Combien de fois répète une boucle 'Répéter 5 fois'?",
      options: ["3 fois", "4 fois", "5 fois", "6 fois"],
      correct: 2
    },
    {
      question: "Quelle couleur représente les blocs de mouvement?",
      options: ["Violet", "Bleu", "Vert", "Orange"],
      correct: 1
    }
  ];

  const selectAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = index;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      const score = Math.round((answers.filter((a, i) => a === questions[i].correct).length / questions.length) * 100);
      setShowResults(true);
      onComplete(score);
    }
  };

  if (showResults) {
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    return (
      <div className="text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h3 className="text-2xl font-bold text-cyan-400">Quiz terminé!</h3>
        <p className="text-xl text-slate-300">Tu as {correct}/{questions.length} bonnes réponses</p>
        <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{Math.round((correct/questions.length)*100)}%</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-cyan-400 font-semibold">Question {currentQ + 1}/{questions.length}</span>
        <div className="flex gap-2">
          {questions.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i === currentQ ? 'bg-cyan-500' : i < currentQ ? 'bg-green-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>
      <h3 className="text-xl font-bold text-white">{questions[currentQ].question}</h3>
      <div className="space-y-3">
        {questions[currentQ].options.map((option, index) => (
          <button
            key={index}
            onClick={() => selectAnswer(index)}
            className={`w-full p-4 rounded-lg text-left transition-all ${answers[currentQ] === index ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {option}
          </button>
        ))}
      </div>
      <button onClick={nextQuestion} disabled={answers[currentQ] === undefined} className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50">
        {currentQ < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
      </button>
    </div>
  );
};

export default QuizComponent;
