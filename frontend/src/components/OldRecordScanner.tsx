import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Edit3,
  Save,
  RefreshCw,
  FileText,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
  Eye,
  Layers,
  ArrowRight,
  AlertTriangle,
  WifiOff,
  UserCheck,
  Info
} from 'lucide-react';
import { apiRequest } from '../services/apiClient';
import { useLanguage } from '../context/LanguageContext';
import { ExtractedCustomerCandidate, OCRFieldConfidence, DuplicateMatchInfo } from '../../../shared/types';

interface OldRecordScannerProps {
  onSuccess?: () => void;
  onSelectCustomer?: (customer: any) => void;
}

export const OldRecordScanner: React.FC<OldRecordScannerProps> = ({ onSuccess, onSelectCustomer }) => {
  const { t } = useLanguage();

  // Scan Source & Mode
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [capturedImage, setCapturedImage] = useState<string>(
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  );
  const [enhancedImage, setEnhancedImage] = useState<string>('');
  const [viewMode, setViewMode] = useState<'original' | 'enhanced'>('enhanced');

  // Camera Stream
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');

  // Image Processing Controls
  const [contrastBoost, setContrastBoost] = useState(1.4);
  const [deskewAngle, setDeskewAngle] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Scanning & Extraction State
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<ExtractedCustomerCandidate[]>([]);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState(0);

  // Current active candidate form fields
  const [activeForm, setActiveForm] = useState<ExtractedCustomerCandidate | null>(null);

  // Verification & Duplicate Resolution
  const [duplicateModalData, setDuplicateModalData] = useState<{
    candidate: ExtractedCustomerCandidate;
    duplicateInfo: DuplicateMatchInfo;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Sample Scan on Mount
  useEffect(() => {
    handleRunScan(capturedImage);
  }, []);

  // Camera Management
  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: cameraFacing, width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      }
    } catch (err) {
      console.warn('Live camera access error, falling back to gallery/samples:', err);
      alert('Camera access not granted or unavailable. You can use Gallery Upload or Sample Presets.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhotoFromCamera = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
        processImageEnhancement(dataUrl);
        handleRunScan(dataUrl);
      }
    }
  };

  // Image Processing Pipeline (Grayscale, Binarization, Contrast, Deskew)
  const processImageEnhancement = (imgSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((deskewAngle * Math.PI) / 180);
        ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
        ctx.restore();

        try {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;

            gray = ((gray / 255 - 0.5) * contrastBoost + 0.5) * 255;
            gray = Math.max(0, Math.min(255, gray));

            data[i] = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
          }
          ctx.putImageData(imgData, 0, 0);
          setEnhancedImage(canvas.toDataURL('image/jpeg', 0.92));
        } catch (e) {
          setEnhancedImage(imgSrc);
        }
      }
    };
    img.src = imgSrc;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        setCapturedImage(result);
        processImageEnhancement(result);
        handleRunScan(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunScan = async (imgSource: string) => {
    setIsProcessing(true);
    setSavedSuccessMsg(null);

    try {
      const res = await apiRequest('/lens/scan', {
        method: 'POST',
        body: {
          image_url: imgSource,
          enhanced_image_url: enhancedImage || imgSource
        }
      });

      setScanId(res.scanId);
      setCandidates(res.candidates || []);
      if (res.candidates && res.candidates.length > 0) {
        setActiveCandidateIndex(0);
        setActiveForm(JSON.parse(JSON.stringify(res.candidates[0])));
      }
    } catch (err: any) {
      alert(err.message || 'Scanning and extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectCandidate = (index: number) => {
    setActiveCandidateIndex(index);
    setActiveForm(JSON.parse(JSON.stringify(candidates[index])));
  };

  const handleFormChange = (field: string, val: any) => {
    if (!activeForm) return;
    setActiveForm({ ...activeForm, [field]: val });
  };

  const handleUpperBodyChange = (field: string, val: string) => {
    if (!activeForm) return;
    const num = val === '' ? undefined : parseFloat(val);
    setActiveForm({
      ...activeForm,
      upper_body: {
        ...activeForm.upper_body,
        [field]: num
      }
    });
  };

  const handleLowerBodyChange = (field: string, val: string) => {
    if (!activeForm) return;
    const num = val === '' ? undefined : parseFloat(val);
    setActiveForm({
      ...activeForm,
      lower_body: {
        ...activeForm.lower_body,
        [field]: num
      }
    });
  };

  const handleInitiateSave = async () => {
    if (!activeForm || !activeForm.name) {
      alert('Customer name is required.');
      return;
    }

    const duplicateInfo = (activeForm as any).duplicate_info;
    if (duplicateInfo?.is_duplicate && duplicateInfo.existing_customer) {
      setDuplicateModalData({
        candidate: activeForm,
        duplicateInfo
      });
      return;
    }

    await executeSave('CREATE_NEW');
  };

  const executeSave = async (
    strategy: 'CREATE_NEW' | 'UPDATE_EXISTING',
    existingCustomerId?: string
  ) => {
    if (!activeForm) return;
    setIsSaving(true);
    setDuplicateModalData(null);

    try {
      const res = await apiRequest('/lens/verify-save', {
        method: 'POST',
        body: {
          scan_id: scanId,
          candidate: activeForm,
          resolution_strategy: strategy,
          existing_customer_id: existingCustomerId,
          original_image_url: capturedImage,
          enhanced_image_url: enhancedImage || capturedImage
        }
      });

      setSavedSuccessMsg(
        `Digital customer record for "${activeForm.name}" verified & saved successfully!`
      );

      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(err.message || 'Verification save failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/50 to-slate-900 border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">TailorHub Lens v2.0</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Handwritten Register OCR
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
              <Camera className="w-6 h-6 text-amber-400" />
              TailorHub Lens: Old Book Digitization
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Convert physical paper notebooks, customer registers, and measurement cards into verified digital records with tailoring intelligence and duplicate detection.
            </p>
          </div>

          {/* Source Tabs */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 gap-1 self-start sm:self-auto">
            <button
              onClick={() => {
                setScanMode('samples');
                stopCamera();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                scanMode === 'samples' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => {
                setScanMode('camera');
                startCamera();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                scanMode === 'camera' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Live Camera
            </button>
            <label className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-all flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Gallery
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Offline Alert Banner if applicable */}
      {isOffline && (
        <div className="bg-rose-950/80 border border-rose-500/40 p-3.5 rounded-2xl text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-rose-400" />
            <span><strong>You're offline.</strong> Scanned registers will be queued locally and processed when connectivity returns.</span>
          </div>
          <button onClick={() => window.location.reload()} className="px-3 py-1 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-lg text-xs">
            Retry Connection
          </button>
        </div>
      )}

      {/* Quick Sample Presets Selection Bar */}
      {scanMode === 'samples' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-2">
            Quick Sample Registers (Instant 1-Click Verification Demo):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                const img = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
                setCapturedImage(img);
                processImageEnhancement(img);
                handleRunScan(img);
              }}
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all"
            >
              <span className="font-bold text-xs text-white block">📖 1. Single Customer Register</span>
              <span className="text-[10px] text-slate-400">Subba Rao Naidu (11 Measurements & Advance)</span>
            </button>

            <button
              onClick={() => {
                setCapturedImage('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80');
                handleRunScan('sample_multi_customer.jpg');
              }}
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition-all"
            >
              <span className="font-bold text-xs text-indigo-300 block">👥 2. Multi-Customer Page</span>
              <span className="text-[10px] text-slate-400">Ramesh Kumar + Suresh Babu (Auto Segmented)</span>
            </button>

            <button
              onClick={() => {
                setCapturedImage('https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80');
                handleRunScan('sample_unclear_handwriting.jpg');
              }}
              className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition-all"
            >
              <span className="font-bold text-xs text-amber-400 block">⚠️ 3. Faded / Low-Confidence Entry</span>
              <span className="text-[10px] text-slate-400">Triggers Uncertainty & Review Badges</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Camera View if Active */}
      {scanMode === 'camera' && isCameraActive && (
        <div className="relative rounded-3xl overflow-hidden bg-black border border-slate-800 max-w-xl mx-auto h-80 flex items-center justify-center shadow-2xl">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Document Guide Framing Overlay */}
          <div className="absolute inset-6 border-2 border-dashed border-amber-400/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
            <div className="flex justify-between">
              <span className="w-4 h-4 border-t-2 border-l-2 border-amber-400" />
              <span className="w-4 h-4 border-t-2 border-r-2 border-amber-400" />
            </div>
            <div className="text-center">
              <span className="bg-slate-950/80 text-amber-300 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-400/30">
                ALIGN REGISTER PAGE WITHIN FRAME
              </span>
            </div>
            <div className="flex justify-between">
              <span className="w-4 h-4 border-b-2 border-l-2 border-amber-400" />
              <span className="w-4 h-4 border-b-2 border-r-2 border-amber-400" />
            </div>
          </div>

          {/* Capture Controls */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
            <button
              onClick={capturePhotoFromCamera}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 flex items-center justify-center font-extrabold shadow-xl shadow-amber-500/40 transform active:scale-95"
            >
              <Camera className="w-6 h-6" />
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-2 bg-slate-800/90 text-white rounded-xl text-xs font-bold self-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Verification Workspace: Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Document Scanner & Image Enhancement Studio (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 text-white space-y-4 shadow-xl sticky top-20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              1. Document Scanner View
            </h3>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setViewMode('original')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'original' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setViewMode('enhanced')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  viewMode === 'enhanced' ? 'bg-amber-500 text-slate-950 font-extrabold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Enhanced OCR
              </button>
            </div>
          </div>

          {/* Interactive Document Preview Container with Zoom/Pan */}
          <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group">
            <img
              src={viewMode === 'enhanced' && enhancedImage ? enhancedImage : capturedImage}
              alt="Handwritten Register Scan"
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.2s ease-out'
              }}
              className="w-full h-full object-cover"
            />

            {/* Scanning Line Animation when Processing */}
            {isProcessing && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-lg shadow-amber-400" />
            )}

            {/* Floating Zoom & Inspect Controls */}
            <div className="absolute bottom-3 right-3 flex bg-slate-950/90 backdrop-blur-md rounded-xl p-1 border border-slate-800 gap-1 shadow-lg">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg text-xs"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                title="Reset Zoom"
              >
                1x
              </button>
            </div>

            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-amber-400 text-[10px] font-extrabold flex items-center gap-1 border border-amber-500/30">
              {viewMode === 'enhanced' ? '✨ Grayscale Binarized (Clean OCR)' : '📷 Raw Camera Photo'}
            </div>
          </div>

          {/* Enhancement Slider Controls */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-amber-400" /> Contrast & Edge Filter</span>
              <span className="text-amber-400">{contrastBoost}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={contrastBoost}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setContrastBoost(val);
                processImageEnhancement(capturedImage);
              }}
              className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleRunScan(capturedImage)}
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing ? 'Extracting Tailoring Intelligence...' : 'Re-Extract with TailorHub Lens'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Multi-Candidate Verification Workspace (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-amber-400 tracking-wider">
                Step 2: Human-in-the-Loop Verification
              </span>
              <h3 className="text-base font-extrabold text-white">
                Structured Customer & Tailoring Data
              </h3>
            </div>

            {candidates.length > 0 && (
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full font-bold border border-indigo-500/30">
                {candidates.length} Record(s) Detected
              </span>
            )}
          </div>

          {/* Multi-Customer Tabs if more than 1 candidate detected on register page */}
          {candidates.length > 1 && (
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase px-2 block">
                Multi-Customer Page Detected — Select Candidate to Verify:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {candidates.map((cand, idx) => {
                  const isSelected = activeCandidateIndex === idx;
                  return (
                    <button
                      key={cand.candidate_id}
                      onClick={() => handleSelectCandidate(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{cand.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {cand.garment_type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {isProcessing ? (
            <div className="py-24 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-300 font-bold">
                TailorHub Vision Engine is parsing handwriting, shorthand notation & body measurements...
              </p>
            </div>
          ) : !activeForm ? (
            <div className="py-20 text-center text-slate-500 text-xs font-semibold">
              No record extracted yet. Choose a sample register above or take a photo.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Confidence Legend & Low-Confidence Alert */}
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Confidence Color Legend:</span> 🟢 Green = High (&ge;85%), 🟡 Yellow = Medium (60-84%), 🔴 Red = Uncertain (&lt;60% — Needs Review). Tailors must verify all fields before saving.
                </div>
              </div>

              {/* 1. Customer Information Group */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider">
                    1. Customer Information
                  </span>
                  {activeForm.confidence.name && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeForm.confidence.name.confidence >= 0.85
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      Name Conf: {Math.round(activeForm.confidence.name.confidence * 100)}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Customer Full Name *</label>
                    <input
                      type="text"
                      value={activeForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-white font-medium outline-none ${
                        activeForm.confidence.name?.is_uncertain
                          ? 'border-amber-500 bg-amber-500/10 focus:border-amber-400'
                          : 'border-slate-700 focus:border-amber-400'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-400 font-bold">10-Digit Mobile Number *</label>
                      {activeForm.confidence.phone?.is_uncertain && (
                        <span className="text-[9px] bg-rose-500/20 text-rose-300 font-extrabold px-1.5 py-0.5 rounded uppercase border border-rose-500/30">
                          Uncertain Digits
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={activeForm.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      placeholder="e.g. 9876543210"
                      className={`w-full bg-slate-900 border rounded-xl px-3 py-2 text-white font-mono font-medium outline-none ${
                        activeForm.confidence.phone?.is_uncertain
                          ? 'border-rose-500 bg-rose-500/10 focus:border-rose-400'
                          : 'border-slate-700 focus:border-amber-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Alternate Phone / Landline</label>
                    <input
                      type="text"
                      value={activeForm.alternate_phone || ''}
                      onChange={(e) => handleFormChange('alternate_phone', e.target.value)}
                      placeholder="Optional"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Address / Landmark</label>
                    <input
                      type="text"
                      value={activeForm.address || ''}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      placeholder="e.g. Jubilee Hills, Hyderabad"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Upper Body Measurements */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider">
                    2. Upper Body Measurements (Inches)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Shorthand notation auto-parsed</span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Chest (Ch)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.upper_body.chest ?? ''}
                      onChange={(e) => handleUpperBodyChange('chest', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Shoulder (Sh)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.upper_body.shoulder ?? ''}
                      onChange={(e) => handleUpperBodyChange('shoulder', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Sleeve (Slv)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.upper_body.sleeve ?? ''}
                      onChange={(e) => handleUpperBodyChange('sleeve', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Neck (N)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.upper_body.neck ?? ''}
                      onChange={(e) => handleUpperBodyChange('neck', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Armhole (AH)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.upper_body.armhole ?? ''}
                      onChange={(e) => handleUpperBodyChange('armhole', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Length (L)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.upper_body.shirt_length ?? ''}
                      onChange={(e) => handleUpperBodyChange('shirt_length', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Lower Body Measurements */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider">
                    3. Lower Body Measurements (Inches)
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Waist (W)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.lower_body.waist ?? ''}
                      onChange={(e) => handleLowerBodyChange('waist', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Hip (H / Seat)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.lower_body.hip ?? ''}
                      onChange={(e) => handleLowerBodyChange('hip', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Thigh (Th)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.lower_body.thigh ?? ''}
                      onChange={(e) => handleLowerBodyChange('thigh', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Knee (Kn)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.lower_body.knee ?? ''}
                      onChange={(e) => handleLowerBodyChange('knee', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Bottom (Morri)</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.lower_body.bottom ?? ''}
                      onChange={(e) => handleLowerBodyChange('bottom', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">Pant L</span>
                    <input
                      type="number"
                      step="0.5"
                      value={activeForm.lower_body.pant_length ?? ''}
                      onChange={(e) => handleLowerBodyChange('pant_length', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-center text-amber-400 font-extrabold outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Historical Order & Financial Details */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider block">
                  4. Historical Order & Financial Details
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Garment Type</label>
                    <input
                      type="text"
                      value={activeForm.garment_type}
                      onChange={(e) => handleFormChange('garment_type', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Total Price (₹)</label>
                    <input
                      type="number"
                      value={activeForm.price || ''}
                      onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Advance Paid (₹)</label>
                    <input
                      type="number"
                      value={activeForm.advance || ''}
                      onChange={(e) => handleFormChange('advance', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Balance Due (₹)</label>
                    <input
                      type="number"
                      value={activeForm.balance || ''}
                      onChange={(e) => handleFormChange('balance', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-rose-400"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="text-slate-400 font-bold block mb-1">Stitching Instructions & Register Remarks</label>
                  <textarea
                    rows={2}
                    value={activeForm.notes || activeForm.stitching_instructions || ''}
                    onChange={(e) => {
                      handleFormChange('notes', e.target.value);
                      handleFormChange('stitching_instructions', e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-medium"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleInitiateSave}
                  disabled={isSaving}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-2xl text-xs shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSaving ? 'Saving Verified Record...' : 'CONFIRM & SAVE DIGITAL RECORD'}
                </button>

                {savedSuccessMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    {savedSuccessMsg}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Duplicate Customer Resolution Modal */}
      {duplicateModalData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">Possible Existing Customer Found</h4>
                <span className="text-xs text-amber-400/90 font-semibold">Match criteria: {duplicateModalData.duplicateInfo.match_type}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
              <p className="text-slate-300">
                An existing customer already exists in your shop database with similar details:
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="font-extrabold text-sm text-white block">
                  {duplicateModalData.duplicateInfo.existing_customer?.name}
                </span>
                <span className="font-mono text-slate-400 block mt-0.5">
                  📱 {duplicateModalData.duplicateInfo.existing_customer?.phone}
                </span>
                <span className="text-[11px] text-amber-400 font-semibold block mt-1">
                  📦 {duplicateModalData.duplicateInfo.existing_customer?.total_orders} previous orders on file
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Would you like to attach these new measurements as an updated version to the existing customer, or create a completely separate profile?
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => executeSave('UPDATE_EXISTING', duplicateModalData.duplicateInfo.existing_customer?.id)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4" />
                UPDATE EXISTING CUSTOMER (Save as New Version)
              </button>

              <button
                onClick={() => executeSave('CREATE_NEW')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs border border-slate-700"
              >
                Create New Separate Customer Record
              </button>

              <button
                onClick={() => setDuplicateModalData(null)}
                className="w-full py-2 text-slate-400 hover:text-white font-semibold text-xs text-center"
              >
                Cancel & Review Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
