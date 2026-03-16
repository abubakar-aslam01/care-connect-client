import { api } from './api.js';

export const patientNotificationsService = {
  list: (params) => api.get('/patient/notifications', { params }),
  markRead: (id) => api.put(`/patient/notifications/read/${id}`),
  remove: (id) => api.delete(`/patient/notifications/${id}`)
};
