import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Wand2, Trash2, Download, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Subtitle {
  id: string;
  language_code: string;
  language_name: string;
  subtitle_url: string;
  is_auto_generated: boolean;
}

interface SubtitleManagerProps {
  lessonId: string;
  videoUrl?: string;
}

export function SubtitleManager({ lessonId, videoUrl }: SubtitleManagerProps) {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSubtitles();
  }, [lessonId]);

  const loadSubtitles = async () => {
    const { data, error } = await supabase
      .from('video_subtitles')
      .select('*')
      .eq('lesson_id', lessonId);

    if (!error && data) {
      setSubtitles(data);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, lang: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileName = `${lessonId}/${lang}-${Date.now()}.vtt`;
      const { error: uploadError } = await supabase.storage
        .from('lesson-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lesson-media')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('video_subtitles')
        .insert({
          lesson_id: lessonId,
          language_code: lang,
          language_name: getLanguageName(lang),
          subtitle_url: publicUrl,
          is_auto_generated: false
        });

      if (dbError) throw dbError;

      toast.success('Subtitle uploaded successfully');
      loadSubtitles();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSubtitles = async () => {
    if (!videoUrl) {
      toast.error('No video URL available');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('subtitle-generator', {
        body: { videoUrl, lessonId, languages: ['fr', 'en', 'es'] }
      });

      if (error) throw error;

      for (const sub of data.subtitles) {
        const blob = new Blob([sub.content], { type: 'text/vtt' });
        const fileName = `${lessonId}/${sub.language_code}-auto-${Date.now()}.vtt`;
        
        const { error: uploadError } = await supabase.storage
          .from('lesson-media')
          .upload(fileName, blob);

        if (uploadError) continue;

        const { data: { publicUrl } } = supabase.storage
          .from('lesson-media')
          .getPublicUrl(fileName);

        await supabase.from('video_subtitles').insert({
          lesson_id: lessonId,
          language_code: sub.language_code,
          language_name: sub.language_name,
          subtitle_url: publicUrl,
          is_auto_generated: true
        });
      }

      toast.success('Subtitles generated successfully');
      loadSubtitles();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const deleteSubtitle = async (id: string) => {
    const { error } = await supabase
      .from('video_subtitles')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success('Subtitle deleted');
      loadSubtitles();
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Subtitles</h3>
        <Button
          onClick={generateSubtitles}
          disabled={generating || !videoUrl}
          size="sm"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          <span className="ml-2">AI Generate</span>
        </Button>
      </div>

      <div className="space-y-2">
        {['fr', 'en', 'es'].map(lang => {
          const existing = subtitles.find(s => s.language_code === lang);
          return (
            <div key={lang} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-2">
                <span className="font-medium">{getLanguageName(lang)}</span>
                {existing && (
                  <Badge variant={existing.is_auto_generated ? 'secondary' : 'default'}>
                    {existing.is_auto_generated ? 'AI' : 'Manual'}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {existing ? (
                  <>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={existing.subtitle_url} download>
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteSubtitle(existing.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" asChild>
                    <label>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                      <input
                        type="file"
                        accept=".vtt,.srt"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, lang)}
                      />
                    </label>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'fr': 'Français',
    'en': 'English',
    'es': 'Español'
  };
  return names[code] || code;
}