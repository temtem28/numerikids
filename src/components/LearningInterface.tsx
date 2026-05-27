import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Star, Trophy, Sparkles, Clock, AlertCircle, Coins, Flame, Volume2, VolumeX } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import ChildNavigation from './ChildNavigation';
import BadgeDisplay from './learning/BadgeDisplay';
import LessonContentWrapper from './LessonContentWrapper';
import { SuccessAnimation, setSoundPreference } from './learning/SuccessAnimation';
import { useToast } from '@/hooks/use-toast';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import { useChildStats } from '@/hooks/useChildStats';
import { offlineStorage } from '@/utils/offlineStorage';
import { completeLevel } from '@/utils/levelCompletion';





interface Lesson {
  id: string;
  title: string;
  content_type: string;
  duration_minutes: number;
  points: number;
  age_group: string;
}

interface ParentalSettings {
  daily_time_limit: number;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  account_status: string;
  content_restrictions: any;
}

const LearningInterface: React.FC<{ childId?: string; childAge?: string; courseId?: string }> = ({ childId = '1', childAge = '7-10', courseId = 'scratch' }) => {

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState(0);
  const [points, setPoints] = useState(127);
  const [showBadgePopup, setShowBadgePopup] = useState(false);
  const [showCoinPopup, setShowCoinPopup] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimationType, setSuccessAnimationType] = useState<'lesson' | 'badge' | 'streak' | 'levelUp'>('lesson');
  const [lastEarnedXP, setLastEarnedXP] = useState(0);
  const [lastEarnedCoins, setLastEarnedCoins] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [newBadge, setNewBadge] = useState('');
  const [streakMilestone, setStreakMilestone] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [settings, setSettings] = useState<ParentalSettings | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('numerikids_sound_enabled');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });
  const { toast } = useToast();
  const { streakData, updateStreak } = useStreakTracking(childId);
  const { coinBalance, loading: coinsLoading } = useChildStats(childId);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    setSoundPreference(newValue);
    toast({
      title: newValue ? 'Son activé' : 'Son désactivé',
      description: newValue ? 'Les effets sonores sont maintenant activés' : 'Les effets sonores sont maintenant désactivés',
    });
  };



  const avatars = [
    'https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1759729165961_61e9e9b0.webp',
    'https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1759729167716_1b4faad9.webp',
    'https://d64gsuwffb70l.cloudfront.net/68da43360bbfc7a2cb883cba_1759729169413_08d66e07.webp',
  ];

  useEffect(() => {
    loadLessons();
    checkParentalControls();
    setSessionStartTime(new Date());
  }, [childAge, childId]);




  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionStartTime && !isBlocked) {
        updateScreenTime();
        checkTimeLimit();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [sessionStartTime, isBlocked, settings]);

  const checkParentalControls = async () => {
    const { data: settingsData } = await supabase
      .from('parental_settings')
      .select('*')
      .eq('child_id', childId)
      .single();

    if (settingsData) {
      setSettings(settingsData);

      if (settingsData.account_status === 'paused') {
        setIsBlocked(true);
        setBlockReason('Compte mis en pause par un parent');
        return;
      }

      if (settingsData.scheduled_start_time && settingsData.scheduled_end_time) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMin] = settingsData.scheduled_start_time.split(':').map(Number);
        const [endHour, endMin] = settingsData.scheduled_end_time.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        if (currentTime < startTime || currentTime > endTime) {
          setIsBlocked(true);
          setBlockReason('En dehors des horaires autorisés');
          return;
        }
      }

      await checkTodayScreenTime(settingsData.daily_time_limit);
    }
  };

  const checkTodayScreenTime = async (limit: number) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('screen_time_logs')
      .select('minutes_used')
      .eq('child_id', childId)
      .eq('session_date', today)
      .single();

    if (data) {
      const remaining = limit - data.minutes_used;
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        setIsBlocked(true);
        setBlockReason('Limite de temps quotidienne atteinte');
      } else if (remaining <= 5) {
        toast({
          title: 'Attention!',
          description: `Il te reste ${remaining} minutes`,
          variant: 'destructive'
        });
      }
    } else {
      setTimeRemaining(limit);
    }
  };

  const updateScreenTime = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase
      .from('screen_time_logs')
      .select('*')
      .eq('child_id', childId)
      .eq('session_date', today)
      .single();

    const newMinutes = (existing?.minutes_used || 0) + 1;

    await supabase.from('screen_time_logs').upsert({
      child_id: childId,
      session_date: today,
      minutes_used: newMinutes,
      last_activity: new Date().toISOString()
    });

    setTimeRemaining(prev => prev - 1);
    if (settings && newMinutes >= settings.daily_time_limit) {
      setIsBlocked(true);
      setBlockReason('Limite de temps quotidienne atteinte');
      toast({
        title: 'Temps écoulé!',
        description: 'Tu as utilisé tout ton temps pour aujourd\'hui',
        variant: 'destructive'
      });
    }
  };

  const checkTimeLimit = () => {
    if (timeRemaining <= 5 && timeRemaining > 0) {
      toast({
        title: 'Bientôt fini!',
        description: `Il te reste ${timeRemaining} minutes`,
      });
    }
  };

  const loadLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('saga_id', courseId)
        .order('order_index');
      
      if (data) {
        const mappedLessons = data.map(lesson => ({
          id: lesson.lesson_id || lesson.id,
          title: lesson.title,
          content_type: lesson.lesson_type || 'python',
          duration_minutes: parseInt(lesson.duration?.replace(' min', '') || '15'),
          points: lesson.xp_reward || 100,
          age_group: childAge,
          fullData: {
            ...lesson,
            video_qualities: lesson.video_qualities || {},
            video_hls_url: lesson.video_hls_url,
            video_dash_url: lesson.video_dash_url,
            video_thumbnail_url: lesson.video_thumbnail_url,
            video_processing_status: lesson.video_processing_status
          }
        }));
        setLessons(mappedLessons);
        
        // Cache lessons for offline use
        for (const lesson of mappedLessons) {
          await offlineStorage.cacheLesson(lesson);
        }
      }
    } catch (error) {
      // Try loading from cache if offline
      console.warn('Loading from cache');
      const cachedLesson = await offlineStorage.getLesson(courseId);
      if (cachedLesson) setLessons([cachedLesson]);
    }
  };







  const awardCoins = async (amount: number) => {
    const { data: parentData } = await supabase.from('parent_profiles').select('parent_id').eq('child_id', childId).single();
    const parentId = parentData?.parent_id;

    // Get current balance from the hook
    const currentBalance = coinBalance;

    await supabase.from('child_coins').upsert({
      child_id: childId,
      parent_id: parentId,
      balance: currentBalance + amount,
      lifetime_earned: currentBalance + amount
    }, { onConflict: 'child_id' });

    await supabase.from('coin_transactions').insert({
      child_id: childId,
      amount,
      transaction_type: 'earned',
      source: 'lesson_complete'
    });

    // The hook will automatically update coinBalance via real-time subscription
    setCoinsEarned(amount);
    setShowCoinPopup(true);
    setTimeout(() => setShowCoinPopup(false), 3000);
  };



  const completeLesson = async (score: number) => {
    const lesson = lessons[currentLesson];
    const earnedPoints = lesson.points;
    const earnedCoins = Math.floor(earnedPoints / 10);
    
    // Calculate stars based on score (0-100)
    let stars = 0;
    if (score >= 90) stars = 3;
    else if (score >= 70) stars = 2;
    else if (score >= 50) stars = 1;
    
    setPoints(points + earnedPoints);
    
    try {
      // Get parent ID
      const { data: parentData } = await supabase
        .from('children')
        .select('parent_id')
        .eq('id', childId)
        .single();
      
      const parentId = parentData?.parent_id;
      
      if (!parentId) {
        console.error('Parent ID not found');
        return;
      }

      // Calculate completion time
      const completionTime = sessionStartTime 
        ? Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000)
        : undefined;

      // Use the new completeLevel function
      const result = await completeLevel({
        levelId: lesson.id,
        stars,
        xpEarned: earnedPoints,
        coinsEarned: earnedCoins,
        completionTime,
        childId,
        parentId
      });

      if (result.success && result.data) {
        // Update local state with new values
        setPoints(prev => prev + result.data!.xpEarned);
        
        // Update streak
        const streakResult = await updateStreak();
        if (streakResult && streakResult.bonusCoins > 0) {
          setStreakMilestone(streakResult.milestone || '');
          setCoinsEarned(streakResult.bonusCoins);
          setShowStreakPopup(true);
          setTimeout(() => setShowStreakPopup(false), 4000);
        }
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
      // Queue for offline sync as fallback
      await offlineStorage.queueAction({
        type: 'progress',
        data: {
          child_id: childId,
          lesson_id: lesson.id,
          status: 'completed',
          score,
          completed_at: new Date().toISOString()
        }
      });
    }

    const completed = currentLesson + 1;
    const newProgress = Math.round((completed / lessons.length) * 100);
    setProgress(newProgress);

    // Show success animation with confetti
    setLastEarnedXP(earnedPoints);
    setLastEarnedCoins(earnedCoins);
    setSuccessAnimationType('lesson');
    setShowSuccessAnimation(true);

    if (completed === 1) {
      setNewBadge('Premier Pas');
      // Show badge animation after lesson animation
      setTimeout(() => {
        setSuccessAnimationType('badge');
        setShowSuccessAnimation(true);
      }, 4500);
    }

    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    }
  };






  const renderContent = () => {

    if (!lessons[currentLesson]) return null;
    const lesson = lessons[currentLesson];

    return (
      <LessonContentWrapper
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        contentType={lesson.content_type}
        courseId={courseId}
        onComplete={completeLesson}
        hideVideoSection={false}
      />
    );
  };


  const badges = [
    { id: '1', name: 'Premier Pas', description: '1ère leçon', earned: progress > 0 },
    { id: '2', name: 'Explorateur', description: '5 leçons', earned: progress > 50 },
    { id: '3', name: 'Expert', description: '20 leçons', earned: false },
    { id: '4', name: 'Champion', description: '500 points', earned: points >= 500 },
    { id: '5', name: 'Série 3 jours 🔥', description: '3 jours consécutifs', earned: streakData.currentStreak >= 3, isStreak: true },
    { id: '6', name: 'Série 7 jours 🔥', description: '7 jours consécutifs', earned: streakData.currentStreak >= 7, isStreak: true },
    { id: '7', name: 'Série 30 jours 🔥', description: '30 jours consécutifs', earned: streakData.currentStreak >= 30, isStreak: true },
  ];


  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 border border-red-500/30 max-w-md text-center">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Accès bloqué</h2>
          <p className="text-gray-300 text-lg mb-6">{blockReason}</p>
          <p className="text-sm text-gray-400">Contacte tes parents pour plus d'informations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <ChildNavigation childName="Alex" avatarUrl={avatars[0]} points={points} progress={progress} streak={streakData.currentStreak} coins={coinBalance} />

      {/* Sound Toggle Button */}
      <button
        onClick={toggleSound}
        className="fixed top-20 right-4 z-40 p-3 bg-slate-800/80 backdrop-blur-sm rounded-full border border-cyan-500/30 hover:border-cyan-400 transition-all group"
        title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
        ) : (
          <VolumeX className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
        )}
      </button>
      
      {timeRemaining <= 10 && (
        <div className="bg-orange-500/20 border-b border-orange-500/50 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-orange-300">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Attention: Il te reste {timeRemaining} minutes aujourd'hui</span>
          </div>
        </div>
      )}

      
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
              <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Leçons
              </h3>
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLesson(index)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      currentLesson === index 
                        ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-cyan-400' 
                        : 'bg-slate-700/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {index < currentLesson ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-slate-500 rounded-full" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-white">{lesson.title}</h4>
                        <p className="text-xs text-slate-400">{lesson.duration_minutes} min</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
              <h3 className="font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Badges
              </h3>
              <BadgeDisplay badges={badges} />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/30">
              <h2 className="text-2xl font-bold text-white mb-6">{lessons[currentLesson]?.title}</h2>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {showBadgePopup && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl p-6 max-w-sm animate-bounce">
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-white" />
            <div>
              <h4 className="font-bold text-white text-lg">Nouveau badge! 🎉</h4>
              <p className="text-white/90">{newBadge}</p>
            </div>
          </div>
        </div>
      )}

      {showCoinPopup && (
        <div className="fixed bottom-24 right-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl shadow-2xl p-6 max-w-sm animate-bounce">
          <div className="flex items-center gap-4">
            <Coins className="w-12 h-12 text-yellow-300" />
            <div>
              <h4 className="font-bold text-white text-lg">+{coinsEarned} Pièces! 💰</h4>
              <p className="text-white/90">Total: {coinBalance} pièces</p>
            </div>
          </div>
        </div>
      )}

      {showStreakPopup && (
        <div className="fixed bottom-6 left-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-2xl p-6 max-w-sm animate-bounce border-2 border-orange-300">
          <div className="flex items-center gap-4">
            <Flame className="w-12 h-12 text-white fill-current" />
            <div>
              <h4 className="font-bold text-white text-lg">Série de {streakMilestone}! 🔥</h4>
              <p className="text-white/90">+{coinsEarned} pièces bonus!</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <SuccessAnimation
          type={successAnimationType}
          message={successAnimationType === 'badge' ? `Badge: ${newBadge}` : 'Leçon Terminée!'}
          subMessage={successAnimationType === 'badge' ? 'Félicitations!' : lessons[currentLesson]?.title}
          xpEarned={lastEarnedXP}
          coinsEarned={lastEarnedCoins}
          soundEnabled={soundEnabled}
          onComplete={() => setShowSuccessAnimation(false)}
        />
      )}

    </div>
  );
};

export default LearningInterface;
