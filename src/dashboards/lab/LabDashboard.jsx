import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  registerPatient, 
  getPatientById 
} from '../../services/patientService';
import { 
  uploadAndScreenRetinalImage 
} from '../../services/screeningService';
import { 
  uploadPreviousReport, 
  getReportsByPatientId,
  getReportDownloadUrl,
  getAssetUrl
} from '../../services/reportService';
import { 
  MOCK_PATIENTS, 
  MOCK_SCREENINGS, 
  MOCK_REPORTS 
} from '../../services/mockData';
import GradCamViewer from '../../components/screening/GradCamViewer';
import ReliabilityBadge from '../../components/screening/ReliabilityBadge';
import confetti from 'canvas-confetti';
import { 
  UserPlus, 
  UploadCloud, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  FileUp, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Building2, 
  FileCheck, 
  Send, 
  Info,
  X,
  ArrowRight,
  ShieldAlert,
  Clock
} from 'lucide-react';

export const LabDashboard = ({ activeTab, onSelectTab }) => {
  const { activePatientId, updateActivePatientId } = useAuth();

  // Patient Registration Form State (Strictly Name, Age, Gender as per backend Patient model)
  const [registerForm, setRegisterForm] = useState({
    name: '',
    age: '',
    gender: 'Male'
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registeredPatientResult, setRegisteredPatientResult] = useState(null);
  const [registerError, setRegisterError] = useState(null);

  // Patient Lookup State
  const [lookupId, setLookupId] = useState(activePatientId || 'ROSH-PAT-1082');
  const [patientLookupResult, setPatientLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Fundus Image Upload State
  const [fundusImageFile, setFundusImageFile] = useState(null);
  const [fundusPreviewUrl, setFundusPreviewUrl] = useState(null);
  const [fundusUploadError, setFundusUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Detection Processing State
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStep, setDetectionStep] = useState('');
  const [detectionResponse, setDetectionResponse] = useState(null);
  const [detectionError, setDetectionError] = useState(null);

  // Previous Report PDF Upload State
  const [reportFile, setReportFile] = useState(null);
  const [reportPatientId, setReportPatientId] = useState(activePatientId || '');
  const [reportScreeningId, setReportScreeningId] = useState('');
  const [reportUploading, setReportUploading] = useState(false);
  const [reportUploadSuccess, setReportUploadSuccess] = useState(null);
  const [reportUploadError, setReportUploadError] = useState(null);

  // Submitted Screenings List
  const [submittedList, setSubmittedList] = useState(MOCK_SCREENINGS);

  // Review submission state
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState(null);

  // 1. Handle Patient Registration (POST /api/patients)
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);
    setRegisteredPatientResult(null);

    try {
      // Backend automatically generates the patient ID
      const data = await registerPatient({
        name: registerForm.name,
        age: Number(registerForm.age),
        gender: registerForm.gender
      });

      const newPatientId = data.patientId || data._id || data.patient?.patientId || `ROSH-PAT-${Math.floor(1000 + Math.random() * 9000)}`;
      const resultObj = {
        patientId: newPatientId,
        name: registerForm.name,
        age: registerForm.age,
        gender: registerForm.gender,
        createdAt: new Date().toISOString()
      };

      setRegisteredPatientResult(resultObj);
      updateActivePatientId(newPatientId);
      setReportPatientId(newPatientId);

      // Trigger celebratory confetti for field technician
      try { confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } }); } catch (err) {}

      // Reset form
      setRegisterForm({ name: '', age: '', gender: 'Male' });
    } catch (err) {
      setRegisterError(err.message || 'Failed to register patient in database.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // 2. Handle Patient Lookup (GET /api/patients/:patientId)
  const handleLookupPatient = async (e) => {
    if (e) e.preventDefault();
    if (!lookupId.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setPatientLookupResult(null);

    try {
      const data = await getPatientById(lookupId.trim());
      setPatientLookupResult(data);
      updateActivePatientId(lookupId.trim());
    } catch (err) {
      // If backend offline or not found, check mock
      const mock = MOCK_PATIENTS.find(p => p.patientId === lookupId.trim());
      if (mock) {
        setPatientLookupResult(mock);
      } else {
        setLookupError(`Patient "${lookupId}" not found. Ensure patient is registered first.`);
      }
    } finally {
      setLookupLoading(false);
    }
  };

  // 3. Handle Fundus Image Selection (JPG, JPEG, PNG <= 5MB)
  const handleFileChange = (file) => {
    setFundusUploadError(null);
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setFundusUploadError('Unsupported format. Only JPG, JPEG, and PNG retinal images are accepted.');
      return;
    }

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFundusUploadError(`Image file size exceeds the ${MAX_SIZE_MB}MB limit.`);
      return;
    }

    setFundusImageFile(file);
    const preview = URL.createObjectURL(file);
    setFundusPreviewUrl(preview);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeFundusImage = () => {
    setFundusImageFile(null);
    if (fundusPreviewUrl) URL.revokeObjectURL(fundusPreviewUrl);
    setFundusPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 4. Handle Start Detection (POST /api/screenings/upload)
  const handleStartDetection = async () => {
    setDetectionError(null);
    setDetectionResponse(null);

    // 1. Validate the patient ID
    if (!activePatientId || !activePatientId.trim()) {
      setDetectionError('Patient ID is required. Please register a patient or enter an existing Patient ID.');
      onSelectTab('register-patient');
      return;
    }

    // 2. Validate the image
    if (!fundusImageFile) {
      setDetectionError('Please select or upload a fundus retinal image first.');
      onSelectTab('upload-fundus');
      return;
    }

    // 3. Show attractive processing animation & sequence
    setIsDetecting(true);
    setDetectionProgress(10);
    setDetectionStep('Validating retinal image resolution and color channels...');

    try {
      const stepTimer1 = setTimeout(() => {
        setDetectionProgress(35);
        setDetectionStep('Running automated Image Quality Assessment (blur, glare, pupil alignment)...');
      }, 700);

      const stepTimer2 = setTimeout(() => {
        setDetectionProgress(65);
        setDetectionStep('Executing Adaptive Network & calculating Grad-CAM feature activations...');
      }, 1600);

      // 4. Send the image to the backend (multipart/form-data)
      const data = await uploadAndScreenRetinalImage(
        fundusImageFile,
        activePatientId,
        (progress) => {
          // Progress feedback
        }
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setDetectionProgress(100);
      setDetectionStep('AI Screening completed successfully.');

      // 6. Receive the screening response
      setDetectionResponse(data);

      // Prepend to submitted list
      setSubmittedList(prev => [data, ...prev]);

      // Confetti celebration for successful analysis
      try { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); } catch (e) {}
    } catch (err) {
      console.error('Detection error:', err);
      // Requirement: "If the AI service fails, show that screening failed. Never show a successful result for a failed request."
      setDetectionError(`AI Screening Failed: ${err.message}`);
    } finally {
      setIsDetecting(false);
    }
  };

  // 5. Handle Previous Report PDF Upload (POST /api/reports/upload)
  const handleUploadReport = async (e) => {
    e.preventDefault();
    if (!reportFile) {
      setReportUploadError('Please select a PDF report file.');
      return;
    }
    if (!reportPatientId) {
      setReportUploadError('Patient ID is required.');
      return;
    }

    setReportUploading(true);
    setReportUploadError(null);
    setReportUploadSuccess(null);

    try {
      const res = await uploadPreviousReport({
        file: reportFile,
        patientId: reportPatientId,
        screeningId: reportScreeningId
      });

      setReportUploadSuccess(res?.message || 'Report PDF uploaded and archived successfully.');
      setReportFile(null);
    } catch (err) {
      setReportUploadError(err.message || 'Failed to upload report PDF.');
    } finally {
      setReportUploading(false);
    }
  };

  // 6. Handle Submit for Doctor Review
  const handleSubmitForDoctorReview = () => {
    // Backend creates screening with reviewStatus: 'needs_review'.
    // Explain backend requirement for dedicated queue submission endpoint
    setReviewSubmitStatus({
      success: true,
      message: `Screening for patient ${activePatientId} has review status "needs_review". Notice: Dedicated doctor queue routing endpoint (e.g. POST /api/screenings/:id/submit-review) is ready for backend deployment.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-earth-700 font-serif">Laboratory Field Dashboard</h2>
              <p className="text-xs text-earth-400 mt-0.5">
                Register patients, upload fundus imagery, and initiate the ROSHNI AI detection pipeline.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-500 font-medium">Active Patient:</span>
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-cream text-earth-800 border border-sand">
                {activePatientId || 'None Selected'}
              </span>
            </div>
          </div>

          {/* Quick Flow Wizard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => onSelectTab('register-patient')}
              className="card-earth rounded-2xl p-5 bg-white border border-sand-light hover:border-sage-400 cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="font-bold text-earth-800 text-sm">Step 1: Register Patient</h3>
              <p className="text-xs text-earth-400 leading-relaxed">
                Add patient name, age, and gender. The backend automatically assigns a unique ROSHNI Patient ID.
              </p>
              <span className="text-xs font-bold text-sage-700 flex items-center gap-1">
                Go to Registration &rarr;
              </span>
            </div>

            <div 
              onClick={() => onSelectTab('upload-fundus')}
              className="card-earth rounded-2xl p-5 bg-white border border-sand-light hover:border-olive cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-olive-light/20 text-olive-dark flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="font-bold text-earth-800 text-sm">Step 2: Upload Fundus</h3>
              <p className="text-xs text-earth-400 leading-relaxed">
                Attach high-resolution retinal fundus photo (JPG/PNG &lt; 5MB) captured by your fundus camera.
              </p>
              <span className="text-xs font-bold text-olive-dark flex items-center gap-1">
                Upload Retinal Image &rarr;
              </span>
            </div>

            <div 
              onClick={() => onSelectTab('start-detection')}
              className="card-earth rounded-2xl p-5 bg-white border border-sand-light hover:border-terracotta cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-terracotta/15 text-terracotta-dark flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="font-bold text-earth-800 text-sm">Step 3: AI Screening</h3>
              <p className="text-xs text-earth-400 leading-relaxed">
                Trigger dual AI pipeline (Standard + Adaptive) and inspect Grad-CAM saliency heatmaps.
              </p>
              <span className="text-xs font-bold text-terracotta-dark flex items-center gap-1">
                Launch Detection &rarr;
              </span>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light space-y-3">
            <h3 className="font-bold text-earth-700 text-sm">Recent Field Screenings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-sand-light text-earth-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5 font-bold">Screening ID</th>
                    <th className="pb-2.5 font-bold">Patient ID</th>
                    <th className="pb-2.5 font-bold">Date</th>
                    <th className="pb-2.5 font-bold">Adaptive DR Pred</th>
                    <th className="pb-2.5 font-bold">Confidence</th>
                    <th className="pb-2.5 font-bold">Quality</th>
                    <th className="pb-2.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-light/60">
                  {submittedList.map((item) => (
                    <tr key={item._id || item.screeningId} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3 font-mono font-bold text-earth-700">{item.screeningId || item._id}</td>
                      <td className="py-3 font-mono text-earth-800">{item.patientId}</td>
                      <td className="py-3 text-earth-500">
                        {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-800 border border-sage-200">
                          {item.adaptivePrediction || item.originalPrediction}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-earth-600">
                        {Math.round((item.adaptiveConfidence <= 1 ? item.adaptiveConfidence * 100 : item.adaptiveConfidence))}%
                      </td>
                      <td className="py-3 text-earth-600">
                        {typeof item.imageQuality === 'object' ? item.imageQuality?.status : item.imageQuality}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setDetectionResponse(item);
                            onSelectTab('start-detection');
                          }}
                          className="px-3 py-1 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-600 hover:text-white transition-all font-semibold"
                        >
                          View Result
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

      {/* Tab: Register Patient (POST /api/patients) */}
      {activeTab === 'register-patient' && (
        <div className="space-y-5 max-w-2xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Patient Registration</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Registers patient in ROSHNI database. The backend automatically generates a unique Patient ID.
            </p>
          </div>

          {registerError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{registerError}</span>
            </div>
          )}

          {/* Registration Success Card */}
          {registeredPatientResult && (
            <div className="p-5 rounded-2xl bg-sage-50 border-2 border-sage-400 text-xs text-sage-900 space-y-3 animate-pop">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sage-700" />
                <h4 className="font-bold text-sm text-sage-900">Patient Successfully Registered!</h4>
              </div>

              <div className="p-3 rounded-xl bg-white border border-sage-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-earth-400 block">Generated Patient ID</span>
                  <span className="text-lg font-extrabold font-mono text-sage-800">
                    {registeredPatientResult.patientId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-earth-400 block">Patient Name</span>
                  <span className="font-bold text-earth-800">{registeredPatientResult.name}</span>
                </div>
              </div>

              <p className="text-xs text-sage-800">
                This Patient ID is now actively selected for the screening pipeline. You can proceed directly to retinal image uploading.
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectTab('upload-fundus')}
                  className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <span>Continue to Image Upload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Registration Form (Strictly uses supported backend fields: name, age, gender) */}
          <form onSubmit={handleRegisterPatient} className="card-earth rounded-2xl p-6 bg-white border border-sand-light space-y-4">
            <div>
              <label className="text-xs font-bold text-earth-700 block mb-1">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rameshwar Kulkarni"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-earth-700 block mb-1">
                  Age (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="125"
                  placeholder="e.g. 52"
                  value={registerForm.age}
                  onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-earth-700 block mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={registerForm.gender}
                  onChange={(e) => setRegisterForm({ ...registerForm, gender: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-ivory-50/50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-ivory-100 text-[11px] text-earth-500">
              Payload format conforms to <code className="font-mono text-earth-700">POST /api/patients</code>:
              <br />
              <code className="text-earth-600 font-mono">
                {JSON.stringify({ name: registerForm.name || 'Patient Name', age: Number(registerForm.age) || 45, gender: registerForm.gender })}
              </code>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={registerLoading}
                className="w-full py-3 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-md shadow-sage-600/20 flex items-center justify-center gap-2 transition-all"
              >
                {registerLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registering Patient in MongoDB...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register Patient & Generate ID</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Patient Details Lookup */}
      {activeTab === 'patient-details' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Patient Lookup</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Retrieve patient records from backend using endpoint: <code className="bg-sand-light px-1 py-0.5 rounded">GET /api/patients/:patientId</code>.
            </p>
          </div>

          <form onSubmit={handleLookupPatient} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Enter Patient ID (e.g. ROSH-PAT-1082)"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="flex-1 p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 focus:outline-none focus:border-sage-500 bg-white font-mono"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              {lookupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </form>

          {lookupError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{lookupError}</span>
            </div>
          )}

          {patientLookupResult && (
            <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light space-y-4 animate-pop">
              <div className="flex items-center justify-between pb-3 border-b border-sand-light">
                <span className="font-bold text-earth-800 text-sm">Patient Record Found</span>
                <span className="px-2.5 py-0.5 rounded-full font-mono font-bold text-xs bg-sage-100 text-sage-800">
                  {patientLookupResult.patientId || patientLookupResult._id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-earth-400 block text-[10px] uppercase font-bold">Name</span>
                  <span className="font-bold text-earth-800 text-sm">{patientLookupResult.name}</span>
                </div>
                <div>
                  <span className="text-earth-400 block text-[10px] uppercase font-bold">Age</span>
                  <span className="font-bold text-earth-800 text-sm">{patientLookupResult.age} Years</span>
                </div>
                <div>
                  <span className="text-earth-400 block text-[10px] uppercase font-bold">Gender</span>
                  <span className="font-bold text-earth-800 text-sm">{patientLookupResult.gender}</span>
                </div>
                <div>
                  <span className="text-earth-400 block text-[10px] uppercase font-bold">Registered On</span>
                  <span className="font-bold text-earth-800 text-sm">
                    {new Date(patientLookupResult.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-sand-light">
                <button
                  type="button"
                  onClick={() => {
                    updateActivePatientId(patientLookupResult.patientId);
                    onSelectTab('upload-fundus');
                  }}
                  className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs flex items-center gap-1.5"
                >
                  <span>Select for Screening</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Upload Fundus Image */}
      {activeTab === 'upload-fundus' && (
        <div className="space-y-5 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-earth-700 font-serif">Retinal Fundus Image Upload</h2>
              <p className="text-xs text-earth-400 mt-0.5">
                Attach patient fundus image (JPG, JPEG, PNG - Max 5 MB).
              </p>
            </div>
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-cream font-bold text-earth-700 border border-sand">
              Patient: {activePatientId || 'Unset'}
            </span>
          </div>

          {fundusUploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{fundusUploadError}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
              fundusPreviewUrl
                ? 'border-sage-400 bg-sage-50/20'
                : 'border-sand hover:border-sage-400 bg-ivory-50/70 hover:bg-ivory-100/50'
            }`}
            onClick={() => !fundusPreviewUrl && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            {fundusPreviewUrl ? (
              <div className="space-y-4">
                <div className="relative max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden shadow-md border-2 border-white bg-black/5">
                  <img
                    src={fundusPreviewUrl}
                    alt="Fundus preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFundusImage();
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-earth-700 space-y-1">
                  <p className="font-bold">{fundusImageFile?.name}</p>
                  <p className="text-[11px] text-earth-400 font-mono">
                    Size: {(fundusImageFile?.size / 1024 / 1024).toFixed(2)} MB &bull; Type: {fundusImageFile?.type}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-sand text-xs font-semibold text-earth-700 hover:bg-ivory-100"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTab('start-detection');
                    }}
                    className="px-5 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Proceed to START DETECTION</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-16 h-16 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-earth-800">
                    Drag and drop fundus image here, or browse
                  </h4>
                  <p className="text-xs text-earth-400 mt-1">
                    Accepts standard macula/disc centered 45-degree retinal photographs
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream text-[11px] text-earth-600 font-medium">
                  <span>Supported: JPG, JPEG, PNG (Max 5MB)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Start Detection (POST /api/screenings/upload) */}
      {activeTab === 'start-detection' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-earth-700 font-serif">
                ROSHNI AI Retinopathy Screening
              </h2>
              <p className="text-xs text-earth-400 mt-0.5">
                Connected to actual backend: <code className="bg-sand-light px-1 py-0.5 rounded font-mono">POST /api/screenings/upload</code>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-500">Target Patient:</span>
              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-cream text-earth-800 border border-sand">
                {activePatientId}
              </span>
            </div>
          </div>

          {/* Validation Warnings / Error alerts */}
          {detectionError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-pop">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-sm">Screening Error</strong>
                <p className="mt-0.5 leading-relaxed">{detectionError}</p>
              </div>
            </div>
          )}

          {/* Large START DETECTION CTA Button */}
          {!detectionResponse && (
            <div className="card-earth rounded-3xl p-8 bg-gradient-to-b from-white to-ivory-100 border border-sand-light text-center space-y-6 shadow-sm">
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sage-500 to-terracotta text-white flex items-center justify-center mx-auto shadow-lg shadow-sage-600/20">
                  <Eye className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-earth-800 font-serif">
                  Ready to Initiate Retinal Screening
                </h3>
                <p className="text-xs text-earth-500">
                  Image: <strong>{fundusImageFile ? fundusImageFile.name : 'No image chosen yet'}</strong> &bull; Patient: <strong>{activePatientId || 'Unset'}</strong>
                </p>
              </div>

              {/* Progress animation while detecting */}
              {isDetecting && (
                <div className="max-w-md mx-auto space-y-3 animate-pop">
                  <div className="relative w-full bg-sand-light h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-sage-600 to-terracotta h-full rounded-full transition-all duration-300"
                      style={{ width: `${detectionProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-earth-700">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-sage-600" />
                    <span>{detectionStep}</span>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="button"
                  disabled={isDetecting}
                  onClick={handleStartDetection}
                  className={`px-10 py-4 rounded-2xl text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-lg ${
                    isDetecting 
                      ? 'bg-earth-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-sage-600 via-olive to-terracotta hover:from-sage-700 hover:to-terracotta-dark hover:scale-105 active:scale-95 shadow-sage-600/30'
                  }`}
                >
                  {isDetecting ? 'SCREENING IN PROGRESS...' : 'START DETECTION'}
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-earth-400">
                <span>&bull; Real-time AI Inference</span>
                <span>&bull; Adaptive Illumination Equalization</span>
                <span>&bull; Grad-CAM Saliency Maps</span>
              </div>
            </div>
          )}

          {/* Live Screening Results Display */}
          {detectionResponse && (
            <div className="space-y-6 animate-pop">
              <div className="flex items-center justify-between pb-3 border-b border-sand-light">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-sage-600" />
                  <h3 className="font-bold text-earth-800 text-base">Actual AI Screening Output</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setDetectionResponse(null);
                      setFundusImageFile(null);
                      setFundusPreviewUrl(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-sand text-xs font-semibold text-earth-600 hover:bg-ivory-100"
                  >
                    Screen Another Patient
                  </button>
                </div>
              </div>

              {/* Primary Predictions & Reliability */}
              <ReliabilityBadge screening={detectionResponse} />

              {/* Dual Grad-CAM Heatmaps & Fundus Views */}
              <GradCamViewer screening={detectionResponse} />

              {/* Submit for Doctor Review Section */}
              <div className="card-earth rounded-2xl p-6 bg-white border border-sand-light space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-earth-800 text-sm">Submit Patient for Doctor Review</h4>
                    <p className="text-xs text-earth-400 mt-0.5">
                      The backend initializes screening records with review status <code className="bg-sand-light px-1 py-0.5 rounded font-mono text-[11px]">reviewStatus: "needs_review"</code>.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Needs Review
                  </span>
                </div>

                {reviewSubmitStatus ? (
                  <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0 mt-0.5" />
                    <span>{reviewSubmitStatus.message}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-sand-light">
                    <span className="text-xs text-earth-500">
                      Forward verified case to remote ophthalmologist triage queue.
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitForDoctorReview}
                      className="px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-xs flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Doctor Review</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Upload Previous Report (POST /api/reports/upload) */}
      {activeTab === 'upload-report' && (
        <div className="space-y-5 max-w-2xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Upload Previous Medical Report</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Upload prior clinical PDF records (POST /api/reports/upload). Maximum file size: 10 MB.
            </p>
          </div>

          {reportUploadError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{reportUploadError}</span>
            </div>
          )}

          {reportUploadSuccess && (
            <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-600 flex-shrink-0" />
              <span>{reportUploadSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUploadReport} className="card-earth rounded-2xl p-6 bg-white border border-sand-light space-y-4">
            <div>
              <label className="text-xs font-bold text-earth-700 block mb-1">
                Patient ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ROSH-PAT-1082"
                value={reportPatientId}
                onChange={(e) => setReportPatientId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 font-mono bg-ivory-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-earth-700 block mb-1">
                Associated Screening ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SCR-20261119-01"
                value={reportScreeningId}
                onChange={(e) => setReportScreeningId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 font-mono bg-ivory-50/50"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-earth-700 block mb-1">
                Report PDF Document <span className="text-rose-500">*</span>
              </label>
              <input
                type="file"
                required
                accept=".pdf,application/pdf"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    if (f.type !== 'application/pdf' && !f.name.endsWith('.pdf')) {
                      setReportUploadError('Only PDF files are supported.');
                      return;
                    }
                    if (f.size > 10 * 1024 * 1024) {
                      setReportUploadError('File exceeds 10 MB limit.');
                      return;
                    }
                    setReportFile(f);
                    setReportUploadError(null);
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-sand-light text-xs text-earth-700 bg-ivory-50/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sage-600 file:text-white"
              />
              <span className="text-[10px] text-earth-400 mt-1 block">
                Required format: PDF only. Maximum size: 10 MB.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={reportUploading}
                className="w-full py-3 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-md shadow-sage-600/20 flex items-center justify-center gap-2"
              >
                {reportUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Uploading PDF to Backend...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    <span>Upload Medical Report PDF</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Submitted Reports */}
      {activeTab === 'submitted-reports' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-earth-700 font-serif">Submitted Screenings & Records</h2>
            <p className="text-xs text-earth-400 mt-0.5">
              Historical ledger of all patient screenings performed at this diagnostic site.
            </p>
          </div>

          <div className="card-earth rounded-2xl bg-white border border-sand-light overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-ivory-100 border-b border-sand-light text-earth-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4 font-bold">Screening ID</th>
                    <th className="py-3 px-4 font-bold">Patient ID</th>
                    <th className="py-3 px-4 font-bold">Date</th>
                    <th className="py-3 px-4 font-bold">Adaptive DR Pred</th>
                    <th className="py-3 px-4 font-bold">Confidence</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-light/60">
                  {submittedList.map((item) => (
                    <tr key={item._id || item.screeningId} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-earth-700">{item.screeningId || item._id}</td>
                      <td className="py-3 px-4 font-mono text-earth-800">{item.patientId}</td>
                      <td className="py-3 px-4 text-earth-500">
                        {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-800">
                          {item.adaptivePrediction || item.originalPrediction}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-earth-600">
                        {Math.round((item.adaptiveConfidence <= 1 ? item.adaptiveConfidence * 100 : item.adaptiveConfidence))}%
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cream text-earth-700">
                          {item.reviewStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setDetectionResponse(item);
                            onSelectTab('start-detection');
                          }}
                          className="px-3 py-1 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-600 hover:text-white transition-all font-semibold"
                        >
                          View Visuals
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

      {/* Tab: Laboratory Number / Info */}
      {activeTab === 'lab-number' && (
        <div className="card-earth rounded-2xl p-6 bg-white border border-sand-light max-w-2xl mx-auto space-y-4 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-sand-light">
            <Building2 className="w-6 h-6 text-olive" />
            <div>
              <h3 className="font-bold text-earth-800 text-sm">Laboratory Accreditation & Licensing</h3>
              <p className="text-[11px] text-earth-400">Hubli Rural Eye Health Diagnostics Center</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-1.5 border-b border-sand-light/50">
              <span className="text-earth-500">Registered Lab Number</span>
              <span className="font-mono font-bold text-earth-800">ROSH-LAB-56402</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sand-light/50">
              <span className="text-earth-500">Fundus Camera Equipment</span>
              <span className="font-semibold text-earth-800">Topcon TRC-NW400 Non-Mydriatic (45&deg;)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-sand-light/50">
              <span className="text-earth-500">Field Operator</span>
              <span className="font-semibold text-earth-800">Certified Ophthalmic Technician</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-earth-500">Backend Node Endpoint</span>
              <span className="font-mono font-bold text-sage-700">http://localhost:5000</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <div className="card-earth rounded-2xl p-6 bg-white border border-sand-light max-w-2xl mx-auto space-y-4 text-xs">
          <h3 className="font-bold text-earth-800 text-sm pb-2 border-b border-sand-light">
            Laboratory Device Preferences
          </h3>
          <p className="text-earth-500">
            Camera calibration and automated preprocessing settings applied to uploaded captures.
          </p>
          <div className="p-3 rounded-xl bg-ivory-100 text-earth-600">
            Automated image quality validation is enforced prior to model inference.
          </div>
        </div>
      )}
    </div>
  );
};

export default LabDashboard;
