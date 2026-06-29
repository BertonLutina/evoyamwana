import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

interface OfflineSyncBannerProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing?: boolean;
  onSync?: () => void;
}

export const OfflineSyncBanner = ({ isOnline, pendingCount, isSyncing = false, onSync }: OfflineSyncBannerProps) => {
  const hasPending = pendingCount > 0;

  return (
    <div className={`rounded-lg border px-4 py-3 shadow-sm ${isOnline ? 'border-ocean/10 bg-white' : 'border-ember/30 bg-amber-50'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 rounded-md p-2 ${isOnline ? 'bg-sky text-ocean' : 'bg-white text-ember'}`}>
            {isOnline ? <Cloud size={18} /> : <CloudOff size={18} />}
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{isOnline ? 'Connexion active' : 'Mode hors ligne'}</p>
            <p className="mt-1 text-xs leading-5 text-ink/60">
              {hasPending
                ? `${pendingCount} registre${pendingCount > 1 ? 's' : ''} en attente de synchronisation.`
                : isOnline
                  ? 'Les données sont envoyées directement vers l’API.'
                  : 'Vous pouvez continuer à marquer les présences; elles seront envoyées au retour du réseau.'}
            </p>
          </div>
        </div>
        {hasPending && onSync ? (
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ocean px-4 text-sm font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onSync}
            disabled={!isOnline || isSyncing}
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Synchronisation...' : 'Synchroniser'}
          </button>
        ) : null}
      </div>
    </div>
  );
};
