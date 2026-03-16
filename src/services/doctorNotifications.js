import { api } from './api.js';

export const doctorNotificationsService = {
  list: (params) => api.get('/doctor/notifications', { params }),
  markRead: (id) => api.put(`/doctor/notifications/read/${id}`),
  remove: (id) => api.delete(`/doctor/notifications/${id}`)
};
