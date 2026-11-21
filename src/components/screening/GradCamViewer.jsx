import React, { useState } from 'react';
import { Layers, Eye, Sliders, ZoomIn, Info, AlertCircle } from 'lucide-react';
import { getAssetUrl } from '../../services/reportService';

/**
 * GradCamViewer
 * Displays original and adaptive fundus images alongside Grad-CAM heatmaps.
 * Handles paths returned by backend:
 * - gradcam/original-<screeningId>.png
 * - gradcam/adaptive-<screeningId>.png
 */
export const GradCamViewer = ({ screening }) => {
  const [activeMode, setActiveMode] = useState('side-by-side');
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  if (!screening) return null;

  const originalFundusUrl = getAssetUrl(screening.originalFundusImage);
  const adaptiveFundusUrl = getAssetUrl(screening.adaptiveFundusImage || screening.originalFundusImage);
  const originalGradcamUrl = getAssetUrl(screening.originalGradcam);
  const adaptiveGradcamUrl = getAssetUrl(screening.adaptiveGradcam);

  return (
    <div className="card-earth rounded-2xl p-5 bg-white border border-sand-light space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-sand-light">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sage-600" />
            <h3 className="font-bold text-earth-700 text-base">Grad-CAM & Explainable AI Visualizations</h3>
          </div>
          <p className="text-xs text-earth-400 mt-0.5">
            Compare model activation heatmaps indicating regions associated with retinopathy biomarkers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-ivory-100 p-1 rounded-xl border border-sand/40">
          <button
            onClick={() => setActiveMode('side-by-side')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'side-by-side' ? 'bg-white shadow-xs text-earth-800' : 'text-earth-500 hover:text-earth-700'
            }`}
          >
            All Views (4-Grid)
          </button>
          <button
            onClick={() => setActiveMode('adaptive-focus')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeMode === 'adaptive-focus' ? 'bg-white shadow-xs text-earth-800' : 'text-earth-500 hover:text-earth-700'
            }`}
          >
            Adaptive (Main)
          </button>
        </div>
      </div>

      {/* Grid of Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Original Fundus */}
        <div className="rounded-xl border border-sand-light overflow-hidden bg-ivory-50 flex flex-col">
          <div className="px-3.5 py-2 bg-cream text-xs font-bold text-earth-700 flex items-center justify-between border-b border-sand-light">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sage-600" />
              1. Original Fundus Image
            </span>
            <span className="text-[10px] text-earth-400 font-normal">Input Capture</span>
          </div>
          <div className="relative aspect-square max-h-72 bg-black/5 flex items-center justify-center overflow-hidden group">
            {originalFundusUrl ? (
              <img
                src={originalFundusUrl}
                alt="Original Fundus"
                className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setSelectedImageModal({ url: originalFundusUrl, title: 'Original Fundus Image' })}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80';
                }}
              />
            ) : (
              <div className="text-xs text-earth-400 italic">No image available</div>
            )}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-earth-700/80 text-white p-1.5 rounded-lg text-xs flex items-center gap-1 pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5" /> Zoom
            </div>
          </div>
          <div className="p-2.5 text-[11px] text-earth-500 bg-white border-t border-sand-light">
            Raw photographic capture from non-mydriatic fundus camera before contrast normalization.
          </div>
        </div>

        {/* 2. Original Grad-CAM */}
        <div className="rounded-xl border border-sand-light overflow-hidden bg-ivory-50 flex flex-col">
          <div className="px-3.5 py-2 bg-cream text-xs font-bold text-earth-700 flex items-center justify-between border-b border-sand-light">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-olive" />
              2. Original Grad-CAM
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sage-100 text-sage-800 font-semibold">
              Pred: {screening.originalPrediction || 'N/A'}
            </span>
          </div>
          <div className="relative aspect-square max-h-72 bg-black/5 flex items-center justify-center overflow-hidden group">
            {originalGradcamUrl ? (
              <img
                src={originalGradcamUrl}
                alt="Original Grad-CAM"
                className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setSelectedImageModal({ url: originalGradcamUrl, title: 'Original Grad-CAM Heatmap' })}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80';
                }}
              />
            ) : (
              <div className="p-4 text-center text-xs text-earth-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-sand" />
                Grad-CAM path: <code>{screening.originalGradcam || 'gradcam/original-...'}</code>
              </div>
            )}
          </div>
          <div className="p-2.5 text-[11px] text-earth-500 bg-white border-t border-sand-light">
            Saliency map of standard baseline network showing activated weights.
          </div>
        </div>

        {/* 3. Adaptive Fundus Image */}
        <div className="rounded-xl border border-sand-light overflow-hidden bg-ivory-50 flex flex-col">
          <div className="px-3.5 py-2 bg-cream text-xs font-bold text-earth-700 flex items-center justify-between border-b border-sand-light">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-terracotta" />
              3. Adaptive Preprocessed Fundus
            </span>
            <span className="text-[10px] text-earth-400 font-normal">Contrast Enhanced</span>
          </div>
          <div className="relative aspect-square max-h-72 bg-black/5 flex items-center justify-center overflow-hidden group">
            {adaptiveFundusUrl ? (
              <img
                src={adaptiveFundusUrl}
                alt="Adaptive Fundus"
                className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setSelectedImageModal({ url: adaptiveFundusUrl, title: 'Adaptive Preprocessed Fundus' })}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80';
                }}
              />
            ) : (
              <div className="text-xs text-earth-400 italic">No adaptive variant returned</div>
            )}
          </div>
          <div className="p-2.5 text-[11px] text-earth-500 bg-white border-t border-sand-light">
            Illumination equalization and vessel-tree enhancement for subtle lesion clarity.
          </div>
        </div>

        {/* 4. Adaptive Grad-CAM (Primary) */}
        <div className="rounded-xl border-2 border-sage-400/80 overflow-hidden bg-ivory-50 flex flex-col shadow-sm">
          <div className="px-3.5 py-2 bg-sage-50 text-xs font-bold text-sage-900 flex items-center justify-between border-b border-sage-200">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sage-700" />
              4. Adaptive Grad-CAM (Primary Result)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-sage-600 text-white font-bold">
              Pred: {screening.adaptivePrediction || screening.originalPrediction || 'N/A'}
            </span>
          </div>
          <div className="relative aspect-square max-h-72 bg-black/5 flex items-center justify-center overflow-hidden group">
            {adaptiveGradcamUrl ? (
              <img
                src={adaptiveGradcamUrl}
                alt="Adaptive Grad-CAM"
                className="w-full h-full object-contain cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => setSelectedImageModal({ url: adaptiveGradcamUrl, title: 'Adaptive Grad-CAM Heatmap (Primary)' })}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80';
                }}
              />
            ) : (
              <div className="p-4 text-center text-xs text-earth-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-sand" />
                Adaptive heatmap path: <code>{screening.adaptiveGradcam || 'gradcam/adaptive-...'}</code>
              </div>
            )}
          </div>
          <div className="p-2.5 text-[11px] text-sage-800 bg-sage-50/50 border-t border-sage-200">
            High-precision attention localization with reduced background artifact noise.
          </div>
        </div>
      </div>

      {/* Notice on Static File Serving */}
      <div className="p-3 rounded-xl bg-ivory-100 border border-sand/40 text-[11px] text-earth-600 flex items-start gap-2">
        <Info className="w-4 h-4 text-earth-400 mt-0.5 flex-shrink-0" />
        <div>
          <span>
            <strong>Note on Backend File Serving:</strong> Backend returns paths such as{' '}
            <code className="text-earth-700 bg-white px-1 py-0.5 rounded font-mono">gradcam/original-...png</code>.
            Ensure your backend includes <code className="text-earth-700 bg-white px-1 py-0.5 rounded font-mono">app.use('/gradcam', express.static(path.join(__dirname, 'gradcam')));</code> to render on-disk Grad-CAM images.
          </span>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImageModal(null)}
        >
          <div 
            className="max-w-3xl w-full bg-white rounded-2xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-sand-light">
              <h4 className="font-bold text-earth-800 text-sm">{selectedImageModal.title}</h4>
              <button 
                onClick={() => setSelectedImageModal(null)}
                className="text-earth-400 hover:text-earth-700 text-xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>
            <div className="flex items-center justify-center bg-black/5 rounded-xl overflow-hidden p-2">
              <img 
                src={selectedImageModal.url} 
                alt="Enlarged view" 
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradCamViewer;
