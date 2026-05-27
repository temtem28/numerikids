import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Clock, TrendingUp, Users, Calendar } from 'lucide-react';
import { SendTimeHeatmap } from './SendTimeHeatmap';

export const SendTimeOptimizer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [optimalTimes, setOptimalTimes] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<number[][]>(Array(7).fill(null).map(() => Array(24).fill(0)));
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
    loadOptimalTimes();
  }, []);

  const loadUsers = async () => {
    const { data } = await supabase.from('children').select('id, name').limit(20);
    setUsers(data || []);
  };

  const loadOptimalTimes = async () => {
    const { data } = await supabase
      .from('optimal_send_times')
      .select('*')
      .order('confidence_score', { ascending: false })
      .limit(10);
    setOptimalTimes(data || []);
  };

  const analyzeUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-time-optimizer', {
        body: { action: 'analyze_user', userId: selectedUser, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      });
      
      if (data?.all_patterns) {
        const heatmap = Array(7).fill(null).map(() => Array(24).fill(0));
        data.all_patterns.forEach((p: any) => {
          heatmap[p.day_of_week][p.hour_of_day] = p.engagement_score || 0;
        });
        setHeatmapData(heatmap);
      }
      
      await loadOptimalTimes();
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Send Time Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={analyzeUser} disabled={!selectedUser || loading}>
              {loading ? 'Analyzing...' : 'Analyze Patterns'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SendTimeHeatmap data={heatmapData} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Optimal Send Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {optimalTimes.map((time, idx) => (
              <div key={time.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-blue-600">#{idx + 1}</div>
                  <div>
                    <div className="font-medium">
                      {days[time.optimal_day_of_week]} at {time.optimal_hour}:00
                    </div>
                    <div className="text-sm text-gray-600">
                      {time.timezone} • {time.data_points} data points
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Predicted Open Rate</div>
                    <div className="text-lg font-semibold text-green-600">
                      {time.predicted_open_rate}%
                    </div>
                  </div>
                  <Badge variant={time.confidence_score > 70 ? 'default' : 'secondary'}>
                    {time.confidence_score}% confidence
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};