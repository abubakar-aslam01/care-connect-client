import { api } from './api.js';

export const doctorPharmacyService = {
  list: (params) => api.get('/doctor/medicines', { params }),
  createPrescription: (payload) => api.post('/doctor/prescription', payload)
};
