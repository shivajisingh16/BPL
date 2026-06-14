import { useApi } from '../hooks/useApi';
import { leaderboardService } from '../services/leaderboard.service';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/ErrorState';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { GlassCard } from '../components/ui/GlassCard';

export default function Leaderboard() {
  const { data, loading, error, refetch } = useApi(() => leaderboardService.get(), []);

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        icon="🏅"
        subtitle="Ranked by wins, then total kills, then headshots."
      />

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : loading || !data ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          <LeaderboardTable rows={data} />
          <GlassCard className="mt-6 p-4 text-sm text-slate-400">
            <span className="font-semibold text-slate-300">Tie-break order:</span> Points → Total
            Kills → Headshots. Each completed match records kills &amp; headshots for both players,
            credited to their own totals.
          </GlassCard>
        </>
      )}
    </div>
  );
}
