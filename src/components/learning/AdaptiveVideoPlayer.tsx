import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, Subtitles } from 'lucide-react';

interface Subtitle {
  language_code: string;
  language_name: string;
  subtitle_url: string;
}

interface AdaptiveVideoPlayerProps {
  videoUrl?: string;
  videoQualities?: Record<string, string>;
  hlsUrl?: string;
  dashUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  subtitles?: Subtitle[];
}


export function AdaptiveVideoPlayer({ 
  videoUrl, 
  videoQualities = {}, 
  hlsUrl, 
  dashUrl,
  thumbnailUrl,
  title,
  subtitles = []
}: AdaptiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [showControls, setShowControls] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('off');
  const [showCaptions, setShowCaptions] = useState(false);


  const qualities = Object.keys(videoQualities);
  const hasMultipleQualities = qualities.length > 0;

  useEffect(() => {
    if (hlsUrl && videoRef.current) {
      // In production, use hls.js for HLS support
      // import Hls from 'hls.js';
      // if (Hls.isSupported()) {
      //   const hls = new Hls();
      //   hls.loadSource(hlsUrl);
      //   hls.attachMedia(videoRef.current);
      // }
    }
  }, [hlsUrl]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const changeQuality = (quality: string) => {
    setCurrentQuality(quality);
    if (videoRef.current && quality !== 'auto') {
      const currentTime = videoRef.current.currentTime;
      videoRef.current.src = videoQualities[quality];
      videoRef.current.currentTime = currentTime;
      if (isPlaying) videoRef.current.play();
    }
  };

  const changeSubtitle = (lang: string) => {
    setCurrentSubtitle(lang);
    if (videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = tracks[i].language === lang ? 'showing' : 'hidden';
      }
      setShowCaptions(lang !== 'off');
    }
  };

  const getVideoSource = () => {
    if (currentQuality === 'auto' && hlsUrl) return hlsUrl;
    if (currentQuality !== 'auto' && videoQualities[currentQuality]) return videoQualities[currentQuality];
    return videoUrl || '';
  };


  return (
    <Card className="overflow-hidden bg-black">
      <div className="relative aspect-video" onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
        <video
          ref={videoRef}
          className="w-full h-full"
          poster={thumbnailUrl}
          onClick={togglePlay}
          crossOrigin="anonymous"
        >
          <source src={getVideoSource()} type="video/mp4" />
          {subtitles.map(sub => (
            <track
              key={sub.language_code}
              kind="subtitles"
              src={sub.subtitle_url}
              srcLang={sub.language_code}
              label={sub.language_name}
              default={sub.language_code === 'fr'}
            />
          ))}
          Your browser does not support the video tag.
        </video>


        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>

              <Button size="icon" variant="ghost" onClick={toggleMute} className="text-white hover:bg-white/20">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              <div className="flex-1" />


              {subtitles.length > 0 && (
                <Select value={currentSubtitle} onValueChange={changeSubtitle}>
                  <SelectTrigger className="w-32 h-8 bg-white/10 text-white border-white/20">
                    <Subtitles className="w-4 h-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    {subtitles.map(sub => (
                      <SelectItem key={sub.language_code} value={sub.language_code}>
                        {sub.language_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {hasMultipleQualities && (
                <Select value={currentQuality} onValueChange={changeQuality}>
                  <SelectTrigger className="w-24 h-8 bg-white/10 text-white border-white/20">
                    <Settings className="w-4 h-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto</SelectItem>
                    {qualities.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}


              <Button size="icon" variant="ghost" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
