import { api } from './api.js';

export const adminPharmacyService = {
  list: (params) => api.get('/admin/pharmacy/medicines', { params }),
  create: (payload) => api.post('/admin/pharmacy/medicines', payload),
  update: (id, payload) => api.put(`/admin/pharmacy/medicines/${id}`, payload),
  remove: (id) => api.delete(`/admin/pharmacy/medicines/${id}`)
};
