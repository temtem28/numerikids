import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Smile, Download, Trophy, Target } from 'lucide-react';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  onReact: (emoji: string) => void;
}

const REACTION_EMOJIS = ['❤️', '👍', '😊', '🎉', '⭐', '🏆'];

export function MessageBubble({ message, isOwn, onReact }: MessageBubbleProps) {
  const reactionCounts = (message.reactions || []).reduce((acc: any, r: any) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const renderAttachment = () => {
    if (!message.attachment_url) return null;
    const isImage = message.attachment_url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    
    if (isImage) {
      return <div className="mt-2"><img src={message.attachment_url} alt="Attachment" className="max-w-xs rounded-lg border" /></div>;
    }
    return (
      <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 p-2 bg-gray-100 rounded hover:bg-gray-200">
        <Download className="w-4 h-4" />
        <span className="text-sm">{message.metadata?.fileName || 'Download'}</span>
      </a>
    );
  };

  const renderSpecialMessage = () => {
    if (message.message_type === 'achievement') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-sm">{message.content}</p>
              <p className="text-xs text-gray-600">{message.metadata?.title}</p>
            </div>
          </div>
        </div>
      );
    }
    if (message.message_type === 'goal') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">{message.content}</p>
              <p className="text-xs text-gray-600">Target: {message.metadata?.targetValue} | Reward: {message.metadata?.rewardCoins} coins</p>
            </div>
          </div>
        </div>
      );
    }
    return <p className="text-sm">{message.content}</p>;
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'} rounded-lg p-3`}>
        {renderSpecialMessage()}
        {renderAttachment()}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs opacity-70">
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="w-3 h-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="flex gap-1">
                {REACTION_EMOJIS.map(emoji => (
                  <button key={emoji} onClick={() => onReact(emoji)} className="text-xl hover:scale-125 transition-transform p-1">
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        {Object.keys(reactionCounts).length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <Badge key={emoji} variant="secondary" className="text-xs">
                {emoji} {count}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
