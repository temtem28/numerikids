import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Activity } from 'lucide-react';

interface ActivityItem {
  id: string;
  user_email: string;
  user_name?: string;
  action_type: string;
  description: string;
  created_at: string;
}

interface ActivityFeedProps {
  questId: string;
}

const actionColors: Record<string, string> = {
  created: 'bg-green-500',
  updated: 'bg-blue-500',
  deleted: 'bg-red-500',
  commented: 'bg-purple-500',
  published: 'bg-indigo-500',
  rolled_back: 'bg-orange-500'
};

export function ActivityFeed({ questId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const fetchActivities = async () => {
    const { data } = await supabase.functions.invoke('saga-collaboration', {
      body: { action: 'getActivity', questId }
    });
    if (data?.success) setActivities(data.data);
  };

  useEffect(() => {
    fetchActivities();
    const channel = supabase
      .channel(`activity-${questId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'saga_activity_feed',
        filter: `quest_id=eq.${questId}`
      }, fetchActivities)
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [questId]);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5" />
        <h3 className="font-semibold">Recent Activity</h3>
      </div>
      <ScrollArea className="h-64">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 items-start">
              <div className={`w-2 h-2 rounded-full mt-2 ${actionColors[activity.action_type] || 'bg-gray-500'}`} />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user_name || activity.user_email.split('@')[0]}</span>
                  {' '}{activity.description}
                </p>
                <span className="text-xs text-gray-500">{new Date(activity.created_at).toLocaleString()}</span>
              </div>
              <Badge variant="outline" className="text-xs">{activity.action_type}</Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
