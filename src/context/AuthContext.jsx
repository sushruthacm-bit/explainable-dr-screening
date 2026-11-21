import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Current role: 'receptionist' | 'lab' | 'doctor' | 'patient' | null
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('roshni_role') || null;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('roshni_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  // Active patient ID in session
  const [activePatientId, setActivePatientId] = useState(() => {
    return localStorage.getItem('roshni_active_patient_id') || 'ROSH-PAT-1082';
  });

  // Doctor cabin queue control signal shared with receptionist
  const [doctorQueueControl, setDoctorQueueControl] = useState('accepting');
  const [doctorQueueMessage, setDoctorQueueMessage] = useState('Doctor cabin is actively accepting waiting patients.');

  const loginAs = (role, userData = {}) => {
    setCurrentRole(role);
    localStorage.setItem('roshni_role', role);

    const uniqueIdPrefixes = {
      receptionist: 'REC-',
      lab: 'LAB-',
      doctor: 'DOC-',
      patient: 'ROSH-PAT-'
    };
    const randomNum = Math.floor(100 + Math.random() * 900);
    const assignedUniqueId = userData.id || `${uniqueIdPrefixes[role] || 'UID-'}${randomNum}`;

    const defaultNames = {
      receptionist: 'Pooja Hegde (Front Desk Receptionist)',
      lab: 'Kiran Desai (Certified Ophthalmic Technician)',
      doctor: 'Dr. Arundhati Nayak, MS (Ophthalmologist)',
      patient: 'Rameshwar Kulkarni'
    };

    const userObj = {
      id: assignedUniqueId,
      role,
      name: userData.name || defaultNames[role] || 'User',
      email: userData.email || `${role}@roshni-health.org`
    };

    setCurrentUser(userObj);
    localStorage.setItem('roshni_user', JSON.stringify(userObj));
  };

  const logout = () => {
    setCurrentRole(null);
    setCurrentUser(null);
    localStorage.removeItem('roshni_role');
    localStorage.removeItem('roshni_user');
  };

  const updateActivePatientId = (newId) => {
    setActivePatientId(newId);
    localStorage.setItem('roshni_active_patient_id', newId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUser,
        loginAs,
        logout,
        activePatientId,
        updateActivePatientId,
        doctorQueueControl,
        setDoctorQueueControl,
        doctorQueueMessage,
        setDoctorQueueMessage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
