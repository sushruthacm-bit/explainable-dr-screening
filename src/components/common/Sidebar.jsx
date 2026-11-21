import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  BrainCircuit, 
  Mic, 
  Pill, 
  Eye, 
  FileUp, 
  Calendar, 
  UserCircle, 
  Sparkles, 
  Clock, 
  Activity, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { currentRole, logout } = useAuth();

  const receptionistMenu = [
    { id: 'dashboard', label: 'Queue Management', icon: Users, badge: 'Live' },
    { id: 'clinical-intake', label: '+ Clinical Patient Intake', icon: UserPlus, highlight: true },
    { id: 'upload-reports', label: 'Upload Older Reports', icon: FileUp }
  ];

  const labMenu = [
    { id: 'dashboard', label: 'Lab Overview', icon: LayoutDashboard },
    { id: 'upload-dual-fundus', label: 'Upload Fundus (OD & OS)', icon: Eye, highlight: true },
    { id: 'health-journey', label: 'Patient Health Journey (10+ Wks)', icon: Clock }
  ];

  const doctorMenu = [
    { id: 'dashboard', label: 'Doctor Dashboard & Queue', icon: LayoutDashboard, badge: 'Cabin' },
    { id: 'patient-details', label: 'Clinical Vitals & Symptoms', icon: Activity },
    { id: 'patient-journey', label: 'Longitudinal Report History', icon: Clock },
    { id: 'ai-detection', label: 'AI Detection & Grad-CAM', icon: BrainCircuit, highlight: true },
    { id: 'xai-summary', label: 'Explainable AI (XAI) Points', icon: Sparkles },
    { id: 'doctor-notes', label: 'Clinical Notes & Voice Feed', icon: Mic },
    { id: 'prescription', label: 'Prescription & Medication Ledger', icon: Pill, highlight: true }
  ];

  const patientMenu = [
    { id: 'dashboard', label: 'My Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'Patient Profile (Editable)', icon: UserCircle },
    { id: 'simplified-report', label: 'Simplified Medical Report', icon: Eye, highlight: true },
    { id: 'reminders', label: 'Reminders & Appointments', icon: Calendar },
    { id: 'my-reports', label: 'Clinical PDF Downloads', icon: FileText }
  ];

  const menuMap = {
    receptionist: receptionistMenu,
    lab: labMenu,
    doctor: doctorMenu,
    patient: patientMenu
  };

  const menu = menuMap[currentRole] || [];

  return (
    <aside className="w-64 flex-shrink-0 bg-white/90 backdrop-blur-sm border-r border-sand-light min-h-[calc(100vh-65px)] flex flex-col justify-between p-4">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-earth-400">
          {currentRole ? `${currentRole.toUpperCase()} WORKSPACE` : 'MENU'}
        </div>

        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-sage-600 text-white shadow-sm'
                  : 'text-earth-600 hover:bg-ivory-100 hover:text-earth-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-sage-600' : 'text-earth-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-sand/30 text-earth-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-sand-light">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-earth-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
        >
          <LogOut className="w-4 h-4 text-earth-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
