import { useState, useEffect } from 'react';
import { pixelKingdomData } from '@/data/pixelKingdomData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Crown, Sword, Trophy, Star, TrendingUp } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { usePixelKingdomProgress } from '@/hooks/usePixelKingdomProgress';

export const PixelKingdomMap = () => {
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const navigate = useNavigate();
  const { progress, isQuestUnlocked, isQuestCompleted, getQuestProgress, loading } = usePixelKingdomProgress();
  const [questStates, setQuestStates] = useState<any>({});

  useEffect(() => {
    // Update quest states based on progress
    const states: any = {};
    pixelKingdomData.chapters.forEach(chapter => {
      chapter.quests.forEach(quest => {
        const questProgress = getQuestProgress(quest.id);
        states[quest.id] = {
          unlocked: isQuestUnlocked(quest.id),
          completed: isQuestCompleted(quest.id),
          bestScore: questProgress?.bestScore || 0,
          bestStars: questProgress?.bestStars || 0,
          attempts: questProgress?.attempts || 0
        };
      });
    });
    setQuestStates(states);
  }, [progress]);



  const handleQuestClick = (quest: any, chapter: any) => {
    const isUnlocked = questStates[quest.id]?.unlocked || quest.id === 1;
    if (isUnlocked) {
      setSelectedQuest({ ...quest, chapter });
    }
  };


  const startQuest = () => {
    if (selectedQuest) {
      navigate(`/saga/pixel-kingdom/lesson/${selectedQuest.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Crown className="w-12 h-12 text-yellow-400" />
            {pixelKingdomData.title}
          </h1>
          <p className="text-xl text-purple-200">{pixelKingdomData.description}</p>
          
          <div className="mt-6">
            <Button 
              onClick={() => navigate('/pixel-kingdom/leaderboard')}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-8 py-3 text-lg"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Voir le Classement
            </Button>
          </div>
        </div>


        <div className="space-y-16">
          {pixelKingdomData.chapters.map((chapter, idx) => (
            <div key={chapter.id} className="relative">
              <div 
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  backgroundImage: `url(${chapter.background})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="bg-black/60 backdrop-blur-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">{chapter.title}</h2>
                      <Badge variant="secondary" className="text-lg">{chapter.age}</Badge>
                    </div>
                    <div className="text-white text-xl font-semibold">
                      Chapitre {chapter.id}/5
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {chapter.quests.map((quest, qIdx) => {
                      const isUnlocked = questStates[quest.id]?.unlocked || quest.id === 1;
                      const isCompleted = questStates[quest.id]?.completed;
                      
                      return (
                        <Card
                          key={quest.id}
                          onClick={() => handleQuestClick(quest, chapter)}
                          className={`relative p-6 cursor-pointer transition-all duration-300 ${
                            !isUnlocked
                              ? 'opacity-50 cursor-not-allowed bg-gray-800/80' 
                              : 'hover:scale-105 hover:shadow-xl bg-white/90'
                          } ${quest.isBoss ? 'border-4 border-red-500' : ''} ${
                            isCompleted ? 'border-2 border-green-500' : ''
                          }`}
                        >
                          {!isUnlocked && (
                            <div className="absolute top-4 right-4">
                              <Lock className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          {isCompleted && (
                            <div className="absolute top-4 right-4 bg-green-500 rounded-full p-1">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                          )}
                          {quest.isBoss && (
                            <div className="absolute -top-3 -right-3 bg-red-500 rounded-full p-2">
                              <Sword className="w-6 h-6 text-white" />
                            </div>
                          )}
                          
                          <h3 className="font-bold text-lg mb-3">{quest.title}</h3>
                          
                          {isCompleted && questStates[quest.id] && (
                            <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-1 mb-1">
                                {[1, 2, 3].map((starNum) => (
                                  <Star 
                                    key={starNum}
                                    className={`w-4 h-4 ${starNum <= questStates[quest.id].bestStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-600">Meilleur: {questStates[quest.id].bestScore} pts</p>
                              <p className="text-xs text-gray-500">{questStates[quest.id].attempts} tentative(s)</p>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <span className="font-semibold">{quest.xp} XP</span>
                          </div>
                          
                          <div className="space-y-1">
                            {quest.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <Trophy className="w-4 h-4 text-purple-500" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>

                        </Card>
                      );
                    })}
                  </div>

                </div>
              </div>
              
              {idx < pixelKingdomData.chapters.length - 1 && (
                <div className="flex justify-center my-8">
                  <div className="w-1 h-16 bg-gradient-to-b from-purple-500 to-blue-500 animate-pulse" />
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedQuest && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedQuest.title}</h2>
              <p className="text-gray-600 mb-4">Chapitre: {selectedQuest.chapter.title}</p>
              
              {questStates[selectedQuest.id]?.completed && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">Statistiques de progression</p>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3].map((starNum) => (
                      <Star 
                        key={starNum}
                        className={`w-5 h-5 ${starNum <= questStates[selectedQuest.id].bestStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      ({questStates[selectedQuest.id].bestStars}/3 étoiles)
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">Meilleur score: <span className="font-bold">{questStates[selectedQuest.id].bestScore} points</span></p>
                  <p className="text-sm text-gray-600">Tentatives: {questStates[selectedQuest.id].attempts}</p>
                </div>
              )}
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Récompense: {selectedQuest.xp} XP</span>
                </div>
                {selectedQuest.items.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={startQuest} className="flex-1">
                  {questStates[selectedQuest.id]?.completed ? 'Rejouer la Quête' : 'Commencer la Quête'}
                </Button>
                <Button onClick={() => setSelectedQuest(null)} variant="outline">
                  Fermer
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
