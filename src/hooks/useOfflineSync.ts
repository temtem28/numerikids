import { useState, useEffect } from 'react';
import { offlineStorage } from '@/utils/offlineStorage';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast.success('Back online! Syncing your progress...');
      await syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.info('You\'re offline. Progress will be saved locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending actions on mount
    checkPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingActions = async () => {
    const queue = await offlineStorage.getSyncQueue();
    setPendingActions(queue.length);
  };

  const syncOfflineData = async () => {
    setIsSyncing(true);
    try {
      const queue = await offlineStorage.getSyncQueue();
      
      for (const action of queue) {
        await processAction(action);
      }

      await offlineStorage.clearSyncQueue();
      setPendingActions(0);
      toast.success('All progress synced successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Some items failed to sync. Will retry later.');
    } finally {
      setIsSyncing(false);
    }
  };

  const processAction = async (action: any) => {
    switch (action.type) {
      case 'progress':
        await supabase.from('user_progress').upsert(action.data);
        break;
      case 'achievement':
        await supabase.from('user_achievements').insert(action.data);
        break;
      case 'coins':
        await supabase.from('child_coins').upsert(action.data);
        break;
    }
  };

  return { isOnline, isSyncing, pendingActions, syncOfflineData };
}
