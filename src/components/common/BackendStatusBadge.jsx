import React, { useState, useEffect } from 'react';
import { checkBackendHealth } from '../../services/api';
import { CheckCircle2, AlertTriangle, RefreshCw, Info, Server, Database, ShieldAlert, Cpu } from 'lucide-react';

export const BackendStatusBadge = () => {
  const [status, setStatus] = useState({ loading: true, online: false, data: null, error: null });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const verifyHealth = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    const res = await checkBackendHealth();
    if (res.online) {
      setStatus({ loading: false, online: true, data: res.data, error: null });
    } else {
      setStatus({ loading: false, online: false, data: null, error: res.error });
    }
  };

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 bg-white/90 shadow-sm hover:shadow"
        title="Click to view Backend Integration Details"
      >
        <span className="relative flex h-2 w-2">
          {status.online ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </>
          ) : (
            <>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </>
          )}
        </span>
        <span className="text-earth-600 font-medium">
          Backend: {status.online ? 'Connected (:5000)' : 'Standby / Offline'}
        </span>
        <Info className="w-3.5 h-3.5 text-earth-400" />
      </button>

      {/* Integration Status Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-earth-700/50 backdrop-blur-sm animate-pop">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-sand/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-sand-light">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${status.online ? 'bg-sage-100 text-sage-700' : 'bg-amber-100 text-amber-700'}`}>
                  {status.online ? <Server className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-earth-700">ROSHNI Backend Integration Status</h3>
                  <p className="text-xs text-earth-400">Target server: http://localhost:5000</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-earth-400 hover:text-earth-600 p-1 rounded-lg text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="my-4 space-y-4 text-sm">
              <div className={`p-3.5 rounded-xl border ${status.online ? 'bg-sage-50 border-sage-200 text-sage-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-2">
                    {status.online ? <CheckCircle2 className="w-4 h-4 text-sage-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    Health Check ({status.online ? 'ONLINE' : 'OFFLINE'})
                  </span>
                  <button 
                    onClick={verifyHealth} 
                    disabled={status.loading}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white border border-sand hover:bg-sand-light transition-colors text-earth-700"
                  >
                    <RefreshCw className={`w-3 h-3 ${status.loading ? 'animate-spin' : ''}`} />
                    Test Again
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-earth-600">
                  {status.online 
                    ? `Successfully connected to ROSHNI Express API server! Health response: ${JSON.stringify(status.data || 'OK')}` 
                    : `Could not reach http://localhost:5000. Start your Node.js backend using: node server.js`}
                </p>
              </div>

              {/* Working Existing APIs */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-sage-700 mb-2 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  Connected Existing Backend Endpoints (Fully Integrated)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-sage-50/70 border border-sage-200/60 font-mono text-sage-900">
                    <span className="font-bold text-sage-700">POST</span> /api/patients
                  </div>
                  <div className="p-2 rounded-lg bg-sage-50/70 border border-sage-200/60 font-mono text-sage-900">
                    <span className="font-bold text-sage-700">GET</span> /api/patients/:patientId
                  </div>
                  <div className="p-2 rounded-lg bg-sage-50/70 border border-sage-200/60 font-mono text-sage-900">
                    <span className="font-bold text-sage-700">GET</span> /api/patients/:patientId/history
                  </div>
                  <div className="p-2 rounded-lg bg-sage-50/70 border border-sage-200/60 font-mono text-sage-900">
                    <span className="font-bold text-sage-700">POST</span> /api/screenings/upload
                  </div>
                  <div className="p-2 rounded-lg bg-sage-50/70 border border-sage-200/60 font-mono text-sage-900">
                    <span className="font-bold text-sage-700">GET</span> /api/screenings/:id
                  </div>
                  <div className="p-2 rounded-lg bg-sage-50/70 border border-sage-200/60 font-mono text-sage-900">
                    <span className="font-bold text-sage-700">POST</span> /api/reports/upload
                  </div>
                  <div className="p-2 rounded-lg bg-sage-50/70 border border-sage-200/60 font-mono text-sage-900">
                    <span className="font-bold text-sage-700">GET</span> /api/reports/patient/:patientId
                  </div>
                  <div className="p-2 rounded-lg bg-sage-50/70 border border-sage-200/60 font-mono text-sage-900">
                    <span className="font-bold text-sage-700">GET</span> /api/reports/:reportId/download
                  </div>
                </div>
              </div>

              {/* Pending Backend Endpoints clearly stated */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-terracotta-dark mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Identified Backend Scope (To Be Developed in Backend)
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-earth-600">
                  <li><strong>Authentication & RBAC:</strong> Login/Register API for Doctor, Lab, and Patient accounts.</li>
                  <li><strong>Doctor Waiting Queue:</strong> Dedicated real-time queue API for triage of unreviewed screenings.</li>
                  <li><strong>Doctor Notes Storage:</strong> Permanent persistence API for doctor clinical observations & recommendations.</li>
                  <li><strong>Voice Notes Storage:</strong> Audio transcript storage endpoint.</li>
                  <li><strong>Chatbot & Reminders:</strong> Real LLM assistant and scheduled patient reminder MongoDB models.</li>
                  <li><strong>Static Grad-CAM Serving:</strong> Exposing <code className="bg-sand-light px-1 py-0.5 rounded">app.use('/gradcam', express.static(...))</code> so generated heatmaps render directly.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-medium text-sm transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BackendStatusBadge;
