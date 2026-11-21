import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import RoshniLogo from '../components/common/RoshniLogo';
import { Lock, Mail, User, ShieldCheck } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', initialRole = 'doctor' }) => {
  const { loginAs } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    loginAs(role, {
      name: formData.name,
      email: formData.email
    });
    onClose();
  };

  const handleGoogleAuth = () => {
    loginAs(role, {
      name: `Google User (${role.toUpperCase()})`,
      email: `google.user@roshni.org`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-700/60 backdrop-blur-sm animate-pop">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-sand/40 relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-earth-400 hover:text-earth-700 p-2 rounded-full hover:bg-ivory-100 transition-colors text-xl font-bold leading-none"
        >
          &times;
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex justify-center">
            <RoshniLogo size="md" showTagline={false} />
          </div>
          <h3 className="text-2xl font-bold text-earth-700 font-serif">
            {mode === 'login' ? 'Role-Based Clinical Sign In' : 'Create Authorized Account'}
          </h3>
          <p className="text-xs text-earth-400">
            Select your actor role to enter your dedicated medical workspace.
          </p>
        </div>

        {/* 4 Actor Role Selector */}
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-earth-400 block mb-2 text-center">
            Select Your Designated Role
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setRole('receptionist')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                role === 'receptionist' ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs' : 'bg-ivory-50 border-sand text-earth-600 hover:bg-cream'
              }`}
            >
              Receptionist
            </button>
            <button
              type="button"
              onClick={() => setRole('lab')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                role === 'lab' ? 'bg-olive/20 border-olive text-olive-dark shadow-xs' : 'bg-ivory-50 border-sand text-earth-600 hover:bg-cream'
              }`}
            >
              Lab Worker
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                role === 'doctor' ? 'bg-sage-100 border-sage-600 text-sage-900 shadow-xs' : 'bg-ivory-50 border-sand text-earth-600 hover:bg-cream'
              }`}
            >
              Doctor
            </button>
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                role === 'patient' ? 'bg-terracotta/20 border-terracotta text-terracotta-dark shadow-xs' : 'bg-ivory-50 border-sand text-earth-600 hover:bg-cream'
              }`}
            >
              Patient
            </button>
          </div>
        </div>

        {/* Access Control Notice */}
        <div className="p-3 rounded-2xl bg-cream border border-sand text-[11px] text-earth-700 leading-relaxed mb-4">
          <strong>Strict Access Control:</strong> Every actor receives a <strong>Unique ID</strong> (REC-xxx, LAB-xxx, DOC-xxx, ROSH-PAT-xxxx). You can only access your designated workspace; no actor can access another's dashboard.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="font-bold text-earth-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-sand bg-ivory-50 text-earth-800 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="font-bold text-earth-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder={`${role}@roshni-health.org`}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-sand bg-ivory-50 text-earth-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-earth-700 block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-sand bg-ivory-50 text-earth-800 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Enter as {role.toUpperCase()} (Generate Unique ID)
            </button>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-2.5 rounded-2xl bg-white border border-sand hover:bg-ivory-100 text-earth-700 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </form>

        <div className="mt-5 pt-3 border-t border-sand-light text-center text-xs text-earth-500">
          {mode === 'login' ? (
            <p>
              Need an account?{' '}
              <button type="button" onClick={() => setMode('register')} className="font-bold text-sage-700 hover:underline">
                Register & Get Unique ID
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button type="button" onClick={() => setMode('login')} className="font-bold text-sage-700 hover:underline">
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
