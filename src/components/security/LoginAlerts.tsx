import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { AlertTriangle, MapPin, Monitor, Check } from 'lucide-react';
import { format } from 'date-fns';

interface LoginAlert {
  id: string;
  alert_type: string;
  ip_address: string;
  location: string;
  device_info: string;
  acknowledged: boolean;
  created_at: string;
}

export default function LoginAlerts() {
  const [alerts, setAlerts] = useState<LoginAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('login_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('login_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);

      if (error) throw error;
      toast.success('Alert acknowledged');
      loadAlerts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const acknowledgeAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('login_alerts')
        .update({ acknowledged: true })
        .eq('user_id', user.id)
        .eq('acknowledged', false);

      if (error) throw error;
      toast.success('All alerts acknowledged');
      loadAlerts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'new_location': return <MapPin className="h-5 w-5" />;
      case 'new_device': return <Monitor className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getAlertLabel = (type: string) => {
    switch (type) {
      case 'new_location': return 'New Location';
      case 'new_device': return 'New Device';
      case 'suspicious_activity': return 'Suspicious Activity';
      default: return type;
    }
  };

  if (loading) return <div>Loading...</div>;

  const unacknowledged = alerts.filter(a => !a.acknowledged).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Login Alerts</CardTitle>
            <CardDescription>
              Security notifications for your account
              {unacknowledged > 0 && ` (${unacknowledged} new)`}
            </CardDescription>
          </div>
          {unacknowledged > 0 && (
            <Button variant="outline" size="sm" onClick={acknowledgeAll}>
              <Check className="h-4 w-4 mr-2" />
              Acknowledge All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No security alerts
            </p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start justify-between p-4 border rounded-lg ${
                  !alert.acknowledged ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 dark:text-yellow-500">
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={alert.acknowledged ? 'secondary' : 'default'}>
                        {getAlertLabel(alert.alert_type)}
                      </Badge>
                      {!alert.acknowledged && (
                        <Badge variant="outline" className="text-yellow-600">New</Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium">{alert.location}</p>
                    <p className="text-sm text-muted-foreground">{alert.device_info}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      IP: {alert.ip_address} • {format(new Date(alert.created_at), 'PPpp')}
                    </p>
                  </div>
                </div>
                {!alert.acknowledged && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
