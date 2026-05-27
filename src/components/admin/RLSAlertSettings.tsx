import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Bell, Mail, Plus, Trash2 } from 'lucide-react';

interface AlertPreference {
  id: string;
  admin_email: string;
  alert_on_failure: boolean;
  alert_on_error: boolean;
  daily_summary: boolean;
}

export default function RLSAlertSettings() {
  const [preferences, setPreferences] = useState<AlertPreference[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('rls_alert_preferences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPreferences(data || []);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    try {
      const { error } = await supabase
        .from('rls_alert_preferences')
        .insert({
          admin_email: newEmail,
          alert_on_failure: true,
          alert_on_error: true,
          daily_summary: true
        });

      if (error) throw error;
      toast.success('Email added successfully');
      setNewEmail('');
      await loadPreferences();
    } catch (error) {
      toast.error('Failed to add email');
    }
  };

  const updatePreference = async (id: string, field: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from('rls_alert_preferences')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Preference updated');
      await loadPreferences();
    } catch (error) {
      toast.error('Failed to update preference');
    }
  };

  const removeEmail = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rls_alert_preferences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Email removed');
      await loadPreferences();
    } catch (error) {
      toast.error('Failed to remove email');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alert Notifications
          </CardTitle>
          <CardDescription>
            Configure who receives alerts when RLS security tests fail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <Button onClick={addEmail} className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-3">
            {preferences.map(pref => (
              <Card key={pref.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{pref.admin_email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEmail(pref.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`failure-${pref.id}`}>Alert on Test Failures</Label>
                      <Switch
                        id={`failure-${pref.id}`}
                        checked={pref.alert_on_failure}
                        onCheckedChange={(checked) => 
                          updatePreference(pref.id, 'alert_on_failure', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor={`error-${pref.id}`}>Alert on System Errors</Label>
                      <Switch
                        id={`error-${pref.id}`}
                        checked={pref.alert_on_error}
                        onCheckedChange={(checked) => 
                          updatePreference(pref.id, 'alert_on_error', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor={`summary-${pref.id}`}>Daily Summary Report</Label>
                      <Switch
                        id={`summary-${pref.id}`}
                        checked={pref.daily_summary}
                        onCheckedChange={(checked) => 
                          updatePreference(pref.id, 'daily_summary', checked)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}