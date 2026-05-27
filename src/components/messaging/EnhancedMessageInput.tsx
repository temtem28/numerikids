import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Clock, Target, Heart, Trophy, BookOpen } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EnhancedMessageInputProps {
  onSend: (content: string, type?: string, metadata?: any, attachmentUrl?: string) => void;
  onSchedule: (content: string, scheduledFor: Date, type?: string) => void;
  achievements?: any[];
  recentLessons?: any[];
  currentUserId: string;
  receiverId: string;
}

const EMOJI_LIST = ['❤️', '👍', '🎉', '⭐', '🏆', '💪', '🎯', '👏', '🔥', '✨', '🌟', '😊'];
const ENCOURAGEMENT_TEMPLATES = [
  "Great job! Keep up the amazing work! 🌟",
  "I'm so proud of you! You're doing fantastic! 🎉",
  "You're learning so much! Keep going! 💪",
  "Wow! That's incredible progress! 🏆",
  "I believe in you! You can do it! ⭐"
];

export function EnhancedMessageInput({ onSend, onSchedule, achievements = [], recentLessons = [], currentUserId, receiverId }: EnhancedMessageInputProps) {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledMessage, setScheduledMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      onSend(`Shared a file`, 'attachment', { fileName: file.name }, publicUrl);
      toast.success('File uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleScheduleMessage = () => {
    if (!scheduledMessage.trim() || !scheduledDate || !scheduledTime) {
      toast.error('Please fill in all fields');
      return;
    }
    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`);
    onSchedule(scheduledMessage, scheduledFor);
    setScheduleDialogOpen(false);
    setScheduledMessage('');
    setScheduledDate('');
    setScheduledTime('');
    toast.success('Message scheduled!');
  };

  return (
    <div className="border-t p-4 bg-white space-y-2">
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" title="Encouragement templates">
              <Heart className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <h4 className="font-semibold mb-2">Encouragement Messages</h4>
            <div className="space-y-2">
              {ENCOURAGEMENT_TEMPLATES.map((template, idx) => (
                <button key={idx} onClick={() => setMessage(template)} className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm">
                  {template}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" title="Insert emoji">
              <Smile className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="grid grid-cols-6 gap-2">
              {EMOJI_LIST.map((emoji, idx) => (
                <button key={idx} onClick={() => setMessage(prev => prev + emoji)} className="text-2xl hover:bg-gray-100 rounded p-1">
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <label htmlFor="file-upload">
          <Button variant="outline" size="icon" disabled={uploading} asChild>
            <span>
              <Paperclip className="w-4 h-4" />
            </span>
          </Button>
        </label>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" />

        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" title="Schedule message">
              <Clock className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Message</Label>
                <Textarea value={scheduledMessage} onChange={(e) => setScheduledMessage(e.target.value)} placeholder="Type your reminder..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleScheduleMessage} className="w-full">Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" title="Share achievement">
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
                  <button key={ach.id} onClick={() => onSend(`I earned the ${ach.title} achievement!`, 'achievement', { title: ach.title })} className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm">
                    {ach.title}
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
