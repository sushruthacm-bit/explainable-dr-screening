import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  Activity,
  HeartPulse,
  Send
} from 'lucide-react';

export const ReceptionistDashboard = ({ 
  activeTab, 
  onSelectTab, 
  patients, 
  onRegisterPatient, 
  doctorQueueControl, 
  doctorQueueMessage,
  onUpdateQueueStatus 
}) => {
  const [receptionistForm, setReceptionistForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    address: '',
    bloodGroup: 'B+',
    bloodPressure: '120/80',
    bloodSugarFasting: '110',
    bloodSugarPP: '140',
    hba1c: '6.5',
    diabetesType: 'Type 2 Diabetes Mellitus',
    diabetesDurationYears: '4',
    insulinDependent: 'No',
    smokingStatus: 'Non-Smoker',
    comorbidities: 'None',
    visualSymptoms: 'Routine Diabetic Retina Screening Checkup'
  });

  const [olderReportFile, setOlderReportFile] = useState(null);
  const [olderReportHospital, setOlderReportHospital] = useState('');
  const [olderReportDoctor, setOlderReportDoctor] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onRegisterPatient({
      ...receptionistForm,
      olderReportFile,
      olderReportHospital,
      olderReportDoctor
    });

    // Reset form
    setReceptionistForm({
      name: '', age: '', gender: 'Male', contact: '', address: '', bloodGroup: 'B+',
      bloodPressure: '120/80', bloodSugarFasting: '110', bloodSugarPP: '140', hba1c: '6.5',
      diabetesType: 'Type 2 Diabetes Mellitus', diabetesDurationYears: '4', insulinDependent: 'No',
      smokingStatus: 'Non-Smoker', comorbidities: 'None', visualSymptoms: 'Routine Diabetic Retina Screening'
    });
    setOlderReportFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab: Queue Management */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold font-serif text-earth-800">Receptionist Queue Management Desk</h2>
              <p className="text-xs text-earth-400 mt-0.5">Control live patient queue, monitor doctor cabin availability, and dispatch waiting visits.</p>
            </div>
            <button
              onClick={() => onSelectTab('clinical-intake')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs self-start"
            >
              + New Patient Clinical Intake
            </button>
          </div>

          {/* Live Cabin Signal from Doctor */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            doctorQueueControl === 'accepting' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`w-3.5 h-3.5 rounded-full ${doctorQueueControl === 'accepting' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
              <div>
                <span className="font-extrabold text-sm block">
                  Doctor Cabin Status: {doctorQueueControl === 'accepting' ? 'ACCEPTING PATIENTS' : 'QUEUE PAUSED BY DOCTOR'}
                </span>
                <span className="text-xs">{doctorQueueMessage}</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-white border border-sand">
              {patients.filter(p => p.queueStatus === 'waiting_doctor').length} Outside Cabin
            </span>
          </div>

          {/* Live Queue Table */}
          <div className="card-earth rounded-2xl bg-white border border-sand-light overflow-hidden">
            <div className="p-4 bg-ivory-100 border-b border-sand-light flex justify-between items-center">
              <h3 className="font-bold text-earth-800 text-sm">Today's Active Patient Queue</h3>
              <span className="text-xs text-earth-500 font-semibold">{patients.length} Registered Visits</span>
            </div>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-sand-light text-earth-400 uppercase text-[10px]">
                  <th className="p-3">Token</th>
                  <th className="p-3">Unique ID</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">BP / Fasting Sugar</th>
                  <th className="p-3">Current Location</th>
                  <th className="p-3 text-right">Queue Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-light/60">
                {patients.map((pat) => (
                  <tr key={pat.patientId} className="hover:bg-ivory-50">
                    <td className="p-3 font-mono font-bold text-amber-700">{pat.tokenNumber}</td>
                    <td className="p-3 font-mono font-bold text-earth-800">{pat.patientId}</td>
                    <td className="p-3 font-semibold text-earth-800">{pat.name} ({pat.age}y/{pat.gender})</td>
                    <td className="p-3 text-earth-600">{pat.vitals.bloodPressure} &bull; {pat.vitals.bloodSugarFasting}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        pat.queueStatus === 'waiting_doctor' ? 'bg-emerald-100 text-emerald-800' :
                        pat.queueStatus === 'waiting_lab' ? 'bg-olive/20 text-olive-dark' : 'bg-sand text-earth-700'
                      }`}>
                        {pat.queueStatus === 'waiting_doctor' ? 'Waiting Doctor Cabin' :
                         pat.queueStatus === 'waiting_lab' ? 'At Lab for Fundus Scan' : 'Completed'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => onUpdateQueueStatus(pat.patientId, 'waiting_doctor')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-600 hover:text-white"
                      >
                        Send to Doctor
                      </button>
                      <button
                        onClick={() => onUpdateQueueStatus(pat.patientId, 'waiting_lab')}
                        className="px-2.5 py-1 rounded-lg bg-olive/10 text-olive-dark font-bold hover:bg-olive hover:text-white"
                      >
                        Send to Lab
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Clinical Intake Form */}
      {activeTab === 'clinical-intake' && (
        <div className="card-earth rounded-3xl p-6 bg-white border border-sand space-y-5 max-w-3xl mx-auto">
          <div>
            <h2 className="text-xl font-bold font-serif text-earth-800">Comprehensive Clinical Patient Intake</h2>
            <p className="text-xs text-earth-400 mt-0.5">Collect thorough clinical health vitals, diabetes chronicity, and comorbidity details.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            {/* Section 1: Demographics */}
            <div className="p-4 rounded-2xl bg-ivory-50 border border-sand space-y-3">
              <h4 className="font-bold text-earth-800 uppercase tracking-wider text-[11px]">1. Patient Demographics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Full Name *</label>
                  <input required type="text" placeholder="e.g. Rameshwar Kulkarni" value={receptionistForm.name} onChange={(e) => setReceptionistForm({ ...receptionistForm, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-sand bg-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Age (Years) *</label>
                  <input required type="number" placeholder="58" value={receptionistForm.age} onChange={(e) => setReceptionistForm({ ...receptionistForm, age: e.target.value })} className="w-full p-2.5 rounded-xl border border-sand bg-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Gender *</label>
                  <select value={receptionistForm.gender} onChange={(e) => setReceptionistForm({ ...receptionistForm, gender: e.target.value })} className="w-full p-2.5 rounded-xl border border-sand bg-white">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Contact Phone</label>
                  <input type="text" placeholder="+91 98451 23098" value={receptionistForm.contact} onChange={(e) => setReceptionistForm({ ...receptionistForm, contact: e.target.value })} className="w-full p-2.5 rounded-xl border border-sand bg-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold block mb-1">Residential Address</label>
                  <input type="text" placeholder="City, District, State" value={receptionistForm.address} onChange={(e) => setReceptionistForm({ ...receptionistForm, address: e.target.value })} className="w-full p-2.5 rounded-xl border border-sand bg-white" />
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Vitals & Diabetes Profile */}
            <div className="p-4 rounded-2xl bg-ivory-50 border border-sand space-y-3">
              <h4 className="font-bold text-earth-800 uppercase tracking-wider text-[11px]">2. Clinical Vitals & Diabetes Biomarkers</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold block mb-1">Blood Pressure</label>
                  <input type="text" placeholder="130/85 mmHg" value={receptionistForm.bloodPressure} onChange={(e) => setReceptionistForm({ ...receptionistForm, bloodPressure: e.target.value })} className="w-full p-2 rounded-xl border border-sand bg-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Fasting Glucose (mg/dL)</label>
                  <input type="number" placeholder="140" value={receptionistForm.bloodSugarFasting} onChange={(e) => setReceptionistForm({ ...receptionistForm, bloodSugarFasting: e.target.value })} className="w-full p-2 rounded-xl border border-sand bg-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Post-Prandial (mg/dL)</label>
                  <input type="number" placeholder="190" value={receptionistForm.bloodSugarPP} onChange={(e) => setReceptionistForm({ ...receptionistForm, bloodSugarPP: e.target.value })} className="w-full p-2 rounded-xl border border-sand bg-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Latest HbA1c (%)</label>
                  <input type="text" placeholder="8.2" value={receptionistForm.hba1c} onChange={(e) => setReceptionistForm({ ...receptionistForm, hba1c: e.target.value })} className="w-full p-2 rounded-xl border border-sand bg-white font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Diabetes Diagnosis Duration</label>
                  <input type="number" placeholder="Years diagnosed" value={receptionistForm.diabetesDurationYears} onChange={(e) => setReceptionistForm({ ...receptionistForm, diabetesDurationYears: e.target.value })} className="w-full p-2 rounded-xl border border-sand bg-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Insulin Dependent?</label>
                  <select value={receptionistForm.insulinDependent} onChange={(e) => setReceptionistForm({ ...receptionistForm, insulinDependent: e.target.value })} className="w-full p-2 rounded-xl border border-sand bg-white">
                    <option>No (Oral Hypoglycemics Only)</option>
                    <option>Yes (Daily Insulin Injections)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Smoking / Tobacco</label>
                  <select value={receptionistForm.smokingStatus} onChange={(e) => setReceptionistForm({ ...receptionistForm, smokingStatus: e.target.value })} className="w-full p-2 rounded-xl border border-sand bg-white">
                    <option>Non-Smoker</option>
                    <option>Former Smoker</option>
                    <option>Current Smoker</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Reported Visual Symptoms</label>
                <textarea rows={2} value={receptionistForm.visualSymptoms} onChange={(e) => setReceptionistForm({ ...receptionistForm, visualSymptoms: e.target.value })} placeholder="Blurriness, spots, distortion..." className="w-full p-2 rounded-xl border border-sand bg-white" />
              </div>
            </div>

            {/* Section 3: Upload Older External Reports */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">3. Upload Older Reports (Past Hospital Consults)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Hospital / Clinic Origin</label>
                  <input type="text" placeholder="e.g. KIMS Eye Hospital" value={olderReportHospital} onChange={(e) => setOlderReportHospital(e.target.value)} className="w-full p-2 rounded-xl border border-amber-200 bg-white" />
                </div>
                <div>
                  <label className="font-bold block mb-1">Referring Physician</label>
                  <input type="text" placeholder="e.g. Dr. S. Patil" value={olderReportDoctor} onChange={(e) => setOlderReportDoctor(e.target.value)} className="w-full p-2 rounded-xl border border-amber-200 bg-white" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Attach Past Medical PDF Document</label>
                <input type="file" accept=".pdf" onChange={(e) => setOlderReportFile(e.target.files[0])} className="text-xs" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md">
              Register Patient & Assign Token &rarr;
            </button>
          </form>
        </div>
      )}

      {/* Tab: Older Reports List */}
      {activeTab === 'upload-reports' && (
        <div className="card-earth rounded-3xl p-6 bg-white border border-sand space-y-4">
          <h2 className="text-xl font-bold font-serif text-earth-800">Archived Older Clinical Reports</h2>
          <div className="space-y-3">
            {patients.flatMap(p => p.olderReports.map(r => ({ ...r, patientName: p.name, patientId: p.patientId }))).map((rep) => (
              <div key={rep.id} className="p-3.5 rounded-2xl bg-ivory-50 border border-sand flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-earth-800 block">{rep.fileName}</span>
                  <span className="text-earth-500">Patient: <strong>{rep.patientName} ({rep.patientId})</strong> &bull; Origin: {rep.hospital} ({rep.doctorReferral}) &bull; Date: {rep.date}</span>
                </div>
                <button onClick={() => alert(`Opening ${rep.fileName} for clinical reference.`)} className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs">
                  View PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
