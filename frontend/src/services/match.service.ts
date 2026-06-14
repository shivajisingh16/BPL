import { apiClient } from './apiClient';
import type { Match, MatchDayGroup, PlayoffMatch, TournamentSummary, UpdateMatchInput } from '../types';

export const matchService = {
  getAll: () => apiClient.get<Match[]>('/matches'),
  getGroupedByDay: () => apiClient.get<MatchDayGroup[]>('/matches/grouped'),
  getPlayoffs: () => apiClient.get<PlayoffMatch[]>('/matches/playoffs'),
  getUpcoming: (limit = 8) => apiClient.get<Match[]>(`/matches/upcoming?limit=${limit}`),
  getSummary: () => apiClient.get<TournamentSummary>('/matches/summary'),
  getById: (id: number) => apiClient.get<Match>(`/matches/${id}`),
  update: (id: number, input: UpdateMatchInput) => apiClient.put<Match>(`/matches/${id}`, input),
};
