import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Trophy, BookOpen } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MessageInputProps {
  onSend: (content: string, type?: string, metadata?: any) => void;
  achievements?: any[];
  recentLessons?: any[];
}

export function MessageInput({ onSend, achievements = [], recentLessons = [] }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleShareAchievement = (achievement: any) => {
    onSend(
      `I earned the ${achievement.title} achievement!`,
      'achievement',
      { title: achievement.title, description: achievement.description }
    );
  };

  const handleShareLesson = (lesson: any) => {
    onSend(
      `I completed ${lesson.title}!`,
      'lesson',
      { lessonTitle: lesson.title, lessonId: lesson.id }
    );
  };

  return (
    <div className="border-t p-4 bg-white">
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Trophy className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <h4 className="font-semibold mb-2">Share Achievement</h4>
            {achievements.length === 0 ? (
              <p className="text-sm text-gray-500">No achievements yet</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {achievements.map((ach) => (
                  <button key={ach.id} onClick={() => handleShareAchievement(ach)} className="w-full text-left p-2 hover:bg-gray-100 rounded">
                    <p className="font-medium text-sm">{ach.title}</p>
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <BookOpen className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <h4 className="font-semibold mb-2">Share Lesson</h4>
            {recentLessons.length === 0 ? (
              <p className="text-sm text-gray-500">No lessons completed</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recentLessons.map((lesson) => (
                  <button key={lesson.id} onClick={() => handleShareLesson(lesson)} className="w-full text-left p-2 hover:bg-gray-100 rounded">
                    <p className="font-medium text-sm">{lesson.title}</p>
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
        <Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="flex-1" />
        <Button onClick={handleSend} disabled={!message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
