import { useState, useEffect } from 'react';
import { Bell, Volume2, VolumeX, Moon, Mail, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NotificationService, NotificationPreferences } from '@/utils/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    message_notifications: true,
    sound_enabled: true,
    desktop_notifications: true,
    notification_mode: 'all',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    email_enabled: true,
    email_frequency: 'daily',
    email_messages: true,
    email_achievements: true,
    email_activities: true,
    digest_time: '09:00',
    digest_day: 1,
  });

  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPermission();
  }, [user]);

  const checkPermission = () => {
    setPermissionGranted(Notification.permission === 'granted');
  };

  const loadPreferences = async () => {
    if (!user) return;
    const prefs = await NotificationService.getPreferences(user.id);
    if (prefs) {
      setPreferences(prefs);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await NotificationService.requestPermission();
    setPermissionGranted(granted);
    if (granted) {
      toast.success('Notification permission granted');
    } else {
      toast.error('Notification permission denied');
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await NotificationService.savePreferences(user.id, preferences);
      toast.success('Notification settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleTestNotification = async () => {
    await NotificationService.showNotification(
      'Test Notification',
      { body: 'This is a test notification from KidCode Academy', icon: '/placeholder.svg' },
      preferences
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Customize how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!permissionGranted && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-2">
              Browser notifications are not enabled. Click below to enable them.
            </p>
            <Button onClick={handleRequestPermission} size="sm">
              Enable Notifications
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="message-notifications" className="flex flex-col gap-1">
              <span>Message Notifications</span>
              <span className="text-sm text-muted-foreground font-normal">
                Receive notifications for new messages
              </span>
            </Label>
            <Switch
              id="message-notifications"
              checked={preferences.message_notifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, message_notifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled" className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                {preferences.sound_enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                Sound Alerts
              </span>
              <span className="text-sm text-muted-foreground font-normal">
                Play sound when notifications arrive
              </span>
            </Label>
            <Switch
              id="sound-enabled"
              checked={preferences.sound_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, sound_enabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="desktop-notifications" className="flex flex-col gap-1">
              <span>Desktop Notifications</span>
              <span className="text-sm text-muted-foreground font-normal">
                Show browser notifications
              </span>
            </Label>
            <Switch
              id="desktop-notifications"
              checked={preferences.desktop_notifications}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, desktop_notifications: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Notification Mode</Label>
            <Select
              value={preferences.notification_mode}
              onValueChange={(value: any) =>
                setPreferences({ ...preferences, notification_mode: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="offline">Only When Offline</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours" className="flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Quiet Hours
              </span>
              <span className="text-sm text-muted-foreground font-normal">
                Disable notifications during specific hours
              </span>
            </Label>
            <Switch
              id="quiet-hours"
              checked={preferences.quiet_hours_enabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, quiet_hours_enabled: checked })
              }
            />
          </div>

          {preferences.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4 pl-6">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(e) =>
                    setPreferences({ ...preferences, quiet_hours_start: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(e) =>
                    setPreferences({ ...preferences, quiet_hours_end: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          )}

          {/* Email Notifications Section */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Notifications
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-enabled" className="flex flex-col gap-1">
                  <span>Email Notifications</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    Receive email updates about activities
                  </span>
                </Label>
                <Switch
                  id="email-enabled"
                  checked={preferences.email_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, email_enabled: checked })
                  }
                />
              </div>

              {preferences.email_enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Email Frequency</Label>
                    <Select
                      value={preferences.email_frequency}
                      onValueChange={(value: any) =>
                        setPreferences({ ...preferences, email_frequency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 pl-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="email-messages"
                        checked={preferences.email_messages}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, email_messages: checked })
                        }
                      />
                      <Label htmlFor="email-messages">New Messages</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="email-achievements"
                        checked={preferences.email_achievements}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, email_achievements: checked })
                        }
                      />
                      <Label htmlFor="email-achievements">Achievements</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="email-activities"
                        checked={preferences.email_activities}
                        onCheckedChange={(checked) =>
                          setPreferences({ ...preferences, email_activities: checked })
                        }
                      />
                      <Label htmlFor="email-activities">Learning Activities</Label>
                    </div>
                  </div>

                  {(preferences.email_frequency === 'daily' || preferences.email_frequency === 'weekly') && (
                    <div className="space-y-4 pl-4">
                      <div className="space-y-2">
                        <Label htmlFor="digest-time" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Digest Time
                        </Label>
                        <input
                          id="digest-time"
                          type="time"
                          value={preferences.digest_time}
                          onChange={(e) =>
                            setPreferences({ ...preferences, digest_time: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-md"
                        />
                      </div>
                      
                      {preferences.email_frequency === 'weekly' && (
                        <div className="space-y-2">
                          <Label>Day of Week</Label>
                          <Select
                            value={preferences.digest_day.toString()}
                            onValueChange={(value) =>
                              setPreferences({ ...preferences, digest_day: parseInt(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Monday</SelectItem>
                              <SelectItem value="2">Tuesday</SelectItem>
                              <SelectItem value="3">Wednesday</SelectItem>
                              <SelectItem value="4">Thursday</SelectItem>
                              <SelectItem value="5">Friday</SelectItem>
                              <SelectItem value="6">Saturday</SelectItem>
                              <SelectItem value="7">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>


        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Settings
          </Button>
          <Button onClick={handleTestNotification} variant="outline">
            Test Notification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
