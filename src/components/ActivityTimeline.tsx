import React, { useEffect, useState } from 'react';
import { Calendar, Filter, Download, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Activity {
  id: string;
  childId: string;
  childName: string;
  type: string;
  title: string;
  description: string;
  timestamp: Date;
  icon: any;
  color: string;
}

interface ActivityTimelineProps {
  children: any[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ children }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [activityType, setActivityType] = useState<string>('all');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  useEffect(() => {
    fetchActivities();
  }, [children, dateFrom, dateTo, activityType, selectedChild]);

  const fetchActivities = async () => {
    if (children.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const allActivities: Activity[] = [];
    const childIds = selectedChild === 'all' ? children.map(c => c.id) : [selectedChild];

    for (const childId of childIds) {
      const child = children.find(c => c.id === childId);
      if (!child) continue;

      if (activityType === 'all' || activityType === 'achievement') {
        const { data: achievements } = await supabase
          .from('user_achievements')
          .select('*, achievements(*)')
          .eq('user_id', childId)
          .gte('unlocked_at', dateFrom?.toISOString() || '')
          .lte('unlocked_at', dateTo?.toISOString() || '');

        achievements?.forEach(a => {
          allActivities.push({
            id: `ach-${a.id}`,
            childId,
            childName: child.pseudo,
            type: 'achievement',
            title: a.achievements.name,
            description: a.achievements.description,
            timestamp: new Date(a.unlocked_at),
            icon: Trophy,
            color: 'text-yellow-400'
          });
        });
      }
    }

    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setActivities(allActivities);
    setLoading(false);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400">
              <Calendar className="w-4 h-4 mr-2" />
              {dateFrom && format(dateFrom, 'dd/MM/yyyy')} - {dateTo && format(dateTo, 'dd/MM/yyyy')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-slate-900 border-cyan-500/20">
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Du</label>
                <CalendarUI mode="single" selected={dateFrom} onSelect={setDateFrom} locale={fr} />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">Au</label>
                <CalendarUI mode="single" selected={dateTo} onSelect={setDateTo} locale={fr} />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Select value={activityType} onValueChange={setActivityType}>
          <SelectTrigger className="w-48 border-purple-500/50 text-purple-400">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-purple-500/20">
            <SelectItem value="all">Toutes activités</SelectItem>
            <SelectItem value="achievement">Succès</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedChild} onValueChange={setSelectedChild}>
          <SelectTrigger className="w-48 border-green-500/50 text-green-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-green-500/20">
            <SelectItem value="all">Tous les enfants</SelectItem>
            {children.map(child => (
              <SelectItem key={child.id} value={child.id}>{child.pseudo}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={exportToPDF} className="bg-gradient-to-r from-cyan-500 to-purple-500 ml-auto">
          <Download className="w-4 h-4 mr-2" /> Imprimer
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Chargement...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Aucune activité pour cette période</div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex gap-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                <div className={`${activity.color} mt-1`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{activity.childName}</span>
                    <Badge variant="outline" className="text-xs">{activity.type}</Badge>
                  </div>
                  <h4 className="text-cyan-400 font-medium">{activity.title}</h4>
                  <p className="text-slate-400 text-sm">{activity.description}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    {format(activity.timestamp, 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
