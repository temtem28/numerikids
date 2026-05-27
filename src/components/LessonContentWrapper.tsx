import React, { useState, useEffect } from 'react';
import VideoTutorial from './learning/VideoTutorial';
import { AdaptiveVideoPlayer } from './learning/AdaptiveVideoPlayer';
import StepByStep from './learning/StepByStep';
import EnhancedScratchExercise from './learning/EnhancedScratchExercise';
import EnhancedPythonExercise from './learning/EnhancedPythonExercise';
import EnhancedQuizComponent from './learning/EnhancedQuizComponent';
import { supabase } from '@/lib/supabase';
import { lessonContentData } from '@/data/lessonContent';
import {
  mergeNovaVilleQuest,
  mergeDigitalArtQuest,
  tryParseNovaMergeKey,
  tryParseArtMergeKey,
  localContentToWrapperState,
} from '@/utils/sagaLessonMerge';

interface LessonContentWrapperProps {
  lessonId: string;
  lessonTitle: string;
  contentType: string;
  courseId: string;
  onComplete: (score: number) => void;
  questId?: number;
  isPixelKingdom?: boolean;
  /** Sagas : pas de lecteur ni carte « vidéo » (contenu pédagogique = étapes + activités). */
  hideVideoSection?: boolean;
}

const LessonContentWrapper: React.FC<LessonContentWrapperProps> = ({
  lessonId,
  lessonTitle,
  contentType,
  courseId,
  onComplete,
  questId,
  isPixelKingdom,
  hideVideoSection = false,
}) => {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subtitles, setSubtitles] = useState<any[]>([]);

  useEffect(() => {
    loadLessonContent();
  }, [lessonId]);

  const loadLessonContent = async () => {
    setLoading(true);
    setContent(null);

    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (data) {
      setContent(data);

      if (data.id) {
        const { data: subs } = await supabase
          .from('video_subtitles')
          .select('*')
          .eq('lesson_id', data.id);

        if (subs) setSubtitles(subs);
      }
      setLoading(false);
      return;
    }

    const novaQuest = tryParseNovaMergeKey(lessonId);
    if (novaQuest !== null) {
      const merged = mergeNovaVilleQuest(novaQuest);
      if (merged) setContent(localContentToWrapperState(merged));
      setLoading(false);
      return;
    }

    const artQuest = tryParseArtMergeKey(lessonId);
    if (artQuest !== null) {
      const merged = mergeDigitalArtQuest(artQuest);
      if (merged) setContent(localContentToWrapperState(merged));
      setLoading(false);
      return;
    }

    const localContent = lessonContentData[lessonId];
    if (localContent) {
      setContent(localContentToWrapperState(localContent));
    }

    setLoading(false);
  };


  if (loading) return <div className="text-center py-12 text-slate-400">Chargement...</div>;

  const hasQuiz = Array.isArray(content?.quiz_questions) && content.quiz_questions.length > 0;
  const exerciseOnComplete = (score: number) => {
    if (!hasQuiz) onComplete(score);
  };

  return (
    <div className="space-y-8">
      {!hideVideoSection &&
        (content?.video_url &&
        content?.video_qualities &&
        Object.keys(content.video_qualities).length > 0 ? (
          <AdaptiveVideoPlayer
            videoUrl={content.video_url}
            videoQualities={content.video_qualities}
            hlsUrl={content.video_hls_url}
            dashUrl={content.video_dash_url}
            thumbnailUrl={content.video_thumbnail_url}
            title={content.video_title || lessonTitle}
            subtitles={subtitles}
          />
        ) : content?.video_title ? (
          <VideoTutorial title={content.video_title} duration={content.video_duration || '5:00'} />
        ) : null)}

      {hideVideoSection && content?.video_title && (
        <div className="rounded-xl border border-cyan-500/20 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
          <span className="font-medium text-cyan-400">Module : </span>
          {content.video_title}
          {content.video_duration ? (
            <span className="text-slate-500"> · {content.video_duration}</span>
          ) : null}
        </div>
      )}

      {content?.steps && <StepByStep title="Instructions étape par étape" steps={content.steps} />}

      {contentType === 'scratch' && (
        <EnhancedScratchExercise
          onComplete={exerciseOnComplete}
          challenge={content?.exercise_challenge || 'Complète cet exercice Scratch'}
          lessonTitle={lessonTitle}
        />
      )}

      {contentType === 'python' && (
        <EnhancedPythonExercise
          onComplete={exerciseOnComplete}
          starterCode={content?.starter_code || '# Écris ton code ici\n'}
          challenge={content?.exercise_challenge || 'Complète cet exercice Python'}
          hints={content?.hints || []}
          expectedOutput={content?.expected_output}
          lessonTitle={lessonTitle}
          questId={questId}
          isPixelKingdom={isPixelKingdom}
        />
      )}

      {hasQuiz && (
        <EnhancedQuizComponent
          onComplete={onComplete}
          questions={content.quiz_questions}
          quizTitle={contentType === 'quiz' ? lessonTitle : `${lessonTitle} — validation`}
        />
      )}

      {!content && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-slate-400">Contenu en cours de développement...</p>
        </div>
      )}
    </div>
  );
};

export default LessonContentWrapper;
