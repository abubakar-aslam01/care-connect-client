import { api } from './api.js';

export const adminDashboardService = {
  summary: () => api.get('/admin/profile/summary'),
  financial: () => api.get('/admin/profile/financial-overview'),
  settings: () => api.get('/admin/settings'),
  activityLogs: (params) => api.get('/admin/profile/activity-logs', { params }),
  appointments: (params) => api.get('/appointments', { params }),
  doctors: (params) => api.get('/doctors', { params }),
  departments: () => api.get('/departments'),
  notifications: () => api.get('/admin/profile/security-status'),
  exportData: () => api.get('/admin/profile/export-system-data'),
  backup: () => api.post('/admin/profile/backup')
};
