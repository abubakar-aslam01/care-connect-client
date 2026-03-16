import { api } from './api.js';

export const adminProfileService = {
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (payload) => api.put('/admin/profile/update', payload),
  updatePassword: (payload) => api.put('/admin/profile/password', payload),
  toggleTwoFactor: (payload) => api.put('/admin/profile/two-factor-toggle', payload),
  updateNotifications: (payload) => api.put('/admin/profile/notification-settings', payload),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (payload) => api.put('/admin/settings/update', payload),
  getFinancial: () => api.get('/admin/profile/financial-overview'),
  getSummary: () => api.get('/admin/profile/summary'),
  getActivityLogs: (params) => api.get('/admin/profile/activity-logs', { params }),
  exportData: () => api.get('/admin/profile/export-system-data'),
  backup: () => api.post('/admin/profile/backup'),
  restore: (payload) => api.post('/admin/profile/restore', payload)
};
