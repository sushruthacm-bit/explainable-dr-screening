import api from './api';

/**
 * Patient Service
 * Integrates with existing backend patient endpoints:
 * - POST /api/patients
 * - GET /api/patients/:patientId
 * - GET /api/patients/:patientId/history
 */

export const registerPatient = async (patientData) => {
  // Payload format: { name: string, age: number, gender: "Male" | "Female" | "Other" }
  const payload = {
    name: patientData.name?.trim(),
    age: Number(patientData.age),
    gender: patientData.gender
  };
  const response = await api.post('/api/patients', payload);
  return response.data;
};

export const getPatientById = async (patientId) => {
  if (!patientId) throw new Error('Patient ID is required');
  const response = await api.get(`/api/patients/${encodeURIComponent(patientId)}`);
  return response.data;
};

export const getPatientScreeningHistory = async (patientId) => {
  if (!patientId) throw new Error('Patient ID is required');
  const response = await api.get(`/api/patients/${encodeURIComponent(patientId)}/history`);
  return response.data;
};
