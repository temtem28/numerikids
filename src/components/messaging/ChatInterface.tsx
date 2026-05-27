import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { NotificationService } from '@/utils/notificationService';
import { MessageBubble } from './MessageBubble';
import { EnhancedMessageInput } from './EnhancedMessageInput';
import { GoalSettingDialog } from './GoalSettingDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  userRole?: 'parent' | 'child';
}

export function ChatInterface({ currentUserId, otherUserId, otherUserName, otherUserAvatar, userRole = 'child' }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [recentLessons, setRecentLessons] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadShareableContent();
    subscribeToMessages();
    markMessagesAsRead();
  }, [currentUserId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, reactions:message_reactions(*)')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  };

  const loadShareableContent = async () => {
    const { data: achData } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', currentUserId)
      .limit(10);
    
    if (achData) {
      setAchievements(achData.map(ua => ua.achievement));
    }

    const { data: lessonData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('completed', true)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (lessonData) {
      setRecentLessons(lessonData);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new as any;
          if ((newMsg.sender_id === currentUserId && newMsg.receiver_id === otherUserId) ||
              (newMsg.sender_id === otherUserId && newMsg.receiver_id === currentUserId)) {
            setMessages(prev => [...prev, { ...newMsg, reactions: [] }]);
            if (newMsg.receiver_id === currentUserId) {
              markMessageAsRead(newMsg.id);
            }
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  const markMessagesAsRead = async () => {
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);
  };

  const markMessageAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', messageId);
  };

  const handleSendMessage = async (content: string, type = 'text', metadata = {}, attachmentUrl?: string) => {
    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content,
      message_type: type,
      metadata,
      attachment_url: attachmentUrl || null
    });

    if (error) console.error('Error sending message:', error);
  };

  const handleScheduleMessage = async (content: string, scheduledFor: Date, type = 'text') => {
    const { error } = await supabase.from('scheduled_messages').insert({
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content,
      message_type: type,
      scheduled_for: scheduledFor.toISOString()
    });

    if (error) console.error('Error scheduling message:', error);
  };

  const handleReact = async (messageId: string, emoji: string) => {
    await supabase.from('message_reactions').insert({
      message_id: messageId,
      user_id: currentUserId,
      emoji
    });
    loadMessages();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherUserAvatar} />
            <AvatarFallback>{otherUserName[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold">{otherUserName}</h3>
        </div>
        {userRole === 'parent' && (
          <GoalSettingDialog childId={otherUserId} parentId={currentUserId} onGoalCreated={loadMessages} />
        )}
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === currentUserId} onReact={(emoji) => handleReact(msg.id, emoji)} />
        ))}
      </ScrollArea>
      <EnhancedMessageInput 
        onSend={handleSendMessage} 
        onSchedule={handleScheduleMessage}
        achievements={achievements} 
        recentLessons={recentLessons}
        currentUserId={currentUserId}
        receiverId={otherUserId}
      />
    </div>
  );
}
