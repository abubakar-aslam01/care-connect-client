import { api } from './api.js';

export const patientProfileService = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (payload) => api.put('/patient/profile/update', payload),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/users/profile-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAppointmentsSummary: () => api.get('/patient/profile/appointments-summary'),
  getPrescriptions: (params) => api.get('/patient/profile/prescriptions', { params }),
  getBilling: () => api.get('/patient/profile/billing'),
  updateNotificationSettings: (payload) => api.put('/patient/profile/notification-settings', payload)
};
