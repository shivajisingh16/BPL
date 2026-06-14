import { useApi } from '../hooks/useApi';
import { playerService } from '../services/player.service';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { PlayerCard } from '../components/PlayerCard';

export default function PlayerStats() {
  const { data, loading, error, refetch } = useApi(() => playerService.getStats(), []);

  return (
    <div>
      <PageHeader
        title="Player Statistics"
        icon="👥"
        subtitle="Live performance metrics for all 8 competitors, ranked by tournament standing."
      />

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : loading || !data ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((p) => (
            <PlayerCard key={p.id} stats={p} />
          ))}
        </div>
      )}
    </div>
  );
}
