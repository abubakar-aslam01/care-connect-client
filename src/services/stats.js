import { api } from './api.js';

export const statsService = {
  overview: () => api.get('/stats/overview')
};
