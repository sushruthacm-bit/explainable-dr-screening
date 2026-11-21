import React from 'react';
import { useAuth } from '../../context/AuthContext';
import RoshniLogo from './RoshniLogo';
import BackendStatusBadge from './BackendStatusBadge';
import { 
  LogOut, 
  User, 
  Stethoscope, 
  Microscope, 
  HeartPulse, 
  ChevronDown 
} from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const { currentRole, currentUser, logout, loginAs } = useAuth();

  const roleMeta = {
    doctor: { label: 'Ophthalmologist', icon: Stethoscope, color: 'bg-sage-100 text-sage-800 border-sage-200' },
    lab: { label: 'Diagnostic Lab', icon: Microscope, color: 'bg-olive-light/20 text-olive-dark border-olive/30' },
    patient: { label: 'Patient Portal', icon: HeartPulse, color: 'bg-terracotta/10 text-terracotta-dark border-terracotta/20' }
  };

  const currentRoleInfo = currentRole ? roleMeta[currentRole] : null;
  const RoleIcon = currentRoleInfo?.icon || User;

  return (
    <header className="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur-md border-b border-sand/30 px-4 sm:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <RoshniLogo size="md" showTagline={false} />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Real Backend Connection Badge */}
          <BackendStatusBadge />

          {currentRole ? (
            <div className="flex items-center gap-3 pl-2 border-l border-sand">
              {/* Role Indicator & Switch Dropdown */}
              <div className="relative group">
                <button className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${currentRoleInfo?.color}`}>
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{currentRoleInfo?.label}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {/* Role Switcher menu for demo testing */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-sand-light p-1.5 hidden group-hover:block z-50">
                  <div className="text-[11px] font-bold text-earth-400 px-2 py-1 uppercase tracking-wider">
                    Switch Dashboard
                  </div>
                  <button 
                    onClick={() => loginAs('doctor')} 
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 ${currentRole === 'doctor' ? 'bg-sage-50 text-sage-800 font-bold' : 'hover:bg-cream text-earth-600'}`}
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-sage-600" />
                    Doctor (Ophthalmologist)
                  </button>
                  <button 
                    onClick={() => loginAs('lab')} 
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 ${currentRole === 'lab' ? 'bg-sage-50 text-sage-800 font-bold' : 'hover:bg-cream text-earth-600'}`}
                  >
                    <Microscope className="w-3.5 h-3.5 text-olive" />
                    Laboratory
                  </button>
                  <button 
                    onClick={() => loginAs('patient')} 
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 ${currentRole === 'patient' ? 'bg-sage-50 text-sage-800 font-bold' : 'hover:bg-cream text-earth-600'}`}
                  >
                    <HeartPulse className="w-3.5 h-3.5 text-terracotta" />
                    Patient
                  </button>
                </div>
              </div>

              {/* User Name Preview */}
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-earth-700 leading-tight">
                  {currentUser?.name || 'Authorized User'}
                </span>
                <span className="text-[10px] text-earth-400">
                  {currentUser?.email || 'Logged in'}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl text-earth-400 hover:text-terracotta hover:bg-terracotta/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-earth-700 hover:bg-sand/30 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-sage-600 text-white hover:bg-sage-700 shadow-sm transition-all"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
