import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface QuizPreviewProps {
  quiz: any;
  onClose: () => void;
}

export default function QuizPreview({ quiz, onClose }: QuizPreviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: answerId });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((q: any, index: number) => {
      totalPoints += q.points;
      const selectedAnswer = q.answers.find((a: any) => a.id === selectedAnswers[index] || a.answer_text === selectedAnswers[index]);
      if (selectedAnswer?.is_correct) {
        correct++;
        earnedPoints += q.points;
      }
    });

    return { correct, total: quiz.questions.length, percentage: (earnedPoints / totalPoints) * 100, earnedPoints, totalPoints };
  };

  if (showResults) {
    const score = calculateScore();
    const passed = score.percentage >= quiz.passing_score;

    return (
      <Card className="p-8 bg-slate-800 border-slate-700 max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className={`text-6xl ${passed ? 'text-green-500' : 'text-red-500'}`}>
            {passed ? <CheckCircle className="w-24 h-24 mx-auto" /> : <XCircle className="w-24 h-24 mx-auto" />}
          </div>
          <h2 className="text-3xl font-bold text-white">{passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
          <div className="text-xl text-gray-300">
            <p>Score: {score.correct} / {score.total} ({score.percentage.toFixed(0)}%)</p>
            <p>Points: {score.earnedPoints} / {score.totalPoints}</p>
          </div>
          <Button onClick={onClose} className="mt-4">Close Preview</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
        <Button variant="ghost" onClick={onClose}><X className="w-5 h-5" /></Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>{question.points} points</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">{question.question_text}</h3>

        {question.question_type === 'code_challenge' && question.code_template && (
          <pre className="bg-slate-900 p-4 rounded mb-4 text-green-400 font-mono text-sm overflow-x-auto">
            {question.code_template}
          </pre>
        )}

        <div className="space-y-2">
          {question.answers.map((answer: any, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(answer.id || answer.answer_text)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswers[currentQuestion] === (answer.id || answer.answer_text)
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-slate-600 bg-slate-700 hover:border-slate-500'
              }`}
            >
              <span className="text-white">{answer.answer_text}</span>
            </button>
          ))}
        </div>

        {question.explanation && selectedAnswers[currentQuestion] && (
          <div className="mt-4 p-4 bg-blue-500/20 border border-blue-500 rounded">
            <p className="text-sm text-blue-200">{question.explanation}</p>
          </div>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestion]}>
          {currentQuestion < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </div>
    </div>
  );
}