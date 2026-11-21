import api, { API_BASE_URL } from './api';

/**
 * Report Service
 * Integrates with existing backend report endpoints:
 * - POST /api/reports/upload (multipart: report PDF, patientId, screeningId)
 * - GET /api/reports/patient/:patientId
 * - GET /api/reports/:reportId
 * - GET /api/reports/:reportId/download
 */

export const uploadPreviousReport = async ({ file, patientId, screeningId, onUploadProgress }) => {
  if (!file) throw new Error('PDF report file is required');
  if (!patientId) throw new Error('Patient ID is required');

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF files are supported for medical reports.');
  }

  // 10 MB limit check
  const MAX_SIZE_MB = 10;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`Report file size must be less than ${MAX_SIZE_MB}MB`);
  }

  const formData = new FormData();
  formData.append('report', file);
  formData.append('patientId', patientId);
  if (screeningId) {
    formData.append('screeningId', screeningId);
  }

  const response = await api.post('/api/reports/upload', formData, {
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    }
  });

  return response.data;
};

export const getReportsByPatientId = async (patientId) => {
  if (!patientId) throw new Error('Patient ID is required');
  const response = await api.get(`/api/reports/patient/${encodeURIComponent(patientId)}`);
  return response.data;
};

export const getReportDetails = async (reportId) => {
  if (!reportId) throw new Error('Report ID is required');
  const response = await api.get(`/api/reports/${encodeURIComponent(reportId)}`);
  return response.data;
};

export const getReportDownloadUrl = (reportId) => {
  if (!reportId) return '#';
  return `${API_BASE_URL}/api/reports/${encodeURIComponent(reportId)}/download`;
};

/**
 * Helper to construct the full URL for static assets like Grad-CAM images or uploaded fundus images.
 * Handles both relative paths ("gradcam/adaptive-xyz.png") and existing full URLs.
 */
export const getAssetUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
