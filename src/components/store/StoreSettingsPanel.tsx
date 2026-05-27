import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save, ShoppingBag } from 'lucide-react';

interface StoreSettings {
  id?: string;
  child_id: string;
  store_enabled: boolean;
  daily_spending_limit: number | null;
  weekly_spending_limit: number | null;
  approval_threshold: number | null;
  notifications_enabled: boolean;
}

interface Child {
  id: string;
  name: string;
}

export function StoreSettingsPanel() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadSettings();
    }
  }, [selectedChildId]);

  const loadChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('children')
      .select('id, name')
      .eq('parent_id', user.id)
      .order('name');

    if (error) {
      toast.error('Failed to load children');
      return;
    }

    setChildren(data || []);
    if (data && data.length > 0) {
      setSelectedChildId(data[0].id);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('child_id', selectedChildId)
      .single();

    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to load settings');
    }

    setSettings(data || {
      child_id: selectedChildId,
      store_enabled: true,
      daily_spending_limit: null,
      weekly_spending_limit: null,
      approval_threshold: null,
      notifications_enabled: true
    });
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const settingsData = {
      ...settings,
      parent_id: user.id,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('store_settings')
      .upsert(settingsData, { onConflict: 'child_id' });

    if (error) {
      toast.error('Failed to save settings');
    } else {
      toast.success('Settings saved successfully');
    }
    setSaving(false);
  };

  if (children.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Store Settings
          </CardTitle>
          <CardDescription>No children found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Store Parental Controls
        </CardTitle>
        <CardDescription>
          Manage store access and spending limits for your children
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Child</Label>
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {children.map(child => (
                <SelectItem key={child.id} value={child.id}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : settings && (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Store Access</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable store access
                </p>
              </div>
              <Switch
                checked={settings.store_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, store_enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Daily Spending Limit (coins)</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={settings.daily_spending_limit || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    daily_spending_limit: e.target.value ? parseInt(e.target.value) : null
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Weekly Spending Limit (coins)</Label>
              <Input
                type="number"
                placeholder="No limit"
                value={settings.weekly_spending_limit || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    weekly_spending_limit: e.target.value ? parseInt(e.target.value) : null
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Approval Threshold (coins)</Label>
              <Input
                type="number"
                placeholder="No approval required"
                value={settings.approval_threshold || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    approval_threshold: e.target.value ? parseInt(e.target.value) : null
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Purchases above this amount require your approval
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Purchase Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when purchases are made
                </p>
              </div>
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notifications_enabled: checked })
                }
              />
            </div>

            <Button onClick={saveSettings} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
