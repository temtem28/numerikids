import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { lessonContentData } from '@/data/lessonContent';
import { sagaLessonsData } from '@/data/sagaLessons';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function LessonImporter() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ total: 0, imported: 0, errors: 0 });

  const importLessons = async () => {
    setImporting(true);
    setProgress({ total: 0, imported: 0, errors: 0 });

    const lessonsToImport: any[] = [];

    // Import from lessonContentData
    Object.entries(lessonContentData).forEach(([key, content]) => {
      lessonsToImport.push({
        lesson_id: content.lessonId,
        title: content.videoTitle || `Lesson ${content.lessonId}`,
        video_title: content.videoTitle,
        video_duration: content.videoDuration,
        steps: content.steps || null,
        exercise_challenge: content.exerciseChallenge,
        starter_code: content.starterCode,
        hints: content.hints || null,
        expected_output: content.expectedOutput,
        quiz_questions: content.quizQuestions || null,
        xp_reward: 100,
        coin_reward: 50,
      });
    });

    // Import from sagaLessonsData
    Object.entries(sagaLessonsData).forEach(([sagaKey, saga]) => {
      saga.lessons.forEach((lesson, idx) => {
        lessonsToImport.push({
          lesson_id: `${sagaKey}-${lesson.id}`,
          title: lesson.title,
          description: lesson.description,
          lesson_type: lesson.type,
          duration: lesson.duration,
          xp_reward: lesson.xp,
          coin_reward: Math.floor(lesson.xp / 2),
          saga_id: sagaKey,
          position: lesson.position,
          background_image: saga.backgroundImage,
          order_index: idx,
        });
      });
    });

    setProgress(prev => ({ ...prev, total: lessonsToImport.length }));

    for (const lesson of lessonsToImport) {
      try {
        const { error } = await supabase.from('lessons').upsert(lesson, {
          onConflict: 'lesson_id',
        });

        if (error) throw error;
        setProgress(prev => ({ ...prev, imported: prev.imported + 1 }));
      } catch (err) {
        console.error('Import error:', err);
        setProgress(prev => ({ ...prev, errors: prev.errors + 1 }));
      }
    }

    setImporting(false);
    toast.success(`Import complete! ${progress.imported} lessons imported.`);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Lesson Data Importer</h2>
      <p className="text-gray-600 mb-6">
        Import all lesson content from data files into Supabase database.
      </p>

      {progress.total > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Imported: {progress.imported} / {progress.total}</span>
          </div>
          {progress.errors > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Errors: {progress.errors}</span>
            </div>
          )}
        </div>
      )}

      <Button onClick={importLessons} disabled={importing} className="w-full">
        <Upload className="w-4 h-4 mr-2" />
        {importing ? 'Importing...' : 'Import All Lessons'}
      </Button>
    </Card>
  );
}
