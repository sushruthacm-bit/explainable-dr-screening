import api from './api';

/**
 * Screening Service
 * Integrates with existing backend screening endpoints:
 * - POST /api/screenings/upload (multipart: image file, patientId)
 * - GET /api/screenings/:id
 */

export const uploadAndScreenRetinalImage = async (imageFile, patientId, onUploadProgress) => {
  if (!imageFile) throw new Error('Retinal image file is required');
  if (!patientId) throw new Error('Patient ID is required');

  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('patientId', patientId);

  // NOTE: Do NOT set Content-Type header manually when using FormData in browser,
  // Axios and browser will automatically set 'multipart/form-data; boundary=...'
  const response = await api.post('/api/screenings/upload', formData, {
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    }
  });

  return response.data;
};

export const getScreeningById = async (screeningId) => {
  if (!screeningId) throw new Error('Screening ID is required');
  const response = await api.get(`/api/screenings/${encodeURIComponent(screeningId)}`);
  return response.data;
};
