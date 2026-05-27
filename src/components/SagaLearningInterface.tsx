import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Trophy, ChevronRight } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { sagaLessonsData } from '@/data/sagaLessons';
import LessonContentWrapper from './LessonContentWrapper';
import { getSagaContentLessonKey } from '@/utils/sagaLessonMerge';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';
import { BadgeUnlockAnimation } from './gamification/BadgeUnlockAnimation';
import { XPProgressBar } from './gamification/XPProgressBar';
import { usePixelKingdomProgress } from '@/hooks/usePixelKingdomProgress';


const SagaLearningInterface: React.FC = () => {
  const { sagaId, lessonId } = useParams<{ sagaId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { completeLesson, completedLessons } = useAppContext();
  const { toast } = useToast();
  const [lessonComplete, setLessonComplete] = useState(false);
  const { completeQuest } = usePixelKingdomProgress();

  const saga = sagaId ? sagaLessonsData[sagaId as keyof typeof sagaLessonsData] : null;
  const lesson = saga?.lessons.find(l => l.id === Number(lessonId));
  const lessonIndex = saga?.lessons.findIndex(l => l.id === Number(lessonId)) ?? -1;
  const nextLesson = saga?.lessons[lessonIndex + 1];

  const handleComplete = async (finalScore: number) => {
    if (sagaId && lessonId) {
      completeLesson(sagaId, Number(lessonId));
      setLessonComplete(true);
      
      // If Pixel Kingdom, save progress to database with score
      if (sagaId === 'pixel-kingdom') {
        const questId = Number(lessonId);
        const xpEarned = lesson?.xp || 100;
        const starsEarned = finalScore >= 80 ? 3 : finalScore >= 60 ? 2 : 1;
        
        const result = await completeQuest(questId, xpEarned, starsEarned, finalScore);
        
        // Show improvement message if score improved
        if (result?.isImprovement) {
          toast({
            title: "Nouveau record! 🌟",
            description: `Tu as amélioré ton score de ${result.scoreIncrease} points!`,
          });
        } else {
          toast({
            title: "Leçon terminée! 🎉",
            description: `+${lesson?.xp} XP gagnés! Score: ${finalScore}`,
          });
        }
      } else {
        toast({
          title: "Leçon terminée! 🎉",
          description: `+${lesson?.xp} XP gagnés!`,
        });
      }
    }
  };




  const handleNextLesson = () => {
    if (nextLesson && sagaId) {
      navigate(`/saga/${sagaId}/lesson/${nextLesson.id}`);
      setLessonComplete(false);
    } else {
      navigate(`/saga/${sagaId}`);
    }
  };

  if (!saga || !lesson) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <p className="text-white">Leçon introuvable</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-cyan-500/30 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(`/saga/${sagaId}`)} className="text-cyan-400 hover:text-cyan-300">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à la carte
          </Button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Trophy className="w-5 h-5" />
              <span className="font-bold">{lesson.xp} XP</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/30">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2 neon-text">{lesson.title}</h1>
            <p className="text-gray-400">{lesson.description}</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
              <span>⏱️ {lesson.duration}</span>
              <span>📚 {lesson.type === 'quiz' ? 'Quiz' : lesson.type === 'python' ? 'Python' : 'Scratch'}</span>
            </div>
          </div>

          <LessonContentWrapper
            lessonId={getSagaContentLessonKey(sagaId!, lesson)}
            lessonTitle={lesson.title}
            contentType={lesson.type}
            courseId={sagaId || ''}
            onComplete={handleComplete}
            questId={lesson.id}
            isPixelKingdom={sagaId === 'pixel-kingdom'}
            hideVideoSection
          />



          {lessonComplete && (
            <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl border-2 border-cyan-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                  <div>
                    <h3 className="text-2xl font-bold text-white">Bravo! 🎉</h3>
                    <p className="text-gray-300">Tu as terminé cette leçon avec succès!</p>
                  </div>
                </div>
                <Button onClick={handleNextLesson} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600">
                  {nextLesson ? (
                    <>Leçon suivante <ChevronRight className="w-5 h-5 ml-2" /></>
                  ) : (
                    <>Retour à la carte <Trophy className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SagaLearningInterface;
