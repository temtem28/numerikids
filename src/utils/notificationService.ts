import { supabase } from '@/lib/supabase';

export interface NotificationPreferences {
  message_notifications: boolean;
  sound_enabled: boolean;
  desktop_notifications: boolean;
  notification_mode: 'all' | 'offline' | 'none';
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  email_enabled: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly' | 'none';
  email_messages: boolean;
  email_achievements: boolean;
  email_activities: boolean;
  digest_time: string;
  digest_day: number;
}

export interface EmailQueueItem {
  user_id: string;
  email_type: 'immediate' | 'daily_digest' | 'weekly_digest';
  subject: string;
  content: {
    messages?: Array<{ from: string; text: string; timestamp: string }>;
    achievements?: Array<{ title: string; description: string; timestamp: string }>;
    activities?: Array<{ description: string; timestamp: string }>;
  };
  scheduled_for?: string;
}


export class NotificationService {
  private static audioContext: AudioContext | null = null;

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  static async playNotificationSound() {
    try {
      // Create a simple beep sound
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  static isInQuietHours(prefs: NotificationPreferences): boolean {
    if (!prefs.quiet_hours_enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = prefs.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = prefs.quiet_hours_end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  static async showNotification(title: string, options: NotificationOptions, prefs: NotificationPreferences) {
    if (prefs.notification_mode === 'none') return;
    if (this.isInQuietHours(prefs)) return;

    if (prefs.notification_mode === 'offline' && document.visibilityState === 'visible') {
      return;
    }

    if (prefs.desktop_notifications && Notification.permission === 'granted') {
      new Notification(title, options);
    }

    if (prefs.sound_enabled) {
      await this.playNotificationSound();
    }
  }

  static async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching preferences:', error);
      return null;
    }

    return data || null;
  }

  static async savePreferences(userId: string, prefs: Partial<NotificationPreferences>) {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: userId, ...prefs, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }


  static async queueEmail(
    recipientEmail: string, 
    templateName: string, 
    variables: Record<string, any>,
    scheduledFor?: string
  ) {
    const { error } = await supabase
      .from('email_queue')
      .insert({
        recipient_email: recipientEmail,
        template_name: templateName,
        template_variables: variables,
        scheduled_for: scheduledFor || new Date().toISOString(),
        status: 'pending'
      });

    if (error) {
      console.error('Error queueing email:', error);
      throw error;
    }
  }


  static async queueMessageEmail(userId: string, senderName: string, messageText: string, prefs: NotificationPreferences) {
    if (!prefs.email_enabled || !prefs.email_messages) return;
    if (prefs.email_frequency === 'none') return;

    const emailItem: EmailQueueItem = {
      user_id: userId,
      email_type: prefs.email_frequency === 'immediate' ? 'immediate' : 'daily_digest',
      subject: prefs.email_frequency === 'immediate' 
        ? `New message from ${senderName}` 
        : 'Daily Activity Summary - PixelWizard Academy',
      content: {
        messages: [{
          from: senderName,
          text: messageText,
          timestamp: new Date().toISOString()
        }]
      }
    };

    if (prefs.email_frequency !== 'immediate') {
      const scheduledTime = this.calculateDigestTime(prefs);
      emailItem.scheduled_for = scheduledTime;
    }

    await this.queueEmail(emailItem);
  }

  static calculateDigestTime(prefs: NotificationPreferences): string {
    const now = new Date();
    const [hours, minutes] = prefs.digest_time.split(':').map(Number);

    if (prefs.email_frequency === 'daily') {
      const scheduled = new Date(now);
      scheduled.setHours(hours, minutes, 0, 0);
      if (scheduled <= now) {
        scheduled.setDate(scheduled.getDate() + 1);
      }
      return scheduled.toISOString();
    } else if (prefs.email_frequency === 'weekly') {
      const scheduled = new Date(now);
      const currentDay = scheduled.getDay() || 7;
      const daysUntilDigest = (prefs.digest_day - currentDay + 7) % 7 || 7;
      scheduled.setDate(scheduled.getDate() + daysUntilDigest);
      scheduled.setHours(hours, minutes, 0, 0);
      return scheduled.toISOString();
    }

    return now.toISOString();
  }
}

