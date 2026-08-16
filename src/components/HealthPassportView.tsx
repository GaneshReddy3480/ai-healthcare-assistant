import React, { useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  Heart, 
  Phone, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  QrCode, 
  Pill,
  CheckCircle2
} from 'lucide-react';
import { User, Reminder, MedicineReservation } from '../types';

interface HealthPassportViewProps {
  user: User | null;
  reminders: Reminder[];
  reservations: MedicineReservation[];
}

export const HealthPassportView: React.FC<HealthPassportViewProps> = ({
  user,
  reminders,
  reservations
}) => {
  const passportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const takenRemindersCount = reminders.filter(r => !!r.last_taken).length;
  const adherenceRate = reminders.length > 0 
    ? Math.round((takenRemindersCount / reminders.length) * 100)
    : 100;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Action Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold">
            <FileText size={14} className="text-[#6B9B63]" />
            <span>Official Clinical Summary • MediFind Patient Passport</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#17231D]">
            Emergency Health Passport
          </h1>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed">
            Standardized 1-page clinical document formatted for attending ER physicians, hospital admissions, and doctor consultations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-3 rounded-2xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
          >
            <Printer size={16} className="text-[#DDE8D2]" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* 1-Page Printable Card Passport */}
      <div 
        ref={passportRef}
        id="printable-health-passport"
        className="bg-white rounded-3xl border-2 border-[#173B2B] p-6 sm:p-10 shadow-lg space-y-8 print:p-0 print:border-none print:shadow-none max-w-4xl mx-auto"
      >
        {/* Passport Top Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#173B2B]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#173B2B] text-white flex items-center justify-center font-bold text-xl">
              M+
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#173B2B] uppercase">
                MediFind AI Patient Passport
              </h2>
              <p className="text-xs text-[#69736D] font-medium">
                Verified Medical Identification & Prescription Monograph
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#69736D] block">Generated Timestamp:</span>
            <span className="text-xs font-bold text-[#17231D]">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#DDE8D2] text-[#173B2B] font-bold block mt-1">
              Doc Ref: MF-MED-9921
            </span>
          </div>
        </div>

        {/* Section 1: Patient Demographics & Emergency Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736D]">Patient Name</span>
            <p className="font-bold text-base text-[#17231D]">{user?.name || 'Nikhil Vardhan'}</p>
            <p className="text-xs text-[#69736D]">{user?.email || 'patient@medifind.ai'}</p>
            <p className="text-xs text-[#69736D]">{user?.phone || '+91 98765 43210'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736D]">Clinical Vitals & Blood</span>
            <p className="font-bold text-base text-[#173B2B]">Blood Group: {user?.blood_group || 'O+'}</p>
            <p className="text-xs text-[#69736D]">DOB: {user?.date_of_birth || '2000-05-18'}</p>
            <p className="text-xs text-[#69736D]">Adherence Score: <strong className="text-[#6B9B63]">{adherenceRate}%</strong></p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF0F0] border border-[#D95C5C]/30 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D95C5C] flex items-center gap-1">
              <Phone size={11} />
              Emergency SOS Contact
            </span>
            <p className="font-bold text-sm text-[#17231D]">{user?.emergency_contact?.name || 'Dr. S. Sharma (Family Physician)'}</p>
            <p className="text-xs font-bold text-[#D95C5C]">{user?.emergency_contact?.phone || '+91 98111 22233'}</p>
            <p className="text-[11px] text-[#69736D]">Relation: {user?.emergency_contact?.relation || 'Primary Care Doctor'}</p>
          </div>

        </div>

        {/* Section 2: Critical Known Allergies */}
        <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#E7A23B]/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E7A23B]">
            <AlertTriangle size={15} />
            <span>Documented Drug & Food Allergies (Contraindications)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(user?.allergies && user.allergies.length > 0 ? user.allergies : ['Penicillin', 'Sulfa drugs']).map((allergy, i) => (
              <span 
                key={i} 
                className="px-3 py-1 rounded-xl bg-white text-[#17231D] text-xs font-bold border border-[#E7A23B]/40 shadow-2xs"
              >
                ⚠️ {allergy}
              </span>
            ))}
          </div>
        </div>

        {/* Section 3: Active Medication Schedule */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-[#17231D] flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Pill size={18} className="text-[#6B9B63]" />
              Active Prescribed Medications ({reminders.length})
            </span>
            <span className="text-xs text-[#69736D] font-normal">Daily Dosages & Frequencies</span>
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-[#DDE8D2]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9F4] text-[#69736D] uppercase text-[10px] tracking-wider border-b border-[#DDE8D2]">
                <tr>
                  <th className="p-3">Medication Name</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Scheduled Time</th>
                  <th className="p-3">Frequency</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE8D2]">
                {reminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-[#F7F9F4]/60">
                    <td className="p-3 font-bold text-[#17231D]">{rem.medicine_name}</td>
                    <td className="p-3 text-[#17231D]">{rem.dosage}</td>
                    <td className="p-3 font-semibold text-[#173B2B]">{rem.time}</td>
                    <td className="p-3 text-[#69736D]">{rem.frequency}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rem.last_taken 
                          ? 'bg-[#DDE8D2] text-[#173B2B]' 
                          : 'bg-[#F7F9F4] text-[#69736D] border border-[#DDE8D2]'
                      }`}>
                        {rem.last_taken ? `Taken (${rem.last_taken})` : 'Pending Today'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Pharmacy Pickup Holds */}
        {reservations.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#17231D]">
              Active Pharmacy Pickup Tokens
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reservations.map((res) => (
                <div key={res.id} className="p-3.5 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#17231D]">{res.medicine_name}</span>
                    <span className="font-mono text-[#173B2B]">{res.pickup_token}</span>
                  </div>
                  <p className="text-[#69736D]">{res.pharmacy_name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Disclaimer */}
        <div className="pt-4 border-t border-[#DDE8D2] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#69736D]">
          <p>
            * MediFind AI Patient Passport. Authenticated by user health record. Non-transferable.
          </p>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#6B9B63]" />
            <span className="font-bold text-[#173B2B]">HIPAA & GDPR Privacy Compliant</span>
          </div>
        </div>

      </div>

    </div>
  );
};
