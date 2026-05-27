import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

interface ActiveUser {
  id: string;
  user_email: string;
  user_name?: string;
  editing_section?: string;
  last_active: string;
}

interface CollaborationPresenceProps {
  questId: string;
  currentUserId: string;
}

export function CollaborationPresence({ questId, currentUserId }: CollaborationPresenceProps) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  useEffect(() => {
    const fetchActiveSessions = async () => {
      const { data } = await supabase.functions.invoke('saga-collaboration', {
        body: { action: 'getActiveSessions', questId }
      });
      if (data?.success) {
        setActiveUsers(data.data.filter((u: any) => u.user_id !== currentUserId));
      }
    };

    fetchActiveSessions();
    const interval = setInterval(fetchActiveSessions, 5000);

    const channel = supabase
      .channel(`quest-${questId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'saga_collaboration_sessions',
        filter: `quest_id=eq.${questId}`
      }, fetchActiveSessions)
      .subscribe();

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [questId, currentUserId]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b">
      <span className="text-sm text-gray-600">Currently editing:</span>
      <div className="flex -space-x-2">
        {activeUsers.map((user) => (
          <Avatar key={user.id} className="border-2 border-white w-8 h-8">
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {(user.user_name || user.user_email).substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex gap-1">
        {activeUsers.map((user) => (
          <Badge key={user.id} variant="secondary" className="text-xs">
            {user.user_name || user.user_email.split('@')[0]}
            {user.editing_section && ` • ${user.editing_section}`}
          </Badge>
        ))}
      </div>
    </div>
  );
}
