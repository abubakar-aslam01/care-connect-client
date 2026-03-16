import { api } from './api.js';

export const departmentService = {
  list: () => api.get('/departments'),
  create: (payload) => api.post('/departments', payload),
  update: (id, payload) => api.patch(`/departments/${id}`, payload),
  remove: (id) => api.delete(`/departments/${id}`)
};
