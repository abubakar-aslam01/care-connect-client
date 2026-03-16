import { api } from './api.js';

export const appointmentService = {
  // patient
  create: (payload) => api.post('/appointments', payload),
  my: (params) => api.get('/appointments/me', { params }),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),

  // doctor
  doctorList: (params) => api.get('/appointments/doctor', { params }),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status }),
  addNotes: (id, notes) => api.patch(`/appointments/${id}/notes`, { notes }),

  // admin
  all: (params) => api.get('/appointments', { params })
};
