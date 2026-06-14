import { apiClient } from './apiClient';
import type { LeaderboardRow } from '../types';

export const leaderboardService = {
  get: () => apiClient.get<LeaderboardRow[]>('/leaderboard'),
};
