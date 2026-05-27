import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface CursorPosition {
  userId: string;
  userName: string;
  userEmail: string;
  fieldId: string;
  position: number;
  color: string;
  sessionId: string;
}

const USER_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
];

export const useCursorTracking = (questId: string, sessionId: string, userId: string, userName: string, userEmail: string) => {
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [userColor] = useState(() => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);

  useEffect(() => {
    if (!questId || !sessionId) return;

    const realtimeChannel = supabase.channel(`quest:${questId}:cursors`);

    realtimeChannel
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (payload.userId !== userId) {
          setCursors(prev => {
            const filtered = prev.filter(c => c.userId !== payload.userId);
            return [...filtered, payload as CursorPosition];
          });
        }
      })
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [questId, sessionId, userId]);

  const broadcastCursor = useCallback((fieldId: string, position: number) => {
    if (!channel) return;

    channel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: {
        userId,
        userName,
        userEmail,
        fieldId,
        position,
        color: userColor,
        sessionId,
      },
    });
  }, [channel, userId, userName, userEmail, userColor, sessionId]);

  return { cursors, broadcastCursor, userColor };
};
