import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoTutorialProps {
  title: string;
  videoUrl?: string;
  duration: string;
  thumbnail?: string;
}

const VideoTutorial: React.FC<VideoTutorialProps> = ({ title, videoUrl, duration, thumbnail }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
        🎥 {title}
      </h3>
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border-2 border-cyan-500/30 aspect-video">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎬</div>
            <p className="text-white font-semibold">Tutoriel vidéo</p>
            <p className="text-slate-400 text-sm">{duration}</p>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="w-full bg-slate-700 h-1 rounded-full mb-3">
            <div className="bg-cyan-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <button onClick={togglePlay} className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full transition-all">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div className="flex gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-cyan-400 transition-colors">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button className="text-white hover:text-cyan-400 transition-colors">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorial;
