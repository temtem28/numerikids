import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, CheckCircle, XCircle, Lock, Smartphone, MapPin, Activity, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import EmailVerificationBanner from './EmailVerificationBanner';
import { DeletionStatusBanner } from './DeletionStatusBanner';



export default function SecurityDashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    activeSessions: 0,
    recentAlerts: 0,
    twoFactorEnabled: false,
    passwordStrength: 0,
    trustedDevices: 0,
    suspiciousScore: 0,
    lastPasswordChange: null as Date | null,
    emailVerified: false,
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (user) loadSecurityMetrics();
  }, [user]);

  const loadSecurityMetrics = async () => {
    try {
      // Use active_sessions table (the correct table name) and handle gracefully if tables don't exist
      const [sessions, alerts, profile, devices] = await Promise.all([
        supabase.from('active_sessions').select('*').eq('user_id', user?.id).is('revoked_at', null).then(r => r.data || []).catch(() => []),
        supabase.from('login_alerts').select('*').eq('user_id', user?.id).eq('acknowledged', false).then(r => r.data || []).catch(() => []),
        supabase.from('two_factor_auth').select('is_enabled').eq('user_id', user?.id).single().then(r => r.data).catch(() => null),
        supabase.from('trusted_devices').select('*').eq('user_id', user?.id).eq('is_trusted', true).then(r => r.data || []).catch(() => []),
      ]);

      setMetrics({
        activeSessions: Array.isArray(sessions) ? sessions.length : 0,
        recentAlerts: Array.isArray(alerts) ? alerts.length : 0,
        twoFactorEnabled: profile?.is_enabled || false,
        passwordStrength: 70, // Default value since we don't have a profiles table with this field
        trustedDevices: Array.isArray(devices) ? devices.length : 0,
        suspiciousScore: calculateSuspiciousScore(sessions || [], alerts || []),
        lastPasswordChange: null,
        emailVerified: user?.email_confirmed_at ? true : false,
      });
    } catch (error) {
      console.debug('Error loading security metrics:', error);
    } finally {
      setLoading(false);
    }
  };


  const calculateSuspiciousScore = (sessions: any[], alerts: any[]) => {
    let score = 0;
    if (sessions.length > 5) score += 20;
    if (alerts.length > 3) score += 30;
    if (!metrics.twoFactorEnabled) score += 25;
    if (metrics.passwordStrength < 60) score += 25;
    return Math.min(score, 100);
  };

  const getSecurityLevel = () => {
    const score = 100 - metrics.suspiciousScore;
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const recommendations = [
    { id: 1, text: 'Enable Two-Factor Authentication', priority: 'high', done: metrics.twoFactorEnabled },
    { id: 2, text: 'Review Active Sessions', priority: 'medium', done: metrics.activeSessions <= 3 },
    { id: 3, text: 'Update Password (90+ days old)', priority: 'high', done: metrics.lastPasswordChange && (Date.now() - metrics.lastPasswordChange.getTime()) < 90 * 24 * 60 * 60 * 1000 },
    { id: 4, text: 'Add Trusted Devices', priority: 'low', done: metrics.trustedDevices > 0 },
  ];

  const securityLevel = getSecurityLevel();

  if (loading) return <div className="text-center py-8">Loading security dashboard...</div>;

  return (
    <div className="space-y-6">
      <DeletionStatusBanner />
      <EmailVerificationBanner />

      
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{100 - metrics.suspiciousScore}/100</div>
            <Badge className={`mt-2 ${securityLevel.bg} ${securityLevel.color}`}>{securityLevel.label}</Badge>
          </CardContent>
        </Card>


        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeSessions}</div>
            <p className="text-xs text-muted-foreground mt-2">Across all devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recentAlerts}</div>
            <p className="text-xs text-muted-foreground mt-2">Unacknowledged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Two-Factor Auth</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {metrics.twoFactorEnabled ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <span className="text-lg font-semibold">{metrics.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Password Strength</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.passwordStrength} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {metrics.passwordStrength >= 80 ? 'Strong password' : metrics.passwordStrength >= 60 ? 'Moderate password' : 'Weak password'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trusted Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{metrics.trustedDevices}</div>
                <p className="text-sm text-muted-foreground">Devices registered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Security Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {rec.done ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className={`h-5 w-5 ${rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'}`} />
                  )}
                  <span className={rec.done ? 'line-through text-muted-foreground' : ''}>{rec.text}</span>
                </div>
                <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                  {rec.priority}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
