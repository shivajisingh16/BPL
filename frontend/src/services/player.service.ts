import { apiClient } from './apiClient';
import type { Player, PlayerStats } from '../types';

export const playerService = {
  getAll: () => apiClient.get<Player[]>('/players'),
  getStats: () => apiClient.get<PlayerStats[]>('/players/stats'),
  getStatsByName: (name: string) =>
    apiClient.get<PlayerStats>(`/players/${encodeURIComponent(name)}/stats`),
};
