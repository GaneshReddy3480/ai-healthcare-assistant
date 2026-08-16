import React from 'react';
import { Pill, MapPin, Bot, ChevronRight, ShieldAlert, Store, Clock } from 'lucide-react';
import { Medicine } from '../types';
import { StatusBadge } from './StatusBadge';
import { useCurrency } from '../context/CurrencyContext';

interface MedicineCardProps {
  medicine: Medicine;
  onViewDetails: (medicine: Medicine) => void;
  onFindNearby: (medicine: Medicine) => void;
  onAskAI: (medicine: Medicine) => void;
  onSetReminder?: (medicine: Medicine) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onViewDetails,
  onFindNearby,
  onAskAI,
  onSetReminder
}) => {
  const { formatPrice } = useCurrency();

  return (
    <div 
      id={`med-card-${medicine.id}`}
      className="bg-[#FFFFFF] rounded-2xl border border-[#DDE8D2] hover:border-[#6B9B63]/60 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Header row with badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={medicine.stock_status} size="sm" />
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F7F9F4] text-[#69736D] border border-[#DDE8D2]">
              {medicine.form}
            </span>
            {medicine.prescription_required && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E7A23B] border border-[#E7A23B]/30" title="Valid Doctor Prescription Required">
                <ShieldAlert size={11} />
                Rx Required
              </span>
            )}
          </div>
          <span className="text-base font-bold text-[#173B2B] whitespace-nowrap">
            {formatPrice(medicine.average_price)}
          </span>
        </div>

        {/* Medicine Main Title */}
        <h3 
          onClick={() => onViewDetails(medicine)}
          className="text-lg font-bold font-heading text-[#17231D] group-hover:text-[#173B2B] cursor-pointer transition-colors leading-snug line-clamp-1"
        >
          {medicine.name}
        </h3>
        <p className="text-xs text-[#69736D] mt-0.5 mb-2.5 font-medium line-clamp-1">
          {medicine.generic_name}
        </p>

        {/* Short info row */}
        <div className="space-y-1.5 text-xs text-[#69736D] bg-[#F7F9F4] p-3 rounded-xl mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[#69736D]">Manufacturer:</span>
            <span className="font-semibold text-[#17231D] truncate max-w-[150px]">{medicine.manufacturer}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#69736D]">Category:</span>
            <span className="font-medium text-[#17231D]">{medicine.category}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[#DDE8D2]/60">
            <span className="flex items-center gap-1 text-[#173B2B] font-semibold">
              <Store size={13} className="text-[#6B9B63]" />
              Verified stock:
            </span>
            <span className="font-bold text-[#173B2B]">
              {medicine.available_pharmacies_count > 0 ? (
                `${medicine.available_pharmacies_count} ${medicine.available_pharmacies_count === 1 ? 'Pharmacy' : 'Pharmacies'}`
              ) : (
                <span className="text-[#D95C5C]">Not in stock</span>
              )}
            </span>
          </div>
        </div>

        {/* Common Uses Tags */}
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#69736D] mb-1.5">Common uses:</p>
          <div className="flex flex-wrap gap-1">
            {medicine.uses.slice(0, 2).map((use, idx) => (
              <span 
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-[#DDE8D2]/50 text-[#173B2B] font-medium"
              >
                {use}
              </span>
            ))}
            {medicine.uses.length > 2 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-md text-[#69736D]">
                +{medicine.uses.length - 2} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="pt-3 border-t border-[#F7F9F4] flex items-center gap-1.5">
        <button
          id={`btn-view-med-${medicine.id}`}
          onClick={() => onViewDetails(medicine)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#173B2B] text-white text-xs font-semibold hover:bg-[#173B2B]/90 transition-all shadow-2xs"
        >
          <span>View Details</span>
          <ChevronRight size={13} />
        </button>

        <button
          id={`btn-find-pharm-${medicine.id}`}
          onClick={() => onFindNearby(medicine)}
          title="Find at Nearby Pharmacies"
          className="p-2 rounded-xl bg-[#F7F9F4] text-[#173B2B] hover:bg-[#DDE8D2] transition-colors border border-[#DDE8D2]"
        >
          <MapPin size={15} />
        </button>

        <button
          id={`btn-ask-ai-med-${medicine.id}`}
          onClick={() => onAskAI(medicine)}
          title="Ask AI Health Assistant about this medicine"
          className="p-2 rounded-xl bg-[#F7F9F4] text-[#173B2B] hover:bg-[#DDE8D2] transition-colors border border-[#DDE8D2]"
        >
          <Bot size={15} />
        </button>
      </div>
    </div>
  );
};
