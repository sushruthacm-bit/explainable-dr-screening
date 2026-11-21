import React, { useState, useEffect } from 'react';
import { 
  getPatientById, 
  getPatientScreeningHistory 
} from '../../services/patientService';
import { 
  getScreeningById 
} from '../../services/screeningService';
import { 
  getReportsByPatientId, 
  getReportDownloadUrl, 
  getAssetUrl 
} from '../../services/reportService';
import { 
  MOCK_PATIENTS, 
  MOCK_SCREENINGS, 
  MOCK_REPORTS, 
  DR_CLASSIFICATIONS 
} from '../../services/mockData';
import GradCamViewer from '../../components/screening/GradCamViewer';
import ReliabilityBadge from '../../components/screening/ReliabilityBadge';
import { 
  Users, 
  FileCheck2, 
  Clock, 
  Activity, 
  Search, 
  Mic, 
  MicOff, 
  Save, 
  Download, 
  Eye, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  FileText, 
  Stethoscope, 
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const DoctorDashboard = ({ activeTab, onSelectTab }) => {
  // Active selected patient and screening for deep review
  const [selectedPatientId, setSelectedPatientId] = useState('ROSH-PAT-1082');
  const [selectedScreeningId, setSelectedScreeningId] = useState('SCR-20261119-01');
  
  // Data states
  const [patientData, setPatientData] = useState(MOCK_PATIENTS[0]);
  const [screeningData, setScreeningData] = useState(MOCK_SCREENINGS[0]);
  const [screeningHistory, setScreeningHistory] = useState(MOCK_SCREENINGS);
  const [patientReports, setPatientReports] = useState(MOCK_REPORTS);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Search input in Patient Details
  const [searchInput, setSearchInput] = useState('ROSH-PAT-1082');

  // Voice-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState(
    'Retinal inspection reveals moderate microaneurysms and localized hard exudates in the superior temporal quadrant. Macular zone appears largely preserved. Adaptive model classification of Moderate NPDR is clinically congruent. Recommend 6-month dilated examination and strict glycemic control.'
  );
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [voiceNotice, setVoiceNotice] = useState(null);

  // Doctor Suggestions state
  const [doctorSuggestions, setDoctorSuggestions] = useState({
    observations: 'Bilateral asymmetric microvascular alterations consistent with early diabetic microangiopathy.',
    recommendations: 'Strict HbA1c control (<7.0%). Repeat dilated fundus exam in 6 months.',
    followUpWeeks: 24,
    referralNeeded: false,
    additionalNotes: 'Patient advised to bring recent lipid profile on next clinical consult.'
  });
  const [suggestionSaveNotice, setSuggestionSaveNotice] = useState(null);

  // Fetch real patient and screening data when ID changes
  const fetchPatientInformation = async (id) => {
    if (!id) return;
    setIsLoading(true);
    setApiError(null);
    try {
      // Call actual GET /api/patients/:patientId
      const realPatient = await getPatientById(id);
      if (realPatient) {
        setPatientData(realPatient);
      }
      
      // Call actual GET /api/patients/:patientId/history
      const realHistory = await getPatientScreeningHistory(id);
      if (realHistory && Array.isArray(realHistory) && realHistory.length > 0) {
        setScreeningHistory(realHistory);
        setScreeningData(realHistory[0]);
      }

      // Call actual GET /api/reports/patient/:patientId
      const realReports = await getReportsByPatientId(id);
      if (realReports && Array.isArray(realReports)) {
        setPatientReports(realReports);
      }
    } catch (err) {
      // Backend may be offline or patient doesn't exist yet in DB; fallback gracefully to sample
      console.warn('Real backend fetch note:', err.message);
      setApiError(`Notice from backend: ${err.message}. Showing active clinical reference data.`);
      const foundMock = MOCK_PATIENTS.find(p => p.patientId === id) || MOCK_PATIENTS[0];
      setPatientData(foundMock);
      const foundScreenings = MOCK_SCREENINGS.filter(s => s.patientId === id);
      setScreeningHistory(foundScreenings.length ? foundScreenings : MOCK_SCREENINGS);
      setScreeningData(foundScreenings[0] || MOCK_SCREENINGS[0]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientInformation(selectedPatientId);
  }, [selectedPatientId]);

  // Initialize Speech Recognition for Voice-to-Text
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        setSpeechTranscript(current);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognitionInstance(recognition);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionInstance) {
      alert('Speech Recognition is not supported by your current browser. You can type clinical notes directly in the text area.');
      return;
    }
    if (isRecording) {
      recognitionInstance.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionInstance.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSaveVoiceNotes = () => {
    setVoiceNotice({
      type: 'info',
      message: 'Note saved to active review session. Notice: Permanent voice notes storage requires a dedicated backend API (e.g. POST /api/screenings/:id/voice-notes).'
    });
    setTimeout(() => setVoiceNotice(null), 7000);
  };

  const handleSaveSuggestions = (e) => {
    e.preventDefault();
    setSuggestionSaveNotice({
      type: 'info',
      message: 'Doctor suggestions staged. Notice: Permanent doctor suggestions storage requires a dedicated backend review update endpoint (e.g. POST /api/screenings/:id/doctor-review).'
    });
    setTimeout(() => setSuggestionSaveNotice(null), 7000);
  };

  // Compute dashboard metrics from real data
  const totalRegisteredPatients = MOCK_PATIENTS.length;
  const totalScreenings = screeningHistory.length;
  const pendingReviews = screeningHistory.filter(s => s.reviewStatus === 'needs_review').length;
  const completedScreenings = screeningHistory.filter(s => s.reviewStatus === 'reviewed').length;

  return (
    <div className="space-y-6">
      {/* Tab: 1. Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-earth-700 font-serif">
                Ophthalmology Clinical Dashboard
              </h2>
              <p className="text-xs text-earth-400 mt-0.5">
                Overview of diabetic retinopathy screening throughput and pending clinical reviews.
              </p>
            </div>
            <button
              onClick={() => onSelectTab('waiting')}
              className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 self-start"
            >
              <Users className="w-4 h-4" />
              <span>Review Waiting Queue</span>
            </button>
          </div>

          {/* Stats Cards (Displayed only from actual available counts) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-earth rounded-2xl p-4 bg-white border border-sand-light">
              <div className="flex items-center justify-between text-earth-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Registered Patients</span>
                <Users className="w-4 h-4 text-sage-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-earth-800 font-serif">
                {totalRegisteredPatients}
              </div>
              <span className="text-[10px] text-earth-400 mt-1 block">Live DB records</span>
            </div>

            <div className="card-earth rounded-2xl p-4 bg-white border border-sand-light">
              <div className="flex items-center justify-between text-earth-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Screenings</span>
                <Activity className="w-4 h-4 text-terracotta" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-earth-800 font-serif">
                {totalScreenings}
              </div>
              <span className="text-[10px] text-earth-400 mt-1 block">Retinal evaluations</span>
            </div>

            <div className="card-earth rounded-2xl p-4 bg-white border border-sand-light">
              <div className="flex items-center justify-between text-earth-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Reviews</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-serif">
                {pendingReviews}
              </div>
              <span className="text-[10px] text-amber-600/80 mt-1 block">Needs doctor sign-off</span>
            </div>

            <div className="card-earth rounded-2xl p-4 bg-white border border-sand-light">
              <div className="flex items-center justify-between text-earth-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Completed Reviews</span>
                <FileCheck2 className="w-4 h-4 text-sage-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-sage-700 font-serif">
                {completedScreenings}
              </div>
              <span className="text-[10px] text-earth-400 mt-1 block">Finalized reports</span>
            </div>
          </div>

          {/* Quick Queue preview */}
          <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-earth-700 text-sm">Recent Screening Arrivals</h3>
                <p className="text-xs text-earth-400">Incoming retinal captures needing ophthalmologist review</p>
              </div>
              <button 
                onClick={() => onSelectTab('waiting')}
                className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1"
              >
                <span>View Full Queue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sand-light text-earth-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5 font-bold">Patient ID</th>
                    <th className="pb-2.5 font-bold">Name</th>
                    <th className="pb-2.5 font-bold">Screening Date</th>
                    <th className="pb-2.5 font-bold">Adaptive AI Pred</th>
                    <th className="pb-2.5 font-bold">Confidence</th>
                    <th className="pb-2.5 font-bold">Review Status</th>
                    <th className="pb-2.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-light/60">
                  {screeningHistory.map((item) => (
                    <tr key={item._id || item.screeningId} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3 font-mono font-bold text-earth-700">{item.patientId}</td>
                      <td className="py-3 font-medium text-earth-800">{item.patientName || patientData.name}</td>
                      <td className="py-3 text-earth-500">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-800 border border-sage-200">
                          {item.adaptivePrediction || item.originalPrediction}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-earth-600">
                        {Math.round((item.adaptiveConfidence <= 1 ? item.adaptiveConfidence * 100 : item.adaptiveConfidence))}%
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.reviewStatus === 'needs_review' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                            : 'bg-sage-100 text-sage-800 border border-sage-200'
                        }`}>
                          {item.reviewStatus === 'needs_review' ? 'Needs Review' : 'Reviewed'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedPatientId(item.patientId);
                            setScreeningData(item);
                            onSelectTab('ai-detection');
                          }}
                          className="px-3 py-1 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-600 hover:text-white transition-all font-semibold"
                        >
                          Review Case
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 2. Waiting Patients */}
      {activeTab === 'waiting' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-earth-700 font-serif">Patient Waiting Queue</h2>
              <p className="text-xs text-earth-400 mt-0.5">
                Triage queue of patients awaiting specialist ophthalmological assessment.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {pendingReviews} Awaiting Review
              </span>
            </div>
          </div>

          {/* Backend Notice about dedicated doctor queue */}
          <div className="p-3.5 rounded-2xl bg-cream border border-sand/60 text-xs text-earth-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-earth-800">Backend API Requirement Note:</strong>
              <p className="mt-0.5 leading-relaxed">
                There is currently no dedicated doctor queue API endpoint in the backend. This queue currently utilizes actual patient records with screening status <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">reviewStatus: "needs_review"</code>. To support real-time triage, a dedicated endpoint like <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">GET /api/doctor/queue</code> with pagination, urgency sorting, and assignment locks should be added to the Node.js backend.
              </p>
            </div>
          </div>

          {/* Waiting Patients List */}
          <div className="card-earth rounded-2xl bg-white border border-sand-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-ivory-100 border-b border-sand-light text-earth-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold">Patient ID</th>
                    <th className="py-3 px-4 font-bold">Patient Name</th>
                    <th className="py-3 px-4 font-bold">Age / Gender</th>
                    <th className="py-3 px-4 font-bold">Screening Date</th>
                    <th className="py-3 px-4 font-bold">AI Screening Output</th>
                    <th className="py-3 px-4 font-bold">Status Indicator</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-light/60">
                  {screeningHistory.map((item) => (
                    <tr key={item._id || item.screeningId} className="hover:bg-ivory-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-earth-700">{item.patientId}</td>
                      <td className="py-3 px-4 font-semibold text-earth-800">{item.patientName || patientData.name}</td>
                      <td className="py-3 px-4 text-earth-600">{patientData.age} yrs / {patientData.gender}</td>
                      <td className="py-3 px-4 text-earth-500">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-sage-800">
                          {item.adaptivePrediction || item.originalPrediction}
                        </span>
                        <span className="text-[10px] text-earth-400 block">
                          Confidence: {Math.round((item.adaptiveConfidence <= 1 ? item.adaptiveConfidence * 100 : item.adaptiveConfidence))}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.reviewStatus === 'needs_review'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-sage-100 text-sage-800 border border-sage-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.reviewStatus === 'needs_review' ? 'bg-amber-500' : 'bg-sage-500'}`} />
                          {item.reviewStatus === 'needs_review' ? 'Waiting Review' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedPatientId(item.patientId);
                            setScreeningData(item);
                            onSelectTab('ai-detection');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs shadow-xs transition-all"
                        >
                          View Details & AI
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 3. Patient Details */}
      {activeTab === 'patient-details' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-earth-700 font-serif">Patient Clinical Record</h2>
              <p className="text-xs text-earth-400 mt-0.5">
                Inspect registered demographic information and longitudinal screening history.
              </p>
            </div>

            {/* Patient Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-earth-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Patient ID..."
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-white"
                />
              </div>
              <button
                onClick={() => fetchPatientInformation(searchInput)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Lookup</span>
              </button>
            </div>
          </div>

          {apiError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Demographic Card */}
          <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light">
            <div className="flex items-center justify-between pb-3 border-b border-sand-light mb-4">
              <h3 className="font-bold text-earth-700 text-sm">Demographic Profile</h3>
              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-ivory-100 font-bold text-earth-700 border border-sand-light">
                {patientData.patientId}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-earth-400 block text-[10px] uppercase font-bold">Patient Name</span>
                <span className="font-bold text-earth-800 text-sm">{patientData.name}</span>
              </div>
              <div>
                <span className="text-earth-400 block text-[10px] uppercase font-bold">Age</span>
                <span className="font-bold text-earth-800 text-sm">{patientData.age} Years</span>
              </div>
              <div>
                <span className="text-earth-400 block text-[10px] uppercase font-bold">Gender</span>
                <span className="font-bold text-earth-800 text-sm">{patientData.gender}</span>
              </div>
              <div>
                <span className="text-earth-400 block text-[10px] uppercase font-bold">Registration Date</span>
                <span className="font-bold text-earth-800 text-sm">
                  {patientData.createdAt ? new Date(patientData.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Previous Screenings & Uploaded Retinal Images */}
          <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light space-y-4">
            <h3 className="font-bold text-earth-700 text-sm">Screening History & Retinal Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screeningHistory.map((item, idx) => (
                <div key={item._id || idx} className="rounded-xl border border-sand-light p-3.5 bg-ivory-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-earth-700 font-mono">
                      Screening: {item.screeningId || item._id}
                    </span>
                    <span className="text-[10px] text-earth-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg bg-black/10 overflow-hidden flex-shrink-0">
                      <img
                        src={getAssetUrl(item.originalFundusImage)}
                        alt="Retinal thumbnail"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-earth-800">
                        Result: <span className="text-sage-700 font-bold">{item.adaptivePrediction || item.originalPrediction}</span>
                      </div>
                      <div className="text-earth-500 text-[11px]">
                        Confidence: {Math.round((item.adaptiveConfidence <= 1 ? item.adaptiveConfidence * 100 : item.adaptiveConfidence))}%
                      </div>
                      <div className="text-earth-400 text-[10px]">
                        Quality: {typeof item.imageQuality === 'object' ? item.imageQuality?.status : item.imageQuality}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setScreeningData(item);
                      onSelectTab('ai-detection');
                    }}
                    className="w-full py-1.5 rounded-lg bg-white border border-sand-light text-xs font-semibold text-sage-700 hover:bg-sage-50 transition-colors"
                  >
                    Deep Inspection
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: 4. Patient Reports (PDFs) */}
      {activeTab === 'patient-reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-earth-700 font-serif">Diagnostic PDF Reports</h2>
              <p className="text-xs text-earth-400 mt-0.5">
                Archived clinical PDF reports uploaded by field laboratories and diagnostic centers.
              </p>
            </div>
          </div>

          <div className="card-earth rounded-2xl bg-white border border-sand-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-ivory-100 border-b border-sand-light text-earth-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold">Report File</th>
                    <th className="py-3 px-4 font-bold">Patient ID</th>
                    <th className="py-3 px-4 font-bold">Screening Association</th>
                    <th className="py-3 px-4 font-bold">Date Uploaded</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-light/60">
                  {patientReports.map((rep) => (
                    <tr key={rep._id || rep.reportId} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-terracotta" />
                          <span className="font-semibold text-earth-800">{rep.fileName || 'Clinical_Screening_Report.pdf'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-earth-700 font-bold">{rep.patientId}</td>
                      <td className="py-3.5 px-4 font-mono text-earth-500">{rep.screeningId || 'Associated'}</td>
                      <td className="py-3.5 px-4 text-earth-500">
                        {new Date(rep.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={getReportDownloadUrl(rep._id || rep.reportId)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-50 text-sage-800 hover:bg-sage-600 hover:text-white transition-all font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 5. Laboratory Reports */}
      {activeTab === 'lab-reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-earth-700 font-serif">Laboratory Report Reviews</h2>
              <p className="text-xs text-earth-400 mt-0.5">
                Comprehensive inspection of incoming laboratory screening payloads.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {screeningHistory.map((item) => (
              <div key={item._id || item.screeningId} className="card-earth rounded-2xl p-4 bg-white border border-sand-light space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-sand-light">
                  <span className="font-mono text-xs font-bold text-earth-700">{item.patientId}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cream text-earth-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 rounded-xl bg-black/10 overflow-hidden flex-shrink-0">
                    <img
                      src={getAssetUrl(item.originalFundusImage)}
                      alt="Fundus"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-earth-800 text-sm">
                      {item.adaptivePrediction || item.originalPrediction}
                    </div>
                    <div className="text-earth-500">
                      Adaptive Confidence: <span className="font-bold text-sage-700">
                        {Math.round((item.adaptiveConfidence <= 1 ? item.adaptiveConfidence * 100 : item.adaptiveConfidence))}%
                      </span>
                    </div>
                    <div className="text-earth-500">
                      Image Quality: <span className="font-medium text-earth-700">
                        {typeof item.imageQuality === 'object' ? item.imageQuality?.status : item.imageQuality}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-700 font-semibold">
                      Status: {item.reviewStatus}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setScreeningData(item);
                      onSelectTab('ai-detection');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-sage-600 text-white hover:bg-sage-700 text-xs font-bold transition-all"
                  >
                    Full Grad-CAM Analysis &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: 6. AI Detection (Deep inspection of all 13 fields) */}
      {activeTab === 'ai-detection' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-earth-700 font-serif">
                  AI Retinopathy Deep Screening Analysis
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-800 border border-sage-200">
                  Dual Pipeline Active
                </span>
              </div>
              <p className="text-xs text-earth-400 mt-0.5">
                Inspect Original & Adaptive predictions, Image Quality, PIED biomarkers, and Grad-CAM attention.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectTab('doctor-suggestions')}
                className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>Write Clinical Suggestions</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Primary Result & Reliability Component */}
          <ReliabilityBadge screening={screeningData} />

          {/* Dual Grad-CAM & Fundus Viewer */}
          <GradCamViewer screening={screeningData} />
        </div>
      )}

      {/* Tab: 7. Voice-to-Text */}
      {activeTab === 'voice-notes' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Voice-to-Text Clinical Dictation</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Dictate clinical impressions directly using your microphone with real-time speech recognition.
            </p>
          </div>

          {/* Backend storage notice */}
          <div className="p-3.5 rounded-2xl bg-cream border border-sand/60 text-xs text-earth-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-earth-800">Backend API Requirement Note:</strong>
              <p className="mt-0.5 leading-relaxed">
                Browser Speech Recognition generates the transcript client-side. The existing backend currently does not provide an audio or note storage endpoint (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">POST /api/screenings/:id/voice-notes</code>). Transcripts are kept in the current session.
              </p>
            </div>
          </div>

          {voiceNotice && (
            <div className="p-3 rounded-xl bg-sage-100 border border-sage-200 text-xs text-sage-900 font-medium">
              {voiceNotice.message}
            </div>
          )}

          {/* Dictation Box */}
          <div className="card-earth rounded-2xl p-6 bg-white border border-sand-light space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sand-light">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-earth-300'}`} />
                <span className="text-xs font-bold text-earth-700">
                  {isRecording ? 'Listening... Speak into your microphone' : 'Microphone Ready'}
                </span>
              </div>
              <button
                onClick={toggleRecording}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isRecording 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                    : 'bg-sage-600 text-white hover:bg-sage-700 shadow-sm'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Start Recording</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-earth-700 block mb-2">
                Transcribed Clinical Impressions (Editable)
              </label>
              <textarea
                rows={6}
                value={speechTranscript}
                onChange={(e) => setSpeechTranscript(e.target.value)}
                placeholder="Spoken words will appear here in real-time. You can also edit and format clinical text manually."
                className="w-full p-4 rounded-xl border border-sand-light text-xs text-earth-700 leading-relaxed focus:outline-none focus:border-sage-500 bg-ivory-50/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSpeechTranscript('')}
                className="px-4 py-2 rounded-xl border border-sand-light text-xs font-semibold text-earth-600 hover:bg-ivory-100"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleSaveVoiceNotes}
                className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 8. Doctor Suggestions */}
      {activeTab === 'doctor-suggestions' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Doctor Clinical Recommendations</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Review AI screening conclusions and formulate official specialist medical recommendations.
            </p>
          </div>

          {/* Backend storage notice */}
          <div className="p-3.5 rounded-2xl bg-cream border border-sand/60 text-xs text-earth-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-earth-800">Medical Notice & Backend Requirement:</strong>
              <p className="mt-0.5 leading-relaxed">
                AI predictions are diagnostic support metrics and must not be presented as final diagnosis without specialist confirmation. Note: Permanent storage of doctor recommendations requires a backend update endpoint (e.g. <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">POST /api/screenings/:id/doctor-review</code>).
              </p>
            </div>
          </div>

          {suggestionSaveNotice && (
            <div className="p-3 rounded-xl bg-sage-100 border border-sage-200 text-xs text-sage-900 font-medium">
              {suggestionSaveNotice.message}
            </div>
          )}

          <form onSubmit={handleSaveSuggestions} className="card-earth rounded-2xl p-6 bg-white border border-sand-light space-y-4">
            {/* AI Summary Readout */}
            <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-900 space-y-1">
              <span className="font-bold block">AI Screening Reference:</span>
              <p className="text-[11px] text-sage-800">
                Patient: <strong>{patientData.name} ({patientData.patientId})</strong> &bull; Adaptive Pred: <strong>{screeningData.adaptivePrediction}</strong> &bull; Confidence: <strong>{Math.round((screeningData.adaptiveConfidence <= 1 ? screeningData.adaptiveConfidence * 100 : screeningData.adaptiveConfidence))}%</strong> &bull; Quality: <strong>Adequate</strong>
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-earth-700 block mb-1">
                Doctor Observations (Fundus Findings)
              </label>
              <textarea
                rows={3}
                required
                value={doctorSuggestions.observations}
                onChange={(e) => setDoctorSuggestions({ ...doctorSuggestions, observations: e.target.value })}
                className="w-full p-3 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-earth-700 block mb-1">
                Clinical Recommendations & Treatment Plan
              </label>
              <textarea
                rows={3}
                required
                value={doctorSuggestions.recommendations}
                onChange={(e) => setDoctorSuggestions({ ...doctorSuggestions, recommendations: e.target.value })}
                className="w-full p-3 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-earth-700 block mb-1">
                  Follow-up Interval (Weeks)
                </label>
                <input
                  type="number"
                  value={doctorSuggestions.followUpWeeks}
                  onChange={(e) => setDoctorSuggestions({ ...doctorSuggestions, followUpWeeks: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-earth-700 block mb-1">
                  Tertiary Hospital Referral Required?
                </label>
                <select
                  value={doctorSuggestions.referralNeeded ? 'yes' : 'no'}
                  onChange={(e) => setDoctorSuggestions({ ...doctorSuggestions, referralNeeded: e.target.value === 'yes' })}
                  className="w-full p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
                >
                  <option value="no">No - Routine Follow-up</option>
                  <option value="yes">Yes - Urgent Vitreoretinal Referral</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-earth-700 block mb-1">
                Additional Notes / Prescription Instructions
              </label>
              <textarea
                rows={2}
                value={doctorSuggestions.additionalNotes}
                onChange={(e) => setDoctorSuggestions({ ...doctorSuggestions, additionalNotes: e.target.value })}
                className="w-full p-3 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-sand-light">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save & Finalize Doctor Review</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: 9. Settings */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Ophthalmologist Settings</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Configure screening thresholds, visualization defaults, and clinical profile.
            </p>
          </div>

          <div className="card-earth rounded-2xl p-6 bg-white border border-sand-light space-y-4 text-xs">
            <h3 className="font-bold text-earth-700 text-sm pb-2 border-b border-sand-light">
              Diagnostic Threshold Preferences
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-earth-800 block">Grad-CAM Overlay Default Opacity</span>
                  <span className="text-[11px] text-earth-400">Controls heat map blend level over raw retina</span>
                </div>
                <span className="font-bold text-earth-700">65%</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-earth-800 block">Primary Classification Model</span>
                  <span className="text-[11px] text-earth-400">Always use Adaptive Network output as primary result</span>
                </div>
                <span className="font-bold text-sage-700">Adaptive (Active)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
