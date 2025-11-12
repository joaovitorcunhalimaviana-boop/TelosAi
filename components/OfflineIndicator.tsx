'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { syncPendingPatients, getPendingPatients } from '@/lib/offline-storage';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [showIndicator, setShowIndicator] = useState(false);

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      setShowIndicator(!navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Check pending patients count
  useEffect(() => {
    const checkPendingPatients = async () => {
      try {
        const pending = await getPendingPatients();
        setPendingCount(pending.length);

        // Show indicator if there are pending patients
        if (pending.length > 0) {
          setShowIndicator(true);
        }
      } catch (error) {
        console.error('Error checking pending patients:', error);
      }
    };

    checkPendingPatients();

    // Check every 30 seconds
    const interval = setInterval(checkPendingPatients, 30000);

    return () => clearInterval(interval);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      if (pendingCount > 0) {
        await handleSync();
      }
    };

    if (isOnline && pendingCount > 0) {
      // Wait a bit for connection to stabilize
      const timeout = setTimeout(handleOnline, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isOnline, pendingCount]);

  // Listen for service worker sync messages
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_SUCCESS') {
          setSyncStatus('success');
          setTimeout(() => setSyncStatus('idle'), 3000);

          // Recheck pending patients
          getPendingPatients().then(pending => {
            setPendingCount(pending.length);
            if (pending.length === 0) {
              setTimeout(() => setShowIndicator(false), 3000);
            }
          });
        }
      });
    }
  }, []);

  const handleSync = async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      const results = await syncPendingPatients();

      if (results.success > 0) {
        setSyncStatus('success');
        const remaining = await getPendingPatients();
        setPendingCount(remaining.length);

        if (remaining.length === 0) {
          setTimeout(() => setShowIndicator(false), 3000);
        }
      } else if (results.failed > 0) {
        setSyncStatus('error');
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDismiss = () => {
    if (!isSyncing && pendingCount === 0) {
      setShowIndicator(false);
    }
  };

  if (!showIndicator) return null;

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300"
      role="alert"
      aria-live="polite"
    >
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
        ${!isOnline
          ? 'bg-orange-50 border-orange-200 text-orange-900'
          : pendingCount > 0
          ? 'bg-blue-50 border-blue-200 text-blue-900'
          : 'bg-green-50 border-green-200 text-green-900'
        }
      `}>
        {/* Icon */}
        <div className="flex-shrink-0">
          {!isOnline && (
            <WifiOff className="w-5 h-5 text-orange-600" />
          )}
          {isOnline && syncStatus === 'syncing' && (
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
          )}
          {isOnline && syncStatus === 'success' && (
            <Check className="w-5 h-5 text-green-600" />
          )}
          {isOnline && syncStatus === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          {isOnline && syncStatus === 'idle' && pendingCount > 0 && (
            <AlertCircle className="w-5 h-5 text-blue-600" />
          )}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {!isOnline && 'Você está offline'}
            {isOnline && syncStatus === 'syncing' && 'Sincronizando dados...'}
            {isOnline && syncStatus === 'success' && 'Sincronização concluída!'}
            {isOnline && syncStatus === 'error' && 'Erro ao sincronizar'}
            {isOnline && syncStatus === 'idle' && pendingCount > 0 && (
              `${pendingCount} ${pendingCount === 1 ? 'paciente pendente' : 'pacientes pendentes'}`
            )}
          </p>
          {!isOnline && (
            <p className="text-xs mt-0.5 opacity-90">
              Dados serão salvos e enviados quando conectar
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isOnline && pendingCount > 0 && syncStatus === 'idle' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={isSyncing}
              className="h-7 text-xs border-blue-300 hover:bg-blue-100"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Sincronizar
            </Button>
          )}

          {(syncStatus === 'success' || (isOnline && pendingCount === 0)) && (
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
