import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Edit3, 
  Search, 
  Bell, 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon,
  Check,
  ShieldCheck
} from 'lucide-react';
import { PrescriptionScan, DetectedMedicine, Medicine } from '../types';
import { SAMPLE_PRESCRIPTIONS } from '../services/mockData';
import { api } from '../services/api';
import { StatusBadge } from './StatusBadge';

interface PrescriptionScannerProps {
  onCheckAvailability: (medicines: DetectedMedicine[]) => void;
  onSetReminders: (medicines: DetectedMedicine[]) => void;
  onViewMedicineDetails?: (medicineName: string) => void;
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({
  onCheckAvailability,
  onSetReminders,
  onViewMedicineDetails
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPresetText, setSelectedPresetText] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: Reading, 2: Identifying, 3: Catalog match
  const [scanResult, setScanResult] = useState<PrescriptionScan | null>(null);
  const [editingMedicineId, setEditingMedicineId] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedPresetText('');
      setScanResult(null);
      setIsVerified(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (presetIndex: number) => {
    const preset = SAMPLE_PRESCRIPTIONS[presetIndex];
    setSelectedPresetText(preset.text);
    // Use an elegant healthcare prescription card mockup as preview
    setSelectedImage('preset-sample');
    setScanResult(null);
    setIsVerified(false);
    setErrorMsg(null);
  };

  const handleStartOCR = async () => {
    if (!selectedImage && !selectedPresetText) {
      setErrorMsg('Please upload a prescription image or select a sample prescription.');
      return;
    }

    setIsScanning(true);
    setScanStep(1);
    setErrorMsg(null);

    // Multi-stage scan animation feedback
    setTimeout(() => setScanStep(2), 700);
    setTimeout(() => setScanStep(3), 1400);

    try {
      const result = await api.processPrescriptionOCR(
        selectedImage === 'preset-sample' ? '' : selectedImage || '', 
        selectedPresetText
      );
      
      setTimeout(() => {
        setScanResult(result);
        setIsScanning(false);
        setScanStep(0);
      }, 1900);
    } catch (err: any) {
      console.error('OCR scan failed:', err);
      setIsScanning(false);
      setErrorMsg('We could not clearly process this prescription. Please try a clearer image or choose a demo preset.');
    }
  };

  const handleUpdateMedicine = (id: string, updates: Partial<DetectedMedicine>) => {
    if (!scanResult) return;
    setScanResult({
      ...scanResult,
      detected_medicines: scanResult.detected_medicines.map(m => 
        m.id === id ? { ...m, ...updates } : m
      )
    });
  };

  const handleDeleteMedicine = (id: string) => {
    if (!scanResult) return;
    setScanResult({
      ...scanResult,
      detected_medicines: scanResult.detected_medicines.filter(m => m.id !== id)
    });
  };

  const handleAddMedicine = () => {
    if (!scanResult) return;
    const newMed: DetectedMedicine = {
      id: `det-${Date.now()}`,
      name: 'New Medicine',
      dosage: '500 mg',
      frequency: 'Once daily (OD)',
      duration: '5 days',
      confidence: 1.0,
      status: 'available',
      available_pharmacies_count: 3
    };
    setScanResult({
      ...scanResult,
      detected_medicines: [...scanResult.detected_medicines, newMed]
    });
    setEditingMedicineId(newMed.id);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setSelectedPresetText('');
    setScanResult(null);
    setIsVerified(false);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Feature Intro Card */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DDE8D2] shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold mb-3">
            <Sparkles size={14} className="text-[#6B9B63]" />
            <span>Prescription OCR & Verification Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D] mb-2">
            Upload Prescription for Instant Medicine Discovery
          </h2>
          <p className="text-sm text-[#69736D] leading-relaxed">
            Upload your doctor's handwritten or printed prescription. Our intelligent OCR engine extracts medicine names, dosages, and administration schedules. You can verify the extracted items and instantly search verified pharmacy stock.
          </p>
        </div>
      </div>

      {!scanResult ? (
        /* Upload & Selection View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Upload Box */}
          <div className="lg:col-span-8 bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border-2 border-dashed border-[#DDE8D2] hover:border-[#6B9B63] transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
              id="prescription-file-input"
            />

            {selectedImage ? (
              <div className="w-full space-y-4">
                <div className="relative max-h-64 sm:max-h-80 w-full overflow-hidden rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2] flex items-center justify-center p-4">
                  {selectedImage === 'preset-sample' ? (
                    <div className="text-left bg-white p-5 rounded-xl border border-[#DDE8D2] shadow-sm max-w-md w-full font-mono text-xs text-[#17231D]">
                      <div className="border-b pb-2 mb-3 font-bold text-[#173B2B]">
                        PRESCRIPTION SAMPLE PRESET
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs text-[#17231D]">
                        {selectedPresetText}
                      </pre>
                    </div>
                  ) : (
                    <img 
                      src={selectedImage} 
                      alt="Uploaded Prescription" 
                      className="max-h-72 object-contain rounded-xl shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Scanning Animation Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-[#173B2B]/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center mb-4 animate-pulse">
                        <RefreshCw size={28} className="animate-spin text-[#DDE8D2]" />
                      </div>
                      <h4 className="text-lg font-bold font-heading mb-1">
                        {scanStep === 1 && 'Scanning Prescription Document...'}
                        {scanStep === 2 && 'Reading Handwritten & Printed Text...'}
                        {scanStep === 3 && 'Matching Verified Medicine Catalog...'}
                      </h4>
                      <p className="text-xs text-[#DDE8D2] max-w-xs">
                        Extracting active compounds, dosages, and pharmacy availability...
                      </p>
                      <div className="w-48 bg-white/20 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="bg-[#6B9B63] h-full transition-all duration-500" 
                          style={{ width: `${(scanStep / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    id="btn-process-prescription"
                    onClick={handleStartOCR}
                    disabled={isScanning}
                    className="px-6 py-3 rounded-2xl bg-[#173B2B] text-white text-sm font-bold hover:bg-[#173B2B]/90 transition-all shadow-sm flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-[#DDE8D2]" />
                    <span>{isScanning ? 'Processing OCR...' : 'Process Prescription OCR'}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    disabled={isScanning}
                    className="px-4 py-3 rounded-2xl bg-[#F7F9F4] text-[#69736D] hover:bg-[#DDE8D2] hover:text-[#173B2B] text-sm font-semibold transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer py-10 px-4 w-full flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#DDE8D2] text-[#173B2B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Upload size={28} />
                </div>
                <h3 className="text-lg font-bold font-heading text-[#17231D] mb-1">
                  Click to Upload or Drag & Drop Prescription
                </h3>
                <p className="text-xs text-[#69736D] max-w-sm mb-4">
                  Supports JPG, PNG, and camera photos. For best OCR accuracy, ensure clear lighting and legible text.
                </p>
                <span className="px-4 py-2 rounded-xl bg-[#173B2B] text-white text-xs font-semibold shadow-2xs">
                  Choose Image File
                </span>
              </div>
            )}
          </div>

          {/* Quick Demo Presets Side Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#DDE8D2] shadow-xs">
              <h4 className="text-sm font-bold font-heading text-[#17231D] mb-1 flex items-center gap-2">
                <FileText size={16} className="text-[#6B9B63]" />
                Demo Prescription Presets
              </h4>
              <p className="text-xs text-[#69736D] mb-4">
                Test the OCR parser instantly with realistic sample medical prescriptions:
              </p>

              <div className="space-y-2.5">
                {SAMPLE_PRESCRIPTIONS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectPreset(idx)}
                    className="p-3.5 rounded-2xl bg-[#F7F9F4] hover:bg-[#DDE8D2]/40 border border-[#DDE8D2] hover:border-[#6B9B63] cursor-pointer transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#173B2B]">{preset.title}</span>
                      <span className="text-[10px] text-[#69736D]">{preset.date}</span>
                    </div>
                    <p className="text-[11px] text-[#69736D] line-clamp-2 italic mb-2">
                      "{preset.doctor} — {preset.clinic}"
                    </p>
                    <button className="text-[11px] font-bold text-[#173B2B] flex items-center gap-1 hover:underline">
                      <span>Use this sample</span>
                      <span>→</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Safety Callout */}
            <div className="p-4 rounded-3xl bg-[#DDE8D2]/40 border border-[#6B9B63]/30 text-xs text-[#17231D] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#173B2B]">
                <ShieldCheck size={15} />
                <span>Student Project & Privacy Notice</span>
              </div>
              <p className="text-[11px] text-[#69736D] leading-relaxed">
                Images are analyzed locally and through secure server endpoints. No personal health records are permanently retained or shared.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* OCR Verification & Results View */
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Important Safety Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBF0] border border-[#E7A23B]/40 flex items-start gap-3">
            <AlertTriangle size={20} className="text-[#E7A23B] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#17231D]">
                Mandatory Verification Required
              </h4>
              <p className="text-xs text-[#69736D] mt-0.5 leading-relaxed">
                OCR output must not automatically be treated as medically verified. Please review, edit, or remove any incorrectly scanned items before checking live pharmacy availability.
              </p>
            </div>
          </div>

          {/* Verification Card */}
          <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DDE8D2] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DDE8D2] mb-6">
              <div>
                <span className="text-xs font-semibold text-[#6B9B63] uppercase tracking-wider">
                  OCR Analysis Complete
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#17231D] mt-0.5">
                  Detected Medicines ({scanResult.detected_medicines.length})
                </h3>
                <p className="text-xs text-[#69736D] mt-1">
                  Extracted from: {scanResult.doctor_name || 'Prescription Document'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddMedicine}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7F9F4] hover:bg-[#DDE8D2] text-[#173B2B] text-xs font-bold border border-[#DDE8D2] transition-colors"
                >
                  <Plus size={14} />
                  <span>Add Medicine</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-[#F7F9F4] text-[#69736D] hover:text-[#17231D] text-xs font-semibold transition-colors"
                >
                  Upload Another
                </button>
              </div>
            </div>

            {/* Medicines List with In-place Edit */}
            <div className="space-y-3">
              {scanResult.detected_medicines.map((med) => {
                const isEditing = editingMedicineId === med.id;

                return (
                  <div 
                    key={med.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2] hover:border-[#6B9B63] transition-all"
                  >
                    {isEditing ? (
                      /* Inline Edit Form */
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-[#69736D] uppercase">Medicine Name</label>
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => handleUpdateMedicine(med.id, { name: e.target.value })}
                              className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#DDE8D2] text-xs font-semibold text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-[#69736D] uppercase">Dosage & Strength</label>
                            <input
                              type="text"
                              value={med.dosage}
                              onChange={(e) => handleUpdateMedicine(med.id, { dosage: e.target.value })}
                              className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#DDE8D2] text-xs font-semibold text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-[#69736D] uppercase">Frequency</label>
                            <select
                              value={med.frequency}
                              onChange={(e) => handleUpdateMedicine(med.id, { frequency: e.target.value })}
                              className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#DDE8D2] text-xs font-semibold text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                            >
                              <option value="Once daily (OD)">Once daily (OD)</option>
                              <option value="Twice daily (BD)">Twice daily (BD)</option>
                              <option value="Three times daily (TDS)">Three times daily (TDS)</option>
                              <option value="At bedtime (HS)">At bedtime (HS)</option>
                              <option value="As needed (SOS)">As needed (SOS)</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-[#69736D] uppercase">Duration</label>
                            <input
                              type="text"
                              value={med.duration}
                              onChange={(e) => handleUpdateMedicine(med.id, { duration: e.target.value })}
                              className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-[#DDE8D2] text-xs font-semibold text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            onClick={() => setEditingMedicineId(null)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#173B2B] text-white text-xs font-bold shadow-2xs"
                          >
                            Save Verification
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Row */
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-bold text-[#17231D] text-base">{med.name}</h4>
                            <StatusBadge status={med.status} size="sm" />
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DDE8D2] text-[#173B2B]">
                              {Math.round(med.confidence * 100)}% Confidence
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#69736D] mt-1">
                            <span>Dosage: <strong className="text-[#17231D]">{med.dosage}</strong></span>
                            <span>•</span>
                            <span>Schedule: <strong className="text-[#17231D]">{med.frequency}</strong></span>
                            <span>•</span>
                            <span>Duration: <strong className="text-[#17231D]">{med.duration}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setEditingMedicineId(med.id)}
                            className="p-2 rounded-xl bg-white hover:bg-[#DDE8D2] text-[#173B2B] border border-[#DDE8D2] transition-colors"
                            title="Edit detected medicine"
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteMedicine(med.id)}
                            className="p-2 rounded-xl bg-white hover:bg-[#FDF0F0] text-[#D95C5C] border border-[#DDE8D2] transition-colors"
                            title="Remove from list"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-[#DDE8D2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[#17231D]">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-[#173B2B] focus:ring-[#173B2B] border-[#DDE8D2]"
                />
                <span>I have reviewed and confirmed the extracted medicines against my prescription.</span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  id="btn-ocr-set-reminders"
                  onClick={() => onSetReminders(scanResult.detected_medicines)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#DDE8D2] text-[#173B2B] text-xs font-bold border border-[#DDE8D2] transition-colors shadow-2xs"
                >
                  <Bell size={14} className="text-[#6B9B63]" />
                  <span>Set Reminders for All</span>
                </button>

                <button
                  id="btn-ocr-check-availability"
                  onClick={() => onCheckAvailability(scanResult.detected_medicines)}
                  disabled={!isVerified}
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    isVerified
                      ? 'bg-[#173B2B] text-white hover:bg-[#173B2B]/90'
                      : 'bg-[#DDE8D2] text-[#69736D] cursor-not-allowed opacity-70'
                  }`}
                >
                  <Search size={14} className="text-[#DDE8D2]" />
                  <span>Check Availability</span>
                </button>
              </div>
            </div>
          </div>

          {/* Raw OCR Text Diagnostic Accordion */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DDE8D2]">
            <details className="cursor-pointer text-xs text-[#69736D]">
              <summary className="font-bold text-[#173B2B] flex items-center gap-1.5">
                <FileText size={14} />
                View Raw OCR Extracted Text
              </summary>
              <pre className="mt-3 p-4 bg-[#F7F9F4] rounded-xl text-[11px] font-mono text-[#17231D] whitespace-pre-wrap border border-[#DDE8D2]">
                {scanResult.raw_text}
              </pre>
            </details>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#FDF0F0] border border-[#D95C5C]/30 text-xs text-[#D95C5C] font-semibold flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
