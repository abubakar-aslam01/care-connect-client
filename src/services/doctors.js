import { api } from './api.js';

export const doctorService = {
  list: (params) => api.get('/doctors', { params }),
  publicList: (params) => api.get('/public/doctors', { params }),
  create: (payload) => api.post('/doctors', payload),
  update: (id, payload) => api.patch(`/doctors/${id}`, payload),
  remove: (id) => api.delete(`/doctors/${id}`)
};
