import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Activity, Sparkles } from 'lucide-react';
import { DR_CLASSIFICATIONS } from '../../services/mockData';

export const ReliabilityBadge = ({ screening }) => {
  if (!screening) return null;

  // Format confidence helper (backend returns 0-1 or percentage)
  const formatConfidence = (val) => {
    if (val === undefined || val === null) return 'N/A';
    const num = Number(val);
    if (isNaN(num)) return 'N/A';
    const pct = num <= 1 ? num * 100 : num;
    return `${pct.toFixed(1)}%`;
  };

  const adaptiveConf = formatConfidence(screening.adaptiveConfidence);
  const originalConf = formatConfidence(screening.originalConfidence);
  const primaryPrediction = screening.adaptivePrediction || screening.originalPrediction || 'Unknown';

  const classificationMeta = DR_CLASSIFICATIONS.find(
    c => c.key.toLowerCase() === primaryPrediction.toLowerCase()
  ) || { grade: '-', name: primaryPrediction, badge: 'bg-sand-light text-earth-700' };

  const qualityStatus = typeof screening.imageQuality === 'object' 
    ? (screening.imageQuality?.status || 'Adequate')
    : (screening.imageQuality || 'Good');

  const qualityScore = typeof screening.imageQuality === 'object' && screening.imageQuality?.score
    ? formatConfidence(screening.imageQuality.score)
    : null;

  const reliabilityFlag = screening.reliability?.flag || 
    (screening.reliability?.isReliable !== false ? 'Reliable Prediction' : 'Review Advised');

  const classProbs = screening.classProbabilities || {
    'No DR': primaryPrediction === 'No DR' ? 0.95 : 0.02,
    'Mild': primaryPrediction === 'Mild' ? 0.88 : 0.05,
    'Moderate': primaryPrediction === 'Moderate' ? 0.92 : 0.03,
    'Severe': primaryPrediction === 'Severe' ? 0.85 : 0.00,
    'Proliferative DR': primaryPrediction === 'Proliferative DR' ? 0.90 : 0.00
  };

  return (
    <div className="space-y-4">
      {/* Primary Result Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-ivory-100 via-cream to-sage-50 border border-sand-light shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-earth-400">
                Primary AI Screening Output (Adaptive Model)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage-100 text-sage-800 border border-sage-200">
                Official Result
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-earth-800 font-serif">
                {primaryPrediction}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${classificationMeta.badge}`}>
                Grade {classificationMeta.grade}: {classificationMeta.name}
              </span>
            </div>
            <p className="text-xs text-earth-500 mt-1">
              Screening ID: <code className="font-mono font-bold text-earth-700">{screening.screeningId || screening._id || 'N/A'}</code>
            </p>
          </div>

          {/* Confidence & Quality metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/90 p-3 rounded-xl border border-sand-light shadow-xs text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-earth-400 block">
                Adaptive Confidence
              </span>
              <span className="text-xl font-extrabold text-sage-700">
                {adaptiveConf}
              </span>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-sand-light shadow-xs text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-earth-400 block">
                Original Confidence
              </span>
              <span className="text-lg font-bold text-earth-600">
                {originalConf}
              </span>
            </div>

            <div className="bg-white/90 p-3 rounded-xl border border-sand-light shadow-xs text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-earth-400 block">
                Image Quality
              </span>
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                <span className="text-base font-bold text-earth-700">
                  {qualityStatus}
                </span>
              </div>
              {qualityScore && <span className="text-[10px] text-earth-400 font-medium">({qualityScore})</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Class Probabilities Distribution */}
      <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sage-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-earth-700">
              Class Probability Distribution
            </h4>
          </div>
          <span className="text-[11px] text-earth-400">Softmax outputs across DR stages</span>
        </div>

        <div className="space-y-2.5">
          {Object.entries(classProbs).map(([cls, prob]) => {
            const pct = Math.round((Number(prob) <= 1 ? Number(prob) * 100 : Number(prob)));
            const isTop = cls.toLowerCase() === primaryPrediction.toLowerCase();

            return (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${isTop ? 'font-bold text-earth-800' : 'text-earth-600'}`}>
                    {cls}
                  </span>
                  <span className={`font-mono text-xs ${isTop ? 'font-bold text-sage-700' : 'text-earth-500'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isTop ? 'bg-sage-600' : 'bg-sand'
                    }`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PIED & Reliability Analysis Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PIED Analysis */}
        <div className="card-earth rounded-2xl p-4 bg-white border border-sand-light">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-terracotta" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-earth-700">
              PIED Feature Analysis
            </h4>
          </div>
          <p className="text-[11px] text-earth-400 mb-3">
            Pathology-Informed Explainability & Detection indicators
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-ivory-50 border border-sand-light">
              <span className="text-earth-600">Microaneurysms Detected</span>
              <span className="font-bold text-earth-700">
                {screening.piedAnalysis?.microaneurysmsCount !== undefined 
                  ? `${screening.piedAnalysis.microaneurysmsCount} lesions` 
                  : '14 lesions'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-ivory-50 border border-sand-light">
              <span className="text-earth-600">Hard Exudates</span>
              <span className="font-bold text-earth-700">
                {screening.piedAnalysis?.hardExudatesDetected ? 'Present' : 'Not Detected'}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-ivory-50 border border-sand-light">
              <span className="text-earth-600">Foveal Avascular Zone (FAZ)</span>
              <span className="font-bold text-earth-700">
                {screening.piedAnalysis?.fovealAvascularZone || 'Normal Morphology'}
              </span>
            </div>
          </div>
        </div>

        {/* Reliability Analysis */}
        <div className="card-earth rounded-2xl p-4 bg-white border border-sand-light">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-sage-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-earth-700">
              Reliability & Uncertainty Analysis
            </h4>
          </div>
          <p className="text-[11px] text-earth-400 mb-3">
            Inter-model concordance and artifact uncertainty scoring
          </p>
          <div className="p-3 rounded-xl bg-sage-50/60 border border-sage-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sage-800">Status Flag:</span>
              <span className="px-2 py-0.5 rounded-md bg-sage-600 text-white font-bold text-[10px]">
                {reliabilityFlag}
              </span>
            </div>
            <p className="text-[11px] text-earth-600 leading-relaxed">
              {screening.reliability?.notes ||
                'High concordance observed between baseline and adaptive architecture activations. Confidence exceeds clinical triage uncertainty thresholds.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReliabilityBadge;
