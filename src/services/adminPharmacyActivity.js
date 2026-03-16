import { api } from './api.js';

export const adminPharmacyActivityService = {
  list: (params) => api.get('/admin/pharmacy/activity', { params })
};
