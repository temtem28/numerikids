import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Clock, Bell, LogOut } from 'lucide-react';

export default function SessionPreferences() {
  const [preferences, setPreferences] = useState({
    session_timeout_minutes: 10080,
    alert_new_location: true,
    alert_new_device: true,
    auto_logout_inactive: false,
    inactive_timeout_minutes: 30,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('session_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('session_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Preferences saved successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session Preferences
        </CardTitle>
        <CardDescription>
          Configure session timeout and security alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Session Timeout</Label>
            <Select
              value={preferences.session_timeout_minutes.toString()}
              onValueChange={(v) => setPreferences({ ...preferences, session_timeout_minutes: parseInt(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="1440">1 day</SelectItem>
                <SelectItem value="10080">7 days</SelectItem>
                <SelectItem value="43200">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alert on New Location</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when logging in from a new location
              </p>
            </div>
            <Switch
              checked={preferences.alert_new_location}
              onCheckedChange={(v) => setPreferences({ ...preferences, alert_new_location: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alert on New Device</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when logging in from a new device
              </p>
            </div>
            <Switch
              checked={preferences.alert_new_device}
              onCheckedChange={(v) => setPreferences({ ...preferences, alert_new_device: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Logout When Inactive</Label>
              <p className="text-sm text-muted-foreground">
                Automatically log out after period of inactivity
              </p>
            </div>
            <Switch
              checked={preferences.auto_logout_inactive}
              onCheckedChange={(v) => setPreferences({ ...preferences, auto_logout_inactive: v })}
            />
          </div>

          {preferences.auto_logout_inactive && (
            <div>
              <Label>Inactivity Timeout</Label>
              <Select
                value={preferences.inactive_timeout_minutes.toString()}
                onValueChange={(v) => setPreferences({ ...preferences, inactive_timeout_minutes: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}
