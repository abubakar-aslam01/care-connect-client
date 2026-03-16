import { api } from './api.js';

export const doctorProfileService = {
  get: () => api.get('/doctor/profile'),
  update: (payload) => api.put('/doctor/profile/update', payload),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return api.post('/users/profile-image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getDepartment: () => api.get('/doctor/department'),
  getReports: () => api.get('/doctor/reports')
};
