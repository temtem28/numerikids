import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CheckCircle, Monitor, Smartphone, Tablet } from 'lucide-react';
import { format } from 'date-fns';

export default function LoginHistoryView() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('session-manager', {
        body: { action: 'getLoginHistory', limit: 50 }
      });

      if (error) throw error;
      setHistory(data.history || []);
    } catch (error: any) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login History</CardTitle>
        <CardDescription>
          Recent login attempts and activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((login) => (
            <div
              key={login.id}
              className={`p-4 border rounded-lg ${
                login.is_suspicious ? 'border-red-300 bg-red-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getDeviceIcon(login.device_type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {login.browser} on {login.os}
                      </span>
                      {login.success ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                      {login.is_suspicious && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Suspicious
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(new Date(login.login_at), 'PPpp')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      IP: {login.ip_address}
                    </div>
                    {!login.success && login.failure_reason && (
                      <div className="text-sm text-red-600 mt-1">
                        Reason: {login.failure_reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}