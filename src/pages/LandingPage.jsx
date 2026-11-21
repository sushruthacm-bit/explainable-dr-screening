import React from 'react';
import RoshniLogo from '../components/common/RoshniLogo';
import { 
  Users, 
  Stethoscope, 
  Microscope, 
  HeartPulse, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const LandingPage = ({ onOpenAuth, onDirectRoleSelect }) => {
  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col justify-between selection:bg-sage-200">
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-sage-100/60 via-sand-light/40 to-terracotta/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center justify-center animate-pop">
            <RoshniLogo size="xl" animated={true} />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100/80 border border-sage-200 text-xs font-bold text-sage-800 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sage-600" />
              <span>Multi-Role AI Retinopathy Screening System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-earth-700 tracking-tight font-serif leading-[1.15]">
              Brightening Futures <br className="hidden sm:inline" />
              <span className="text-terracotta font-serif italic">Through Clear Vision.</span>
            </h1>

            <p className="text-base sm:text-lg text-earth-500 max-w-2xl mx-auto leading-relaxed font-sans">
              ROSHNI is an AI-assisted diabetic retinopathy screening platform designed to support early detection through retinal image analysis, image quality assessment and interpretable AI predictions. It helps healthcare professionals review retinal images and understand screening results.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-6 py-3.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm shadow-md shadow-sage-600/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <span>Sign In with Unique ID</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-ivory-100 text-earth-700 border border-sand font-bold text-sm shadow-xs hover:-translate-y-0.5 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* 4 Role Selection Cards */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-earth-400">
              Four Segregated Actor Roles
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-earth-700 font-serif mt-1">
              Select Your Designated Clinical Portal
            </h2>
            <p className="text-xs sm:text-sm text-earth-500 mt-1 max-w-lg mx-auto">
              Strict role-based access control: users can only perform their assigned job.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {/* 1. Receptionist */}
            <div 
              onClick={() => onDirectRoleSelect('receptionist')}
              className="group cursor-pointer rounded-3xl p-5 bg-white border border-sand hover:border-amber-500 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-earth-800">Receptionist</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    Queue & Clinical Intake
                  </span>
                </div>
                <p className="text-xs text-earth-500 leading-relaxed">
                  Manage live patient queue, dispatch waiting visits, collect comprehensive clinical vitals & BP, and upload older hospital reports.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-sand-light flex items-center justify-between text-xs font-bold text-amber-800">
                <span>Reception Desk</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 2. Laboratory Worker */}
            <div 
              onClick={() => onDirectRoleSelect('lab')}
              className="group cursor-pointer rounded-3xl p-5 bg-white border border-sand hover:border-olive shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-olive/20 text-olive-dark flex items-center justify-center font-bold">
                  <Microscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-earth-800">Laboratory Worker</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-olive/20 text-olive-dark">
                    Dual Eye Fundus Imaging
                  </span>
                </div>
                <p className="text-xs text-earth-500 leading-relaxed">
                  Upload Right Eye (OD) and Left Eye (OS) fundus captures, run START DETECTION AI, and inspect 10+ week longitudinal journeys.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-sand-light flex items-center justify-between text-xs font-bold text-olive-dark">
                <span>Enter Lab Station</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 3. Doctor */}
            <div 
              onClick={() => onDirectRoleSelect('doctor')}
              className="group cursor-pointer rounded-3xl p-5 bg-white border border-sand hover:border-sage-600 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center font-bold">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-earth-800">Doctor / Ophth</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800">
                    Clinical Diagnosis & Rx
                  </span>
                </div>
                <p className="text-xs text-earth-500 leading-relaxed">
                  Control cabin queue (Stop/Resume), inspect dual Grad-CAM heatmaps, XAI summary points, voice dictation, and prescription ledger.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-sand-light flex items-center justify-between text-xs font-bold text-sage-800">
                <span>Doctor Workspace</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* 4. Patient */}
            <div 
              onClick={() => onDirectRoleSelect('patient')}
              className="group cursor-pointer rounded-3xl p-5 bg-white border border-sand hover:border-terracotta shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-terracotta/20 text-terracotta-dark flex items-center justify-center font-bold">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-earth-800">Patient</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-terracotta/20 text-terracotta-dark">
                    Patient Friendly Portal
                  </span>
                </div>
                <p className="text-xs text-earth-500 leading-relaxed">
                  Personal profile, simplified medical reports, floating eye health chatbot assistant, checkup reminders, and official PDF downloads.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-sand-light flex items-center justify-between text-xs font-bold text-terracotta-dark">
                <span>Patient Portal</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-sand-light py-6 px-6 text-center text-xs text-earth-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <RoshniLogo size="sm" />
            <span className="text-earth-500 font-medium">ROSHNI Multi-Role Retinal AI &copy; 2026.</span>
          </div>
          <p className="text-[11px] text-earth-400">
            Strict Role-Based Access Control: Receptionist &bull; Laboratory Worker &bull; Doctor &bull; Patient.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
