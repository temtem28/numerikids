import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sagaLessonsData } from '@/data/sagaLessons';
import { Map, ChevronRight, Sparkles } from 'lucide-react';

const SAGA_META: Record<string, { emoji: string; blurb: string }> = {
  scratch: { emoji: '🎨', blurb: 'Blocs visuels et logique' },
  python: { emoji: '🐍', blurb: 'Syntaxe et algorithmes' },
  ai: { emoji: '🤖', blurb: 'Introduction à l’IA' },
  novaville: { emoji: '🏙️', blurb: 'Ville durable & code' },
  digitalart: { emoji: '🖼️', blurb: 'Création numérique' },
  'pixel-kingdom': { emoji: '👑', blurb: 'Quêtes & défis' },
};

export default function SagasHubPage() {
  const navigate = useNavigate();
  const entries = Object.entries(sagaLessonsData) as [string, (typeof sagaLessonsData)['scratch']][];

  return (
    <DashboardLayout title="Sagas" subtitle="Choisis un parcours pour commencer ou continuer">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 text-cyan-400">
          <Sparkles className="w-6 h-6" />
          <p className="text-slate-300 text-sm">
            Chaque saga regroupe des leçons avec exercices et quiz. Ta progression est enregistrée pour l’enfant sélectionné.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {entries.map(([id, saga]) => {
            const meta = SAGA_META[id] || { emoji: '📚', blurb: 'Parcours d’apprentissage' };
            const n = saga.lessons?.length ?? 0;
            return (
              <Card
                key={id}
                className="bg-slate-900/60 border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
              >
                <CardContent className="p-6 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-3xl mr-2">{meta.emoji}</span>
                      <h2 className="text-xl font-bold text-white inline">{saga.title}</h2>
                      <p className="text-slate-400 text-sm mt-2">{meta.blurb}</p>
                      <p className="text-xs text-slate-500 mt-1">{n} étape{n > 1 ? 's' : ''}</p>
                    </div>
                    <Map className="w-8 h-8 text-purple-400/50 shrink-0" />
                  </div>
                  <Button
                    className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-purple-500"
                    onClick={() => navigate(`/saga/${id}`)}
                  >
                    Ouvrir la carte
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => navigate('/dashboard')}>
          Retour au tableau de bord
        </Button>
      </div>
    </DashboardLayout>
  );
}
