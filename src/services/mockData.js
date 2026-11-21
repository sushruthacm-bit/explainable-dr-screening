/**
 * Mock & Reference Data matching actual backend database schemas
 * This allows safe preview, demo walkthroughs, and error-tolerant fallback
 * when backend database is empty or server is undergoing maintenance.
 */

export const DR_CLASSIFICATIONS = [
  { grade: 0, key: 'No DR', name: 'No Diabetic Retinopathy', color: 'emerald', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { grade: 1, key: 'Mild', name: 'Mild Non-Proliferative DR', color: 'amber', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  { grade: 2, key: 'Moderate', name: 'Moderate Non-Proliferative DR', color: 'orange', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
  { grade: 3, key: 'Severe', name: 'Severe Non-Proliferative DR', color: 'rose', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  { grade: 4, key: 'Proliferative DR', name: 'Proliferative DR (High Risk)', color: 'red', badge: 'bg-red-100 text-red-900 border-red-300' }
];

export const MOCK_PATIENTS = [
  {
    _id: 'pat_001_db',
    patientId: 'ROSH-PAT-1082',
    name: 'Rameshwar Kulkarni',
    age: 58,
    gender: 'Male',
    createdAt: '2026-11-18T10:30:00.000Z',
    contact: '+91 98451 23098',
    screeningsCount: 2,
    latestStatus: 'needs_review'
  },
  {
    _id: 'pat_002_db',
    patientId: 'ROSH-PAT-1083',
    name: 'Ananya Deshmukh',
    age: 46,
    gender: 'Female',
    createdAt: '2026-11-19T14:15:00.000Z',
    contact: '+91 94482 77123',
    screeningsCount: 1,
    latestStatus: 'needs_review'
  },
  {
    _id: 'pat_003_db',
    patientId: 'ROSH-PAT-1084',
    name: 'Venkatesh Prasad',
    age: 63,
    gender: 'Male',
    createdAt: '2026-11-20T09:00:00.000Z',
    contact: '+91 97410 88234',
    screeningsCount: 1,
    latestStatus: 'reviewed'
  }
];

export const MOCK_SCREENINGS = [
  {
    _id: 'scr_001_db',
    screeningId: 'SCR-20261119-01',
    patientId: 'ROSH-PAT-1082',
    patientName: 'Rameshwar Kulkarni',
    patientAge: 58,
    patientGender: 'Male',
    createdAt: '2026-11-19T11:45:00.000Z',
    reviewStatus: 'needs_review',
    imageQuality: {
      status: 'Adequate',
      score: 0.94,
      illumination: 'Optimal',
      focus: 'Sharp',
      fieldOfView: 'Full 45-degree macula-centered'
    },
    // Original vs Adaptive predictions matching backend Screening.js
    originalPrediction: 'Moderate',
    originalConfidence: 0.884, // Stored as 0-1, rendered as 88.4%
    adaptivePrediction: 'Moderate', // Main prediction
    adaptiveConfidence: 0.932, // Main confidence: 93.2%
    classProbabilities: {
      'No DR': 0.012,
      'Mild': 0.046,
      'Moderate': 0.932,
      'Severe': 0.008,
      'Proliferative DR': 0.002
    },
    piedAnalysis: {
      microaneurysmsCount: 14,
      hemorrhagesDetected: true,
      hardExudatesDetected: true,
      cottonWoolSpots: false,
      fovealAvascularZone: 'Intact',
      lesionDensityScore: '0.68'
    },
    reliability: {
      flag: 'High Reliability',
      isReliable: true,
      concordanceScore: 0.95,
      notes: 'Standard and adaptive model features agree with high confidence on moderate microvascular alterations.'
    },
    originalFundusImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    adaptiveFundusImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    originalGradcam: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    adaptiveGradcam: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
  },
  {
    _id: 'scr_002_db',
    screeningId: 'SCR-20261120-02',
    patientId: 'ROSH-PAT-1083',
    patientName: 'Ananya Deshmukh',
    patientAge: 46,
    patientGender: 'Female',
    createdAt: '2026-11-20T14:30:00.000Z',
    reviewStatus: 'needs_review',
    imageQuality: {
      status: 'Excellent',
      score: 0.98,
      illumination: 'Even',
      focus: 'Crystal Clear',
      fieldOfView: 'Standard 45-degree fundus'
    },
    originalPrediction: 'No DR',
    originalConfidence: 0.961,
    adaptivePrediction: 'No DR',
    adaptiveConfidence: 0.978,
    classProbabilities: {
      'No DR': 0.978,
      'Mild': 0.018,
      'Moderate': 0.003,
      'Severe': 0.001,
      'Proliferative DR': 0.000
    },
    piedAnalysis: {
      microaneurysmsCount: 0,
      hemorrhagesDetected: false,
      hardExudatesDetected: false,
      cottonWoolSpots: false,
      fovealAvascularZone: 'Crisp & Regular',
      lesionDensityScore: '0.02'
    },
    reliability: {
      flag: 'Optimal Reliability',
      isReliable: true,
      concordanceScore: 0.99,
      notes: 'No microvascular lesions detected. Clear retinal vessels and healthy fovea.'
    },
    originalFundusImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    adaptiveFundusImage: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    originalGradcam: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    adaptiveGradcam: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80'
  }
];

export const MOCK_REPORTS = [
  {
    _id: 'rep_001_db',
    reportId: 'REP-20261119-89',
    patientId: 'ROSH-PAT-1082',
    screeningId: 'SCR-20261119-01',
    fileName: 'Previous_Retinopathy_Audit_2025.pdf',
    fileSize: '2.4 MB',
    createdAt: '2026-11-19T12:00:00.000Z',
    uploadedBy: 'Central Diagnostic Lab, Hubli',
    url: '#'
  }
];

export const MOCK_REMINDERS = [
  {
    id: 1,
    title: '6-Month Retinal Dilated Eye Examination',
    dueDate: '2027-05-18',
    category: 'Clinical Follow-up',
    notes: 'Recommended by ophthalmologist to monitor moderate NPDR progression.'
  },
  {
    id: 2,
    title: 'Quarterly HbA1c Glycemic Test',
    dueDate: '2027-02-15',
    category: 'Lab Diagnostics',
    notes: 'Target HbA1c < 7.0% to minimize microvascular retinal damage.'
  }
];
