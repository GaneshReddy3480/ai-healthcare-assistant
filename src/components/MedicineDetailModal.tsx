import React, { useEffect, useState } from 'react';
import { 
  X, 
  Pill, 
  MapPin, 
  Bot, 
  Bell, 
  ShieldAlert, 
  Building2, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Store,
  Sparkles,
  TrendingDown,
  Lock,
  Volume2
} from 'lucide-react';
import { Medicine, InventoryItem, Pharmacy, GenericSubstitute, MedicineReservation } from '../types';
import { StatusBadge } from './StatusBadge';
import { api } from '../services/api';
import { ReserveMedicineModal } from './ReserveMedicineModal';
import { useCurrency } from '../context/CurrencyContext';

interface MedicineDetailModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  onFindNearby: (medicine: Medicine) => void;
  onAskAI: (medicine: Medicine) => void;
  onSetReminder: (medicine: Medicine) => void;
  onSelectPharmacy?: (pharmacyId: string) => void;
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  medicine,
  onClose,
  onFindNearby,
  onAskAI,
  onSetReminder,
  onSelectPharmacy
}) => {
  const { formatPrice } = useCurrency();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [generics, setGenerics] = useState<GenericSubstitute[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'generics' | 'availability' | 'safety'>('overview');
  const [reserveTargetPharm, setReserveTargetPharm] = useState<Pharmacy | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!medicine) return;
    
    let isMounted = true;
    setLoading(true);

    async function loadData() {
      try {
        const [details, allPharmacies, subs] = await Promise.all([
          api.getMedicineById(medicine!.id),
          api.getPharmacies(),
          api.getGenericSubstitutes(medicine!.id)
        ]);
        if (isMounted) {
          setInventory(details?.inventory || []);
          setPharmacies(allPharmacies);
          setGenerics(subs);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching medicine details:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [medicine]);

  const handleSpeakDosage = () => {
    if (!medicine || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = `${medicine.name}. Generic formulation is ${medicine.generic_name}. Standard dosage: ${medicine.dosage_info}. Precautions: ${medicine.precautions.join('. ')}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!medicine) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17231D]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        id="medicine-detail-modal"
        className="bg-[#FFFFFF] w-full max-w-3xl rounded-3xl shadow-2xl border border-[#DDE8D2] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Top Header */}
        <div className="bg-[#173B2B] text-white p-6 relative">
          <div className="absolute top-5 right-5 flex items-center gap-2">
            <button
              onClick={handleSpeakDosage}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking ? 'bg-[#6B9B63] text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Listen to medicine info"
            >
              <Volume2 size={18} />
            </button>
            <button
              id="btn-close-med-modal"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <StatusBadge status={medicine.stock_status} size="sm" />
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-[#DDE8D2] font-semibold">
              {medicine.form}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-[#DDE8D2]">
              {medicine.strength}
            </span>
            {medicine.prescription_required && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E7A23B] text-[#173B2B] font-bold inline-flex items-center gap-1">
                <ShieldAlert size={12} />
                Prescription Required (Rx)
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-1">
            {medicine.name}
          </h2>
          <p className="text-sm text-[#DDE8D2] font-medium">
            Generic Name: <span className="text-white font-semibold">{medicine.generic_name}</span>
          </p>

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-white/70">Manufacturer: </span>
              <span className="text-white font-semibold">{medicine.manufacturer}</span>
            </div>
            <div>
              <span className="text-white/70">Average Price: </span>
              <span className="text-lg font-bold text-white">{formatPrice(medicine.average_price)}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-[#DDE8D2] px-6 bg-[#F7F9F4] flex flex-wrap gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#173B2B] text-[#173B2B]'
                : 'border-transparent text-[#69736D] hover:text-[#17231D]'
            }`}
          >
            Overview & Uses
          </button>
          <button
            onClick={() => setActiveTab('generics')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'generics'
                ? 'border-[#173B2B] text-[#173B2B]'
                : 'border-transparent text-[#69736D] hover:text-[#17231D]'
            }`}
          >
            <TrendingDown size={14} className="text-[#6B9B63]" />
            Generic Substitutes ({generics.length})
          </button>
          <button
            onClick={() => setActiveTab('availability')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'availability'
                ? 'border-[#173B2B] text-[#173B2B]'
                : 'border-transparent text-[#69736D] hover:text-[#17231D]'
            }`}
          >
            <Store size={14} />
            Pharmacy Availability ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'safety'
                ? 'border-[#173B2B] text-[#173B2B]'
                : 'border-transparent text-[#69736D] hover:text-[#17231D]'
            }`}
          >
            <AlertTriangle size={14} />
            Precautions & Side Effects
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#17231D]">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* About Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#69736D] mb-1.5 flex items-center gap-1.5">
                  <Info size={14} className="text-[#6B9B63]" />
                  About this Medicine
                </h4>
                <p className="text-[#17231D] leading-relaxed bg-[#F7F9F4] p-4 rounded-2xl border border-[#DDE8D2]">
                  {medicine.description}
                </p>
              </div>

              {/* Approved Indications / Uses */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#69736D] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#6B9B63]" />
                  Common Clinical Uses & Indications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {medicine.uses.map((use, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#DDE8D2]">
                      <div className="w-2 h-2 rounded-full bg-[#6B9B63]"></div>
                      <span className="font-medium text-[#17231D]">{use}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dosage Guideline */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#69736D] mb-1.5">
                  Standard Dosage Information
                </h4>
                <div className="p-4 rounded-2xl bg-[#DDE8D2]/40 border border-[#6B9B63]/30">
                  <p className="text-sm font-medium text-[#173B2B]">
                    {medicine.dosage_info}
                  </p>
                  <p className="text-xs text-[#69736D] mt-1 italic">
                    *Actual prescribed dosage must strictly be determined by a qualified physician.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* GENERIC SUBSTITUTES TAB */}
          {activeTab === 'generics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#DDE8D2]/30 border border-[#6B9B63]/30 flex items-start gap-3">
                <Sparkles size={18} className="text-[#6B9B63] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#173B2B]">
                    Bio-Equivalent Generic Alternatives
                  </h4>
                  <p className="text-xs text-[#69736D] mt-0.5">
                    Generics contain the exact same active pharmaceutical ingredient (<strong>{medicine.generic_name}</strong>) with identical potency, safety, and therapeutic outcomes at a fraction of branded costs.
                  </p>
                </div>
              </div>

              {generics.length === 0 ? (
                <div className="text-center py-8 bg-[#F7F9F4] rounded-2xl border border-[#DDE8D2]">
                  <p className="text-xs font-semibold text-[#17231D]">Generic alternatives catalog is being indexed for this salt.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {generics.map((gen) => (
                    <div
                      key={gen.id}
                      className="p-4 rounded-2xl bg-white border border-[#DDE8D2] hover:border-[#6B9B63] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-[#17231D] text-sm sm:text-base">
                            {gen.substitute_name}
                          </h5>
                          <span className="px-2 py-0.5 rounded-full bg-[#EBF3E8] text-[#173B2B] text-[11px] font-bold border border-[#6B9B63]/30">
                            Save {gen.savings_percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-[#69736D] mt-1">
                          Manufacturer: <strong className="text-[#17231D]">{gen.manufacturer}</strong> • {gen.strength} {gen.dosage_form}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#6B9B63] font-semibold mt-1.5">
                          <CheckCircle2 size={12} />
                          100% Clinically Bioequivalent
                        </span>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-bold text-[#173B2B]">
                            {formatPrice(gen.price)}
                          </span>
                          <span className="text-[11px] text-[#69736D] line-through block">
                            vs {formatPrice(medicine.average_price)}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setIsReserveModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <Lock size={12} className="text-[#DDE8D2]" />
                          <span>Hold Generic</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#69736D]">
                  Showing real-time stock listings across registered partner pharmacies:
                </p>
                <button
                  onClick={() => onFindNearby(medicine)}
                  className="text-xs font-bold text-[#173B2B] hover:underline flex items-center gap-1"
                >
                  <MapPin size={13} />
                  Open Live Map
                </button>
              </div>

              {inventory.length === 0 ? (
                <div className="text-center py-10 bg-[#F7F9F4] rounded-2xl border border-[#DDE8D2]">
                  <Store size={32} className="mx-auto text-[#69736D] mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-[#17231D]">Currently Out of Stock Nearby</p>
                  <p className="text-xs text-[#69736D] mt-1 max-w-sm mx-auto">
                    No partner pharmacies currently report active stock. You can ask our AI assistant for generic alternatives to consult with your doctor.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {inventory.map((inv) => {
                    const pharm = pharmacies.find(p => p.id === inv.pharmacy_id);
                    return (
                      <div 
                        key={inv.id}
                        className="p-4 rounded-2xl bg-white border border-[#DDE8D2] hover:border-[#6B9B63] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-[#17231D] text-sm">{inv.pharmacy_name}</h5>
                            <StatusBadge status={inv.status} size="sm" />
                          </div>
                          {pharm && (
                            <p className="text-xs text-[#69736D] mt-1 flex items-center gap-1">
                              <MapPin size={12} className="shrink-0 text-[#6B9B63]" />
                              {pharm.address}, {pharm.city}
                              {pharm.distance_km && (
                                <span className="font-semibold text-[#173B2B] ml-1">
                                  ({pharm.distance_km} km away)
                                </span>
                              )}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-[#69736D] mt-1.5">
                            <span>Batch: <strong className="text-[#17231D]">{inv.batch_number || 'BATCH-2026'}</strong></span>
                            <span>Expires: <strong className="text-[#17231D]">{inv.expiry_date || '2027-12'}</strong></span>
                            <span>Stock: <strong className="text-[#17231D]">{inv.stock_quantity} units</strong></span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                          <span className="text-base font-bold text-[#173B2B]">
                            {formatPrice(inv.price)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setReserveTargetPharm(pharm || null);
                                setIsReserveModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#6B9B63] hover:bg-[#6B9B63]/90 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
                            >
                              <Lock size={12} />
                              <span>Hold Stock</span>
                            </button>
                            <button
                              onClick={() => onFindNearby(medicine)}
                              className="px-3 py-1.5 rounded-xl bg-[#173B2B] text-white text-xs font-semibold hover:bg-[#173B2B]/90 transition-colors flex items-center gap-1"
                            >
                              <span>Locate</span>
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-5">
              {/* Precautions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#69736D] mb-2 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-[#E7A23B]" />
                  Important Precautions & Warnings
                </h4>
                <div className="space-y-2">
                  {medicine.precautions.map((prec, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#FFFBF0] border border-[#E7A23B]/30 flex items-start gap-2.5">
                      <AlertTriangle size={15} className="text-[#E7A23B] shrink-0 mt-0.5" />
                      <span className="text-xs text-[#17231D] font-medium">{prec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side Effects */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#69736D] mb-2">
                  Potential Common Side Effects
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {medicine.side_effects.map((se, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs font-medium text-[#17231D]">
                      • {se}
                    </div>
                  ))}
                </div>
              </div>

              {/* Storage recommendation */}
              <div className="p-3.5 rounded-2xl bg-[#DDE8D2]/40 border border-[#6B9B63]/30 text-xs text-[#173B2B]">
                <strong>Recommended Storage:</strong> Store in a cool, dry place below 25°C away from moisture and direct sunlight. Keep out of reach of children.
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 bg-[#F7F9F4] border-t border-[#DDE8D2] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#69736D] text-center sm:text-left max-w-sm">
            🛡️ MediFind AI reference profile. Not a clinical prescription.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setReserveTargetPharm(pharmacies[0] || null);
                setIsReserveModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#DDE8D2] hover:bg-[#DDE8D2]/80 text-[#173B2B] text-xs font-bold border border-[#6B9B63]/30 transition-colors shadow-2xs"
            >
              <Lock size={14} className="text-[#6B9B63]" />
              <span>1-Click Hold</span>
            </button>

            <button
              id="btn-modal-set-reminder"
              onClick={() => onSetReminder(medicine)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#DDE8D2] text-[#173B2B] text-xs font-bold border border-[#DDE8D2] transition-colors shadow-2xs"
            >
              <Bell size={14} className="text-[#6B9B63]" />
              <span>Reminder</span>
            </button>

            <button
              id="btn-modal-ask-ai"
              onClick={() => onAskAI(medicine)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#6B9B63] hover:bg-[#6B9B63]/90 text-white text-xs font-bold transition-all shadow-2xs"
            >
              <Bot size={14} />
              <span>Ask AI</span>
            </button>

            <button
              id="btn-modal-find-map"
              onClick={() => onFindNearby(medicine)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs font-bold transition-all shadow-2xs"
            >
              <MapPin size={14} className="text-[#DDE8D2]" />
              <span>Find Nearby</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click Hold Modal */}
      {isReserveModalOpen && (
        <ReserveMedicineModal
          medicine={medicine}
          pharmacy={reserveTargetPharm}
          onClose={() => setIsReserveModalOpen(false)}
          onSuccess={(res) => {
            // Keep open to show pass
          }}
        />
      )}
    </div>
  );
};
