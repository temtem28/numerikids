import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function SuspiciousActivityPanel() {
  const [suspicious, setSuspicious] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuspiciousActivity();
  }, []);

  const loadSuspiciousActivity = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: { action: 'getSuspiciousActivity' }
      });

      if (error) throw error;
      setSuspicious(data.suspicious || []);
    } catch (error: any) {
      console.error('Error loading suspicious activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (suspicious.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Activity</CardTitle>
          <CardDescription>No suspicious activity detected</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>All Clear</AlertTitle>
            <AlertDescription>
              No suspicious activity has been detected on your account.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Suspicious Activity Detected
        </CardTitle>
        <CardDescription>
          Review these activities and secure your account if needed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suspicious.map((activity) => (
            <Alert key={activity.id} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center gap-2">
                {activity.activity_type.replace(/_/g, ' ').toUpperCase()}
                <Badge variant="destructive">Suspicious</Badge>
              </AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-1 text-sm">
                  <div>{activity.description}</div>
                  <div className="text-muted-foreground">
                    {format(new Date(activity.created_at), 'PPpp')}
                  </div>
                  {activity.ip_address && (
                    <div className="text-muted-foreground">
                      IP: {activity.ip_address}
                    </div>
                  )}
                  {activity.suspicious_reason && (
                    <div className="text-red-600 font-medium">
                      Reason: {activity.suspicious_reason}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}