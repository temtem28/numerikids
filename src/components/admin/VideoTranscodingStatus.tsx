import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface VideoTranscodingStatusProps {
  lessonId: string;
  onTranscodingComplete?: () => void;
}

export function VideoTranscodingStatus({ lessonId, onTranscodingComplete }: VideoTranscodingStatusProps) {
  const [status, setStatus] = useState<string>('pending');
  const [qualities, setQualities] = useState<Record<string, string>>({});
  const [isTranscoding, setIsTranscoding] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [lessonId]);

  const fetchStatus = async () => {
    const { data } = await supabase
      .from('lessons')
      .select('video_processing_status, video_qualities')
      .eq('id', lessonId)
      .single();

    if (data) {
      setStatus(data.video_processing_status || 'pending');
      setQualities(data.video_qualities || {});
      if (data.video_processing_status === 'completed' && onTranscodingComplete) {
        onTranscodingComplete();
      }
    }
  };

  const startTranscoding = async () => {
    setIsTranscoding(true);
    const { data: lesson } = await supabase
      .from('lessons')
      .select('video_url, title')
      .eq('id', lessonId)
      .single();

    if (lesson?.video_url) {
      await supabase.functions.invoke('video-transcoder', {
        body: {
          videoUrl: lesson.video_url,
          lessonId,
          fileName: lesson.title
        }
      });
    }
    setIsTranscoding(false);
    fetchStatus();
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Video Transcoding</h3>
        {getStatusBadge()}
      </div>

      {status === 'pending' && (
        <Button onClick={startTranscoding} disabled={isTranscoding} size="sm">
          {isTranscoding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Start Transcoding
        </Button>
      )}

      {status === 'completed' && Object.keys(qualities).length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Available qualities:</p>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(qualities).map(quality => (
              <Badge key={quality} variant="secondary">{quality}</Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
