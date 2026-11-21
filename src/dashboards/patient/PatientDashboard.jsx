import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  getPatientById, 
  getPatientScreeningHistory 
} from '../../services/patientService';
import { 
  getReportsByPatientId, 
  getReportDownloadUrl,
  getAssetUrl
} from '../../services/reportService';
import { 
  MOCK_PATIENTS, 
  MOCK_SCREENINGS, 
  MOCK_REPORTS, 
  MOCK_REMINDERS, 
  DR_CLASSIFICATIONS 
} from '../../services/mockData';
import { 
  HeartPulse, 
  Eye, 
  FileText, 
  Download, 
  MessageCircleQuestion, 
  Send, 
  Bell, 
  Plus, 
  Trash2, 
  Calendar, 
  Building2, 
  UserCircle, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ExternalLink,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Clock
} from 'lucide-react';

export const PatientDashboard = ({ activeTab, onSelectTab }) => {
  const { activePatientId, currentUser } = useAuth();
  const currentId = activePatientId || 'ROSH-PAT-1082';

  const [patientProfile, setPatientProfile] = useState(MOCK_PATIENTS[0]);
  const [screenings, setScreenings] = useState(MOCK_SCREENINGS);
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [isLoading, setIsLoading] = useState(false);

  // Reminders state (Local storage demonstration as backend has no reminder API yet)
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('roshni_patient_reminders');
    return saved ? JSON.parse(saved) : MOCK_REMINDERS;
  });
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderCategory, setNewReminderCategory] = useState('Eye Checkup');

  // Chat Assistant State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaste! I am your ROSHNI Eye Health Assistant. I can help explain your diabetic retinopathy screening results, common retinal symptoms, diet tips, and why regular eye checks protect your vision. How can I assist you today?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Fetch real patient data from backend
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const p = await getPatientById(currentId);
        if (p) setPatientProfile(p);

        const h = await getPatientScreeningHistory(currentId);
        if (h && Array.isArray(h) && h.length > 0) setScreenings(h);

        const r = await getReportsByPatientId(currentId);
        if (r && Array.isArray(r)) setReports(r);
      } catch (e) {
        // Fallback to sample data
        const mockP = MOCK_PATIENTS.find(p => p.patientId === currentId) || MOCK_PATIENTS[0];
        setPatientProfile(mockP);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentId]);

  const latestScreening = screenings[0] || MOCK_SCREENINGS[0];

  // Helper for Plain Language Explanation of DR Stage
  const getPlainLanguageExplanation = (stage) => {
    switch ((stage || '').toLowerCase()) {
      case 'no dr':
        return {
          title: 'Healthy Retina (No Signs of Retinopathy)',
          description: 'No blood vessel damage was seen in your retina. Your vision is healthy! Keep maintaining good blood sugar and blood pressure, and screen your eyes once every year.',
          urgency: 'Low Risk - Routine Annual Exam'
        };
      case 'mild':
        return {
          title: 'Mild Changes (Tiny Micro-ballooning)',
          description: 'Very tiny swellings in small retinal blood vessels (microaneurysms) were spotted. This does not usually cause vision loss, but indicates early eye sensitivity to diabetes. Strict sugar control can halt progression.',
          urgency: 'Moderate - Repeat Dilated Exam in 9-12 Months'
        };
      case 'moderate':
        return {
          title: 'Moderate Changes (Localized Retinal Changes)',
          description: 'Some retinal blood vessels are partially blocked or leaking tiny fluid spots. Vision might still feel normal, but specialist ophthalmologist assessment is important to prevent further changes.',
          urgency: 'Important - Specialist Clinic Review in 4-6 Months'
        };
      case 'severe':
      case 'proliferative dr':
        return {
          title: 'Urgent Care Required (Proliferative Changes)',
          description: 'More extensive blood vessel blockage or fragile new blood vessels have grown. Urgent treatment (such as laser therapy or anti-VEGF injections) can protect and preserve your sight.',
          urgency: 'High Priority - Schedule Vitreoretinal Consultation Promptly'
        };
      default:
        return {
          title: 'Screening Completed',
          description: 'Your retinal photograph has been scanned by the ROSHNI AI system and awaits ophthalmologist confirmation.',
          urgency: 'Follow up with your healthcare provider'
        };
    }
  };

  const plainExplanation = getPlainLanguageExplanation(latestScreening.adaptivePrediction || latestScreening.originalPrediction);

  // Chatbot logic (demonstration explaining medical terminology)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const newMsg = { id: Date.now(), sender: 'user', text: userText };
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = userText.toLowerCase();

      if (lower.includes('dr') || lower.includes('diabetic retinopathy')) {
        reply = 'Diabetic Retinopathy is a complication of diabetes that affects the eyes. It is caused by high blood glucose levels damaging the tiny blood vessels at the back of the eye (the retina). Early screening catches it before noticeable vision loss occurs!';
      } else if (lower.includes('moderate') || lower.includes('result') || lower.includes('report')) {
        reply = 'A Moderate NPDR result means the AI spotted localized microaneurysms or small exudates in your retina. While you may still see clearly right now, an ophthalmologist will evaluate if preventive therapy or closer monitoring (every 6 months) is needed.';
      } else if (lower.includes('diet') || lower.includes('food') || lower.includes('sugar')) {
        reply = 'Healthy nutrition helps protect your eyesight! Focus on leafy green vegetables (spinach, methi), whole grains, fiber-rich legumes, and lean proteins. Limit refined sugars, fried snacks, and sweetened beverages to keep HbA1c below 7%.';
      } else if (lower.includes('gradcam') || lower.includes('ai') || lower.includes('heat')) {
        reply = 'Grad-CAM heatmaps highlight where the AI model focused its attention on your retinal picture—similar to an ophthalmologist examining retinal vessels with an ophthalmoscope. It makes AI predictions transparent and verifiable by your doctor.';
      } else {
        reply = 'Thank you for your question. Maintaining controlled HbA1c, balanced blood pressure, and undergoing annual dilated eye examinations are the three golden rules to safeguard your vision against diabetic changes. Always consult your ophthalmologist for personal medical advice.';
      }

      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: reply }]);
      setIsBotTyping(false);
    }, 800);
  };

  // Add Reminder
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newReminderTitle || !newReminderDate) return;

    const item = {
      id: Date.now(),
      title: newReminderTitle,
      dueDate: newReminderDate,
      category: newReminderCategory,
      notes: 'Added from patient portal.'
    };

    const updated = [item, ...reminders];
    setReminders(updated);
    localStorage.setItem('roshni_patient_reminders', JSON.stringify(updated));
    setNewReminderTitle('');
    setNewReminderDate('');
  };

  const handleDeleteReminder = (id) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem('roshni_patient_reminders', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Tab: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Welcome Patient Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-ivory-100 via-cream to-terracotta/10 border border-sand-light shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-earth-400">
                  Patient Health Records
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-earth-800 font-serif">
                  Hello, {patientProfile.name}
                </h2>
                <p className="text-xs text-earth-500">
                  Patient ID: <span className="font-mono font-bold text-earth-700">{patientProfile.patientId}</span> &bull; Age: {patientProfile.age} yrs &bull; Gender: {patientProfile.gender}
                </p>
              </div>

              <button
                onClick={() => onSelectTab('screening-results')}
                className="px-5 py-2.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 self-start"
              >
                <Eye className="w-4 h-4" />
                <span>View Latest Eye Screening</span>
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light">
              <span className="text-[10px] font-bold uppercase text-earth-400 block mb-1">
                Latest Screening Date
              </span>
              <div className="flex items-center gap-2 text-earth-800 font-bold text-lg font-serif">
                <Calendar className="w-4 h-4 text-sage-600" />
                <span>
                  {new Date(latestScreening.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <span className="text-[11px] text-earth-400 mt-1 block">
                Screening ID: {latestScreening.screeningId || 'SCR-Latest'}
              </span>
            </div>

            <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light">
              <span className="text-[10px] font-bold uppercase text-earth-400 block mb-1">
                AI Screening Stage
              </span>
              <div className="flex items-center gap-2 text-earth-800 font-bold text-lg font-serif">
                <Sparkles className="w-4 h-4 text-terracotta" />
                <span className="text-sage-700 font-bold">
                  {latestScreening.adaptivePrediction || latestScreening.originalPrediction}
                </span>
              </div>
              <span className="text-[11px] text-earth-400 mt-1 block">
                Confidence: {Math.round((latestScreening.adaptiveConfidence <= 1 ? latestScreening.adaptiveConfidence * 100 : latestScreening.adaptiveConfidence))}%
              </span>
            </div>

            <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light">
              <span className="text-[10px] font-bold uppercase text-earth-400 block mb-1">
                Clinical Review Status
              </span>
              <div className="flex items-center gap-2 text-earth-800 font-bold text-lg font-serif">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-amber-700 capitalize">
                  {latestScreening.reviewStatus === 'needs_review' ? 'Under Specialist Review' : 'Doctor Reviewed'}
                </span>
              </div>
              <span className="text-[11px] text-earth-400 mt-1 block">
                Ophthalmology Triage
              </span>
            </div>
          </div>

          {/* Simplified Summary Banner */}
          <div className="card-earth rounded-2xl p-6 bg-white border border-sand-light space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-sand-light">
              <h3 className="font-bold text-earth-800 text-sm">Understanding Your Screening</h3>
              <button 
                onClick={() => onSelectTab('screening-results')}
                className="text-xs font-bold text-sage-700 hover:underline flex items-center gap-1"
              >
                <span>Full Explanation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-earth-600 leading-relaxed">
              {plainExplanation.description}
            </p>
            <div className="p-3 rounded-xl bg-ivory-100 text-xs text-earth-700 font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-sage-600 flex-shrink-0" />
              <span>Recommended Action: {plainExplanation.urgency}</span>
            </div>
          </div>

          {/* Available Reports list */}
          <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light space-y-3">
            <h3 className="font-bold text-earth-800 text-sm">Your Available Medical Reports</h3>
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r._id || r.reportId} className="flex items-center justify-between p-3 rounded-xl bg-ivory-50/70 border border-sand-light">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-terracotta" />
                    <div className="text-xs">
                      <p className="font-bold text-earth-800">{r.fileName || 'Diabetic_Retinopathy_Screening.pdf'}</p>
                      <span className="text-earth-400 text-[10px]">
                        Uploaded {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <a
                    href={getReportDownloadUrl(r._id || r.reportId)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Simplified Medical Report */}
      {activeTab === 'screening-results' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Simplified Medical Screening Report</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Clear, patient-friendly explanation of your latest retinal examination.
            </p>
          </div>

          {/* Medical Review Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Important Patient Disclaimer:</strong>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                This screening result was computed by the ROSHNI Artificial Intelligence system to support early diabetic eye risk detection. It does not replace a comprehensive dilated clinical examination by a certified ophthalmologist. Please share this report with your eye doctor.
              </p>
            </div>
          </div>

          {/* Plain Language Result Card */}
          <div className="card-earth rounded-3xl p-6 sm:p-8 bg-white border border-sand-light space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sand-light">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-earth-400">
                  Current Assessment
                </span>
                <h3 className="text-2xl font-bold text-earth-800 font-serif mt-0.5">
                  {plainExplanation.title}
                </h3>
              </div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-sage-100 text-sage-800 border border-sage-200 self-start">
                Result: {latestScreening.adaptivePrediction || latestScreening.originalPrediction}
              </span>
            </div>

            {/* Fundus Image preview for patient */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-ivory-50 border border-sand-light">
              <div className="w-36 h-36 rounded-2xl bg-black/10 overflow-hidden flex-shrink-0 shadow-sm border border-sand">
                <img
                  src={getAssetUrl(latestScreening.originalFundusImage)}
                  alt="Your Retinal Image"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=300&q=80';
                  }}
                />
              </div>
              <div className="text-xs space-y-2">
                <h4 className="font-bold text-earth-800 text-sm">Your Retinal Photograph</h4>
                <p className="text-earth-600 leading-relaxed">
                  Image Quality: <strong className="text-sage-700">{typeof latestScreening.imageQuality === 'object' ? latestScreening.imageQuality?.status : latestScreening.imageQuality}</strong>.
                  Clear illumination allowed our AI algorithms to inspect your fovea, macula, and delicate retinal blood vessels.
                </p>
                <span className="text-[11px] text-earth-400 block font-mono">
                  Captured at Diagnostic Laboratory &bull; ID: {latestScreening.screeningId}
                </span>
              </div>
            </div>

            {/* Explanation Details */}
            <div className="space-y-3">
              <h4 className="font-bold text-earth-800 text-sm">What this means in plain words</h4>
              <p className="text-xs text-earth-600 leading-relaxed">
                {plainExplanation.description}
              </p>
            </div>

            {/* Recommended Next Steps */}
            <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 space-y-2 text-xs">
              <h4 className="font-bold text-sage-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700" />
                <span>Recommended Next Steps</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sage-800 text-[11px]">
                <li>{plainExplanation.urgency}.</li>
                <li>Maintain a daily blood glucose log and schedule a routine HbA1c test every 3 months.</li>
                <li>If you ever notice dark floating spots, flashes of light, or sudden blurriness, visit an eye emergency clinic immediately.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab: My Reports (PDFs) */}
      {activeTab === 'my-reports' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">My Official Medical Reports</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Download your signed clinical PDF reports for your personal healthcare records.
            </p>
          </div>

          <div className="card-earth rounded-2xl bg-white border border-sand-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-ivory-100 border-b border-sand-light text-earth-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold">Document Title</th>
                    <th className="py-3 px-4 font-bold">Screening Association</th>
                    <th className="py-3 px-4 font-bold">Upload Date</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-light/60">
                  {reports.map((r) => (
                    <tr key={r._id || r.reportId} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-terracotta" />
                          <span className="font-semibold text-earth-800">{r.fileName || 'Screening_Summary.pdf'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-earth-600">{r.screeningId || 'General'}</td>
                      <td className="py-3.5 px-4 text-earth-500">
                        {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={getReportDownloadUrl(r._id || r.reportId)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs transition-all shadow-xs"
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

      {/* Tab: Chat Assistant (Eye health education) */}
      {activeTab === 'chat-assistant' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Eye Health Chat Assistant</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Ask questions about diabetic eye care, food suggestions, and screening terminology.
            </p>
          </div>

          {/* Backend limitation clarification */}
          <div className="p-3 rounded-xl bg-cream border border-sand/60 text-xs text-earth-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-earth-700">Demonstration Notice:</strong>
              <p className="text-[11px] mt-0.5">
                The existing backend currently does not provide a chatbot AI server endpoint. This assistant operates locally for diabetic eye education until connected to a backend conversational model.
              </p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="card-earth rounded-3xl bg-white border border-sand-light flex flex-col h-[480px] overflow-hidden">
            <div className="p-3.5 bg-ivory-100 border-b border-sand-light flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sage-600 text-white flex items-center justify-center text-xs font-bold">
                  R
                </div>
                <div>
                  <span className="font-bold text-earth-800 text-xs block">ROSHNI Retina Companion</span>
                  <span className="text-[10px] text-sage-700 font-medium">&bull; Online & Ready</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatMessages([chatMessages[0]])}
                className="text-[11px] text-earth-400 hover:text-earth-600 underline"
              >
                Clear History
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-ivory-50/30 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-sage-600 text-white rounded-br-none shadow-xs'
                        : 'bg-white text-earth-700 rounded-bl-none border border-sand-light shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-sand-light text-xs text-earth-400 italic">
                    ROSHNI Assistant is typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-sand-light flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about diabetic retinopathy, diet, or reports..."
                className="flex-1 p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Reminders */}
      {activeTab === 'reminders' && (
        <div className="space-y-5 max-w-2xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Checkup & Test Reminders</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Keep track of upcoming eye examinations, HbA1c tests, and prescriptions.
            </p>
          </div>

          {/* Backend Notice */}
          <div className="p-3 rounded-xl bg-cream border border-sand/60 text-xs text-earth-600">
            <strong>Demonstration Notice:</strong> The existing backend does not have a reminder API. Reminders are managed locally in this session until a dedicated reminder model is added to the backend.
          </div>

          {/* Add Reminder Form */}
          <form onSubmit={handleAddReminder} className="card-earth rounded-2xl p-5 bg-white border border-sand-light space-y-3 text-xs">
            <h4 className="font-bold text-earth-800 text-sm">Add New Health Reminder</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-earth-600 block mb-1">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Dilated Eye Exam"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-light bg-ivory-50/50 text-earth-700 focus:outline-none focus:border-sage-500"
                />
              </div>

              <div>
                <label className="font-semibold text-earth-600 block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newReminderDate}
                  onChange={(e) => setNewReminderDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-light bg-ivory-50/50 text-earth-700 focus:outline-none focus:border-sage-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Reminder</span>
              </button>
            </div>
          </form>

          {/* List of Reminders */}
          <div className="space-y-3">
            <h4 className="font-bold text-earth-800 text-sm">Upcoming Scheduled Reminders</h4>
            {reminders.map((rem) => (
              <div key={rem.id} className="card-earth rounded-2xl p-4 bg-white border border-sand-light flex items-center justify-between">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-terracotta" />
                    <span className="font-bold text-earth-800 text-sm">{rem.title}</span>
                  </div>
                  <p className="text-earth-500 text-[11px]">{rem.notes}</p>
                  <span className="inline-block font-mono text-[10px] font-bold text-sage-800 bg-sage-100 px-2 py-0.5 rounded-md">
                    Due: {rem.dueDate}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="p-2 rounded-xl text-earth-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Reminder"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Laboratory Details */}
      {activeTab === 'lab-details' && (
        <div className="card-earth rounded-2xl p-6 bg-white border border-sand-light max-w-2xl mx-auto space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-sand-light">
            <Building2 className="w-6 h-6 text-olive" />
            <div>
              <h3 className="font-bold text-earth-800 text-sm">Your Diagnostic Center Details</h3>
              <p className="text-[11px] text-earth-400">Apex Diagnostic Retina Laboratory (Hubli Rural Unit)</p>
            </div>
          </div>

          <div className="space-y-2 text-earth-600 leading-relaxed">
            <p><strong>Address:</strong> Hospital Road, Vidyanagar, Hubli, Karnataka 580021</p>
            <p><strong>Contact:</strong> +91 836 225 4321 &bull; support@apexretina.org</p>
            <p><strong>Imaging Hardware:</strong> High-Resolution Non-Mydriatic Fundus Camera</p>
            <p><strong>ROSHNI Station Code:</strong> ROSH-LAB-56402</p>
          </div>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="card-earth rounded-2xl p-6 bg-white border border-sand-light max-w-2xl mx-auto space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-sand-light">
            <UserCircle className="w-7 h-7 text-sage-600" />
            <div>
              <h3 className="font-bold text-earth-800 text-sm">Patient Profile</h3>
              <p className="text-[11px] text-earth-400">Personal Health Record</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-1.5 border-b border-sand-light/50">
              <span className="text-earth-500">Name</span>
              <span className="font-bold text-earth-800">{patientProfile.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sand-light/50">
              <span className="text-earth-500">Patient ID</span>
              <span className="font-mono font-bold text-earth-800">{patientProfile.patientId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sand-light/50">
              <span className="text-earth-500">Age / Gender</span>
              <span className="font-semibold text-earth-800">{patientProfile.age} Years / {patientProfile.gender}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-earth-500">Screening Protocol</span>
              <span className="font-semibold text-sage-700">ROSHNI AI Dual Pipeline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
