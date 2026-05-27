import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Monitor, Smartphone, Tablet, LogOut, MapPin, Globe, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Session {
  id: string;
  device_type: string;
  device_name?: string;
  browser: string;
  browser_version?: string;
  os: string;
  os_version?: string;
  ip_address: string;
  country?: string;
  city?: string;
  is_current: boolean;
  last_activity: string;
  created_at: string;
}

export default function ActiveSessionsManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('revoked_at', null)
        .order('last_activity', { ascending: false });

      if (error) {
        // Table may not exist, show empty state
        console.debug('Sessions table not available');
        setSessions([]);
        return;
      }
      setSessions(data || []);
    } catch (error: any) {
      console.debug('Error loading sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('active_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;
      toast.success('Session revoked successfully');
      loadSessions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const revokeAllOthers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentSession = sessions.find(s => s.is_current);
      
      const { error } = await supabase
        .from('active_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .neq('id', currentSession?.id || '')
        .is('revoked_at', null);

      if (error) throw error;
      toast.success('All other sessions revoked');
      loadSessions();
    } catch (error: any) {
      toast.error(error.message);
    }
  };


  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
      default: return <Monitor className="h-5 w-5" />;
    }
  };

  if (loading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage devices and locations that have access to your account
            </CardDescription>
          </div>
          {sessions.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Revoke All Others
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will log you out from all devices except this one. You'll need to log in again on those devices.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={revokeAllOthers}>Revoke All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No active sessions found
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-muted-foreground mt-1">
                    {getDeviceIcon(session.device_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {session.device_name || `${session.browser} on ${session.os}`}
                      </span>
                      {session.is_current && (
                        <Badge variant="default">Current Session</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <span className="truncate">
                          {session.city && session.country 
                            ? `${session.city}, ${session.country}` 
                            : 'Location unknown'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>IP: {session.ip_address}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Last active: {format(new Date(session.last_activity), 'PPp')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Monitor className="h-3 w-3" />
                        <span className="truncate">
                          {session.browser} {session.browser_version && `v${session.browser_version}`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      Started: {format(new Date(session.created_at), 'PPp')}
                    </div>
                  </div>
                </div>
                {!session.is_current && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will immediately log out this device. You'll need to log in again to access your account from this device.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => revokeSession(session.id)}>
                          Revoke Session
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
