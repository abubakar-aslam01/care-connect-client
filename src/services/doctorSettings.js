import { api } from './api.js';

export const doctorSettingsService = {
  updateSettings: (payload) => api.put('/doctor/settings/update', payload),
  updatePassword: (payload) => api.put('/doctor/settings/password', payload)
};
