import { useEffect, useState, type FormEvent } from 'react';
import type { Match, MatchStatus, UpdateMatchInput } from '../../types';
import { matchService } from '../../services/match.service';
import { ApiError } from '../../services/apiClient';
import { Spinner } from '../ui/Spinner';

interface MatchEditModalProps {
  match: Match;
  /** For playoff matches: whether both participants are decided yet. */
  ready?: boolean;
  onClose: () => void;
  /** Called with the updated match after a successful save. */
  onSaved: (updated: Match) => void;
}

export function MatchEditModal({ match, ready = true, onClose, onSaved }: MatchEditModalProps) {
  const isPlayoff = match.stage === 'playoff';
  const canComplete = !isPlayoff || ready;

  const [status, setStatus] = useState<MatchStatus>(match.status);
  const [winner, setWinner] = useState<string>(match.winner ?? '');
  const [p1Kills, setP1Kills] = useState<string>(match.player1Kills?.toString() ?? '0');
  const [p1Headshots, setP1Headshots] = useState<string>(match.player1Headshots?.toString() ?? '0');
  const [p2Kills, setP2Kills] = useState<string>(match.player2Kills?.toString() ?? '0');
  const [p2Headshots, setP2Headshots] = useState<string>(match.player2Headshots?.toString() ?? '0');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // League matches can be abandoned; playoff matches cannot.
  const statuses: MatchStatus[] = isPlayoff
    ? ['scheduled', 'completed']
    : ['scheduled', 'completed', 'abandoned'];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (status === 'completed' && !winner) {
      setError('Please select a winner to complete the match.');
      return;
    }

    let payload: UpdateMatchInput;
    if (status === 'completed') {
      payload = {
        status,
        winner,
        player1Kills: Number(p1Kills) || 0,
        player1Headshots: Number(p1Headshots) || 0,
        player2Kills: Number(p2Kills) || 0,
        player2Headshots: Number(p2Headshots) || 0,
      };
    } else {
      payload = { status }; // scheduled or abandoned — no result fields
    }

    setSaving(true);
    try {
      const updated = await matchService.update(match.id, payload);
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save the result.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onMouseDown={onClose}
    >
      <div
        className="glass w-full max-w-md p-6 animate-fade-up"
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {match.round ? `Playoffs · ${match.round}` : `Match #${match.id} · Day ${match.day}`}
            </p>
            <h3 className="font-display text-xl font-bold text-white">
              {match.player1} <span className="text-neon-purple">vs</span> {match.player2}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
            ✕
          </button>
        </div>

        {isPlayoff && !ready && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
            Participants aren't decided yet. Finish the league stage and any preceding playoff
            matches before recording a result here.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status */}
          <div>
            <span className="label">Status</span>
            <div className={`grid gap-2 ${statuses.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {statuses.map((s) => {
                const disabled = s === 'completed' && !canComplete;
                return (
                  <button
                    type="button"
                    key={s}
                    disabled={disabled}
                    onClick={() => setStatus(s)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition-all ${
                      status === s
                        ? 'border-neon-purple/60 bg-neon-purple/15 text-white shadow-neon-purple'
                        : 'border-white/10 text-slate-400 hover:text-white'
                    } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result fields — only when completing */}
          {status === 'completed' && (
            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="winner">
                  Winner
                </label>
                <select
                  id="winner"
                  className="input-field"
                  value={winner}
                  onChange={(e) => setWinner(e.target.value)}
                >
                  <option value="">— Select winner —</option>
                  <option value={match.player1}>{match.player1}</option>
                  <option value={match.player2}>{match.player2}</option>
                </select>
              </div>

              {/* Per-player kills & headshots — recorded for BOTH players */}
              <PlayerResultFields
                name={match.player1}
                kills={p1Kills}
                headshots={p1Headshots}
                onKills={setP1Kills}
                onHeadshots={setP1Headshots}
                idPrefix="p1"
              />
              <PlayerResultFields
                name={match.player2}
                kills={p2Kills}
                headshots={p2Headshots}
                onKills={setP2Kills}
                onHeadshots={setP2Headshots}
                idPrefix="p2"
              />
              <p className="text-xs text-slate-500">
                Enter kills &amp; headshots for both players. Headshots cannot exceed kills. Winner
                earns 2 points.
              </p>
            </div>
          )}

          {status === 'abandoned' && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              ⊘ No result — <strong>both players receive 1 point</strong> and the match counts as
              played.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-neon flex-1" disabled={saving}>
              {saving ? (
                <>
                  <Spinner className="h-4 w-4" /> Saving…
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Kills + headshots inputs for a single player. */
function PlayerResultFields({
  name,
  kills,
  headshots,
  onKills,
  onHeadshots,
  idPrefix,
}: {
  name: string;
  kills: string;
  headshots: string;
  onKills: (v: string) => void;
  onHeadshots: (v: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="mb-2 truncate font-display text-sm font-semibold text-slate-200" title={name}>
        {name}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor={`${idPrefix}-kills`}>
            Kills
          </label>
          <input
            id={`${idPrefix}-kills`}
            type="number"
            min={0}
            className="input-field"
            value={kills}
            onChange={(e) => onKills(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor={`${idPrefix}-headshots`}>
            Headshots
          </label>
          <input
            id={`${idPrefix}-headshots`}
            type="number"
            min={0}
            className="input-field"
            value={headshots}
            onChange={(e) => onHeadshots(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
