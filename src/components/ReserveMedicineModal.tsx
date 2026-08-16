import React, { useState } from 'react';
import { 
  X, 
  Store, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Copy, 
  Check,
  Pill
} from 'lucide-react';
import { Medicine, Pharmacy, MedicineReservation } from '../types';
import { api } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

interface ReserveMedicineModalProps {
  medicine: Medicine;
  pharmacy?: Pharmacy | null;
  onClose: () => void;
  onSuccess: (reservation: MedicineReservation) => void;
}

export const ReserveMedicineModal: React.FC<ReserveMedicineModalProps> = ({
  medicine,
  pharmacy,
  onClose,
  onSuccess
}) => {
  const { formatPrice } = useCurrency();
  const [patientName, setPatientName] = useState('Nikhil Vardhan');
  const [patientPhone, setPatientPhone] = useState('+91 98765 43210');
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedReservation, setCompletedReservation] = useState<MedicineReservation | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const pricePerUnit = medicine.average_price;
  const totalPrice = Number((quantity * pricePerUnit).toFixed(2));

  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createReservation({
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        pharmacy_id: pharmacy?.id || 'pharm-1',
        pharmacy_name: pharmacy?.name || 'Apollo 24/7 Pharmacy - Connaught Place',
        patient_name: patientName,
        patient_phone: patientPhone,
        quantity,
        price_per_unit: pricePerUnit
      });
      setCompletedReservation(res);
      onSuccess(res);
    } catch (err) {
      console.error('Reservation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToken = () => {
    if (completedReservation?.pickup_token) {
      navigator.clipboard?.writeText(completedReservation.pickup_token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17231D]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        id="reserve-medicine-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#DDE8D2] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#173B2B] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#DDE8D2] text-xs font-bold mb-2">
            <Clock size={13} />
            <span>4-Hour Guaranteed Stock Hold</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            {completedReservation ? 'Pickup Pass Generated!' : `Hold ${medicine.name}`}
          </h2>
          <p className="text-xs text-[#DDE8D2] mt-1">
            {pharmacy ? pharmacy.name : 'Nearest In-Stock Verified Pharmacy'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {completedReservation ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#DDE8D2] text-[#173B2B] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} className="text-[#6B9B63]" />
              </div>

              <div>
                <h3 className="text-xl font-bold font-heading text-[#17231D]">
                  Medicine Reserved Successfully
                </h3>
                <p className="text-xs text-[#69736D] mt-1">
                  The chemist has been notified. Present your pickup token or QR pass at the pharmacy counter.
                </p>
              </div>

              {/* Pass Token Box */}
              <div className="p-5 rounded-2xl bg-[#F7F9F4] border-2 border-dashed border-[#173B2B] text-center space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#69736D]">
                  Your Secure Pickup Token
                </span>
                <div className="text-3xl font-extrabold font-mono text-[#173B2B] tracking-wider">
                  {completedReservation.pickup_token}
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleCopyToken}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#DDE8D2] text-xs font-bold text-[#173B2B] hover:bg-[#DDE8D2] transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    {copiedToken ? <Check size={14} className="text-[#6B9B63]" /> : <Copy size={14} />}
                    <span>{copiedToken ? 'Copied to Clipboard' : 'Copy Token'}</span>
                  </button>
                </div>
              </div>

              {/* Reservation Details Breakdown */}
              <div className="p-4 rounded-2xl bg-white border border-[#DDE8D2] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#69736D]">Pharmacy:</span>
                  <span className="font-bold text-[#17231D]">{completedReservation.pharmacy_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#69736D]">Quantity Held:</span>
                  <span className="font-bold text-[#17231D]">{completedReservation.quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#69736D]">Estimated Total:</span>
                  <span className="font-bold text-[#173B2B] text-sm">{formatPrice(completedReservation.total_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#69736D]">Hold Expires:</span>
                  <span className="font-bold text-[#E7A23B]">4 Hours from Now</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-[#173B2B] text-white text-xs sm:text-sm font-bold hover:bg-[#173B2B]/90 transition-all shadow-xs"
              >
                Done & View Reservations
              </button>
            </div>
          ) : (
            <form onSubmit={handleConfirmReservation} className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#69736D]">Medication:</span>
                  <span className="font-bold text-[#17231D]">{medicine.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#69736D]">Unit Price:</span>
                  <span className="font-bold text-[#17231D]">{formatPrice(pricePerUnit)}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#DDE8D2]">
                  <span className="text-[#69736D]">Total Estimate:</span>
                  <span className="font-bold text-base text-[#173B2B]">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Quantity Picker */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1">
                  Quantity (Packs / Units):
                </label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 5].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        quantity === q
                          ? 'bg-[#173B2B] text-white border-[#173B2B] shadow-2xs'
                          : 'bg-white text-[#17231D] border-[#DDE8D2] hover:bg-[#DDE8D2]'
                      }`}
                    >
                      {q} {q === 1 ? 'Pack' : 'Packs'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Contact Info */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231D] mb-1">
                    Patient Full Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-1 focus:ring-[#173B2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231D] mb-1">
                    Contact Phone Number (For SMS pickup pass):
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-1 focus:ring-[#173B2B]"
                  />
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-[#FFFBF0] border border-[#E7A23B]/30 flex items-start gap-2 text-[11px] text-[#17231D]">
                <ShieldCheck size={15} className="text-[#E7A23B] shrink-0 mt-0.5" />
                <span>
                  No online payment required now. Pay at counter during pickup. A 4-hour hold token will be generated instantly.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#DDE8D2] text-xs font-bold text-[#69736D] hover:bg-[#F7F9F4]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Clock size={15} />
                  <span>{isSubmitting ? 'Reserving...' : 'Confirm 4-Hour Hold'}</span>
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
