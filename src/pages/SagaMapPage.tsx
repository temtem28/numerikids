import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SagaMap } from '@/components/SagaMap';
import { sagaLessonsData } from '@/data/sagaLessons';
import { useAppContext } from '@/contexts/AppContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, Crown, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function SagaMapPage() {
  const { sagaId } = useParams<{ sagaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completedLessons, currentLesson, setCurrentLesson } = useAppContext();
  const subscription = useSubscription();

  const sagaData = sagaId ? sagaLessonsData[sagaId as keyof typeof sagaLessonsData] : null;
  const isSagaLocked = sagaId && !subscription.allowedSagas.includes(sagaId);

  const sagaTierMap: Record<string, string> = {
    'pixel-kingdom': 'FREE',
    novaville: 'BASIC',
    digitalart: 'PREMIUM',
  };

  if (!sagaData || !sagaId) {
    return (
      <DashboardLayout title="Saga non trouvée">
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-center bg-slate-900/50 border border-cyan-500/20 rounded-xl p-8 max-w-md">
            <h1 className="text-3xl font-bold text-white mb-4">Saga non trouvée</h1>
            <p className="text-slate-400 mb-6">Cette saga n'existe pas ou n'est plus disponible.</p>
            <Button
              onClick={() => navigate(user ? '/dashboard' : '/child-dashboard')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500"
            >
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isSagaLocked) {
    return (
      <DashboardLayout title="Saga Verrouillée">
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="max-w-md text-center bg-slate-900/50 border border-amber-500/30 rounded-xl p-8">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Saga Verrouillée</h1>
            <p className="text-slate-300 mb-2">
              Cette saga nécessite un abonnement supérieur.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-medium">{sagaTierMap[sagaId] || 'PREMIUM'}</span>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-400">
                Passez à un plan supérieur pour débloquer cette saga et accéder à plus de contenu exclusif.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button
                  onClick={() => navigate(user ? '/dashboard' : '/child-dashboard')}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                <Button 
                  onClick={() => navigate('/billing')} 
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Voir les plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleLessonSelect = (lessonId: number) => {
    setCurrentLesson(sagaId, lessonId);
    navigate(`/saga/${sagaId}/lesson/${lessonId}`);
  };

  return (
    <div className="relative min-h-screen">
      <Button
        onClick={() => navigate(user ? '/dashboard' : '/child-dashboard')}
        className="absolute top-4 left-4 z-50 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>
      
      <SagaMap
        sagaId={sagaId}
        sagaTitle={sagaData.title}
        backgroundImage={sagaData.backgroundImage}
        lessons={sagaData.lessons}
        completedLessons={completedLessons[sagaId] || []}
        currentLesson={currentLesson[sagaId] || 1}
        onLessonSelect={handleLessonSelect}
      />
    </div>
  );
}
