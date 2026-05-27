import { useOfflineSync } from '@/hooks/useOfflineSync';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingActions, syncOfflineData } = useOfflineSync();

  if (isOnline && pendingActions === 0 && !isSyncing) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-orange-500" />
          )}
          
          <div className="flex-1">
            <p className="font-medium text-sm">
              {isOnline ? 'Online' : 'Offline Mode'}
            </p>
            {pendingActions > 0 && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {pendingActions} action{pendingActions !== 1 ? 's' : ''} pending
              </p>
            )}
          </div>

          {isOnline && pendingActions > 0 && (
            <Button
              size="sm"
              onClick={syncOfflineData}
              disabled={isSyncing}
              className="gap-2"
            >
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Sync'
              )}
            </Button>
          )}
        </div>

        {!isOnline && (
          <Badge variant="outline" className="mt-2 w-full justify-center">
            Progress saved locally
          </Badge>
        )}
      </div>
    </div>
  );
}
