import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import SplashScreen from './components/common/SplashScreen';
import FloatingPatientChatbot from './components/patient/FloatingPatientChatbot';
import LandingPage from './pages/LandingPage';
import AuthModal from './pages/AuthModal';
import ReceptionistDashboard from './dashboards/receptionist/ReceptionistDashboard';
import DoctorDashboard from './dashboards/doctor/DoctorDashboard';
import LabDashboard from './dashboards/lab/LabDashboard';
import PatientDashboard from './dashboards/patient/PatientDashboard';
import { MOCK_PATIENTS, MOCK_SCREENINGS } from './services/mockData';
import { Menu, X } from 'lucide-react';

function DashboardShell() {
  const { 
    currentRole, 
    currentUser, 
    loginAs, 
    doctorQueueControl, 
    setDoctorQueueControl,
    doctorQueueMessage,
    setDoctorQueueMessage
  } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    mode: 'login',
    role: 'doctor'
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Live Patient Queue State shared across actors
  const [patientsList, setPatientsList] = useState([
    {
      patientId: 'ROSH-PAT-1082',
      name: 'Rameshwar Kulkarni',
      age: 58,
      gender: 'Male',
      contact: '+91 98451 23098',
      address: 'H.No 42, Malaprabha Nagar, Dharwad, Karnataka',
      bloodGroup: 'B+',
      registrationDate: '2026-10-12',
      vitals: {
        bloodPressure: '138/88 mmHg',
        bloodSugarFasting: '142 mg/dL',
        bloodSugarPP: '198 mg/dL',
        hba1c: '8.4%',
        diabetesType: 'Type 2 Diabetes Mellitus',
        diabetesDurationYears: 11,
        insulinDependent: 'Yes (Biphasic 20U/day)',
        smokingStatus: 'Non-Smoker'
      },
      comorbidities: ['Essential Hypertension (7 yrs)', 'Hyperlipidemia'],
      symptoms: {
        visualSymptoms: 'Gradual blurriness in right eye, intermittent floaters',
        symptomDuration: '3 months',
        lastEyeExamDate: '14 months ago'
      },
      queueStatus: 'waiting_doctor',
      tokenNumber: 'Q-01',
      olderReports: [
        {
          id: 'OLD-REP-901',
          hospital: 'Karnataka Institute of Medical Sciences (KIMS)',
          date: '2025-11-04',
          doctorReferral: 'Dr. S. Patil',
          fileName: 'KIMS_Retinal_Audit_Nov2025.pdf',
          summary: 'Early bilateral microangiopathy noted.'
        }
      ],
      healthJourney: [
        {
          visitDate: '2026-10-12',
          screeningId: 'SCR-20261012-01',
          weekNumber: 'Week 1 (Baseline Visit)',
          diagnosis: 'Mild NPDR (OD), No DR (OS)',
          confidence: 91,
          doctorAction: 'Advised strict glycemic monitoring.'
        },
        {
          visitDate: '2026-11-19',
          screeningId: 'SCR-20261119-01',
          weekNumber: 'Week 6 (Follow-up Screening)',
          diagnosis: 'Moderate NPDR (Bilateral)',
          confidence: 93,
          doctorAction: 'Microaneurysms progression noted. Adjusted medication.'
        }
      ],
      prescriptions: [
        {
          date: '2026-10-12',
          doctor: 'Dr. Arundhati Nayak, MS',
          medicines: [
            { name: 'Tab Metformin 500mg', dosage: '1 tablet twice daily with meals', frequency: 'Daily', duration: 'Ongoing' },
            { name: 'Tab Fenofibrate 145mg', dosage: '1 tablet once daily at bedtime', frequency: 'Daily', duration: '90 Days' }
          ],
          notes: 'Advised lifestyle modification, 30 min daily brisk walking.'
        }
      ]
    },
    {
      patientId: 'ROSH-PAT-1083',
      name: 'Ananya Deshmukh',
      age: 46,
      gender: 'Female',
      contact: '+91 94482 77123',
      address: 'Flat 302, Green Meadows, Vidyanagar, Hubli, Karnataka',
      bloodGroup: 'O+',
      registrationDate: '2026-11-02',
      vitals: {
        bloodPressure: '124/80 mmHg',
        bloodSugarFasting: '118 mg/dL',
        bloodSugarPP: '154 mg/dL',
        hba1c: '6.9%',
        diabetesType: 'Type 2 Diabetes Mellitus',
        diabetesDurationYears: 5,
        insulinDependent: 'No',
        smokingStatus: 'Non-Smoker'
      },
      comorbidities: ['None detected'],
      symptoms: {
        visualSymptoms: 'Mild eye strain during evening computer work',
        symptomDuration: '1 month',
        lastEyeExamDate: 'None'
      },
      queueStatus: 'waiting_lab',
      tokenNumber: 'Q-02',
      olderReports: [],
      healthJourney: [
        {
          visitDate: '2026-11-02',
          screeningId: 'SCR-20261102-04',
          weekNumber: 'Week 1 (Initial Screening)',
          diagnosis: 'No DR (Bilateral Normal Retina)',
          confidence: 98,
          doctorAction: 'Retina pristine. Routine 12-month follow up advised.'
        }
      ],
      prescriptions: []
    }
  ]);

  const handleRegisterPatientFromReception = (newRecord) => {
    const nextId = `ROSH-PAT-${1080 + patientsList.length + 1}`;
    const token = `Q-0${patientsList.length + 1}`;

    const created = {
      patientId: nextId,
      name: newRecord.name,
      age: Number(newRecord.age),
      gender: newRecord.gender,
      contact: newRecord.contact,
      address: newRecord.address,
      bloodGroup: newRecord.bloodGroup,
      registrationDate: new Date().toISOString().split('T')[0],
      vitals: {
        bloodPressure: newRecord.bloodPressure,
        bloodSugarFasting: `${newRecord.bloodSugarFasting} mg/dL`,
        bloodSugarPP: `${newRecord.bloodSugarPP} mg/dL`,
        hba1c: `${newRecord.hba1c}%`,
        diabetesType: newRecord.diabetesType,
        diabetesDurationYears: Number(newRecord.diabetesDurationYears),
        insulinDependent: newRecord.insulinDependent,
        smokingStatus: newRecord.smokingStatus
      },
      comorbidities: [newRecord.comorbidities],
      symptoms: {
        visualSymptoms: newRecord.visualSymptoms,
        symptomDuration: 'Recently noted',
        lastEyeExamDate: 'None recorded'
      },
      queueStatus: 'waiting_doctor',
      tokenNumber: token,
      olderReports: newRecord.olderReportFile ? [{
        id: `OLD-REP-${Date.now()}`,
        hospital: newRecord.olderReportHospital || 'External Diagnostics',
        date: new Date().toISOString().split('T')[0],
        doctorReferral: newRecord.olderReportDoctor || 'External MD',
        fileName: newRecord.olderReportFile.name,
        summary: 'Archived past medical report uploaded at receptionist desk.'
      }] : [],
      healthJourney: [],
      prescriptions: []
    };

    setPatientsList([created, ...patientsList]);
    alert(`Patient ${newRecord.name} registered with ID ${nextId} and Token ${token}`);
  };

  const handleUpdateQueueStatus = (patId, status) => {
    setPatientsList(prev => prev.map(p => p.patientId === patId ? { ...p, queueStatus: status } : p));
  };

  // If not logged into any role, show landing page with splash screen
  if (!currentRole) {
    return (
      <div className="min-h-screen bg-ivory-50 text-earth-700 flex flex-col font-sans">
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <Navbar 
          onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode, role: 'doctor' })} 
        />
        <main className="flex-1">
          <LandingPage
            onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode, role: 'doctor' })}
            onDirectRoleSelect={(role) => loginAs(role)}
          />
        </main>
        <AuthModal
          isOpen={authModalState.isOpen}
          initialMode={authModalState.mode}
          initialRole={authModalState.role}
          onClose={() => setAuthModalState(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    );
  }

  // When logged in, strictly render that role's dashboard only!
  return (
    <div className="min-h-screen bg-ivory-50 text-earth-700 flex flex-col font-sans">
      {/* Floating Chatbot for Patient Role */}
      {currentRole === 'patient' && <FloatingPatientChatbot screeningData={MOCK_SCREENINGS[0]} />}

      <Navbar 
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode, role: currentRole })} 
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Mobile Sidebar Toggle Button */}
        <div className="md:hidden fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-3.5 rounded-full bg-sage-600 text-white shadow-xl shadow-sage-600/30 flex items-center justify-center"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobileSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-50 bg-earth-700/50 backdrop-blur-xs flex"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div 
              className="w-72 bg-white h-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  setActiveTab(tab);
                  setIsMobileSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* STRICT ROLE SEGREGATION: A user of one role CANNOT access any other role's dashboard */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-5xl">
          {currentRole === 'receptionist' && (
            <ReceptionistDashboard
              activeTab={activeTab}
              onSelectTab={(tab) => setActiveTab(tab)}
              patients={patientsList}
              onRegisterPatient={handleRegisterPatientFromReception}
              doctorQueueControl={doctorQueueControl}
              doctorQueueMessage={doctorQueueMessage}
              onUpdateQueueStatus={handleUpdateQueueStatus}
            />
          )}

          {currentRole === 'doctor' && (
            <DoctorDashboard 
              activeTab={activeTab} 
              onSelectTab={(tab) => setActiveTab(tab)} 
            />
          )}

          {currentRole === 'lab' && (
            <LabDashboard 
              activeTab={activeTab} 
              onSelectTab={(tab) => setActiveTab(tab)} 
            />
          )}

          {currentRole === 'patient' && (
            <PatientDashboard 
              activeTab={activeTab} 
              onSelectTab={(tab) => setActiveTab(tab)} 
            />
          )}
        </main>
      </div>

      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        initialRole={authModalState.role}
        onClose={() => setAuthModalState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <DashboardShell />
    </AuthProvider>
  );
}

export default App;
