import React from 'react';
import { MapPin, Phone, Clock, Star, Navigation, CheckCircle2, ChevronRight } from 'lucide-react';
import { Pharmacy } from '../types';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  isSelected?: boolean;
  onSelect: (pharmacy: Pharmacy) => void;
  onGetDirections?: (pharmacy: Pharmacy) => void;
  filteredMedicineName?: string;
  hasStock?: boolean;
}

export const PharmacyCard: React.FC<PharmacyCardProps> = ({
  pharmacy,
  isSelected = false,
  onSelect,
  onGetDirections,
  filteredMedicineName,
  hasStock
}) => {
  return (
    <div 
      id={`pharm-card-${pharmacy.id}`}
      onClick={() => onSelect(pharmacy)}
      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left ${
        isSelected
          ? 'bg-[#FFFFFF] border-[#173B2B] shadow-md ring-2 ring-[#173B2B]/20'
          : 'bg-[#FFFFFF] border-[#DDE8D2] hover:border-[#6B9B63] shadow-2xs hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {pharmacy.is_24x7 ? (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#173B2B] text-white">
                24/7 Open
              </span>
            ) : pharmacy.is_open_now ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#DDE8D2] text-[#173B2B]">
                Open Now
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FDF0F0] text-[#D95C5C]">
                Closed
              </span>
            )}
            
            {pharmacy.distance_km !== undefined && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F7F9F4] text-[#173B2B] border border-[#DDE8D2]">
                {pharmacy.distance_km} km away
              </span>
            )}
          </div>

          <h4 className="text-base font-bold font-heading text-[#17231D] leading-snug">
            {pharmacy.name}
          </h4>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 bg-[#FFF9E6] px-2 py-1 rounded-xl border border-[#E7A23B]/30 shrink-0">
          <Star size={13} className="text-[#E7A23B] fill-[#E7A23B]" />
          <span className="text-xs font-bold text-[#17231D]">{pharmacy.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Address */}
      <p className="text-xs text-[#69736D] flex items-start gap-1.5 mb-3 leading-relaxed">
        <MapPin size={14} className="text-[#6B9B63] shrink-0 mt-0.5" />
        <span>{pharmacy.address}, {pharmacy.city}</span>
      </p>

      {/* Timings & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#69736D] bg-[#F7F9F4] p-2.5 rounded-xl mb-3">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-[#173B2B]" />
          <span className="truncate">{pharmacy.opening_hours}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone size={13} className="text-[#173B2B]" />
          <span className="truncate">{pharmacy.phone}</span>
        </div>
      </div>

      {/* Medicine Stock confirmation banner if searching specific medicine */}
      {filteredMedicineName && (
        <div className={`p-2.5 rounded-xl text-xs font-semibold mb-3 flex items-center justify-between ${
          hasStock 
            ? 'bg-[#DDE8D2]/60 text-[#173B2B] border border-[#6B9B63]/40'
            : 'bg-[#FDF0F0] text-[#D95C5C] border border-[#D95C5C]/30'
        }`}>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className={hasStock ? 'text-[#6B9B63]' : 'text-[#D95C5C]'} />
            {filteredMedicineName}
          </span>
          <span>{hasStock ? 'In Stock ✓' : 'Out of Stock'}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F7F9F4] text-xs">
        <a
          href={`tel:${pharmacy.phone}`}
          onClick={(e) => e.stopPropagation()}
          className="font-semibold text-[#173B2B] hover:text-[#6B9B63] flex items-center gap-1 py-1"
        >
          <Phone size={12} />
          <span>Call Store</span>
        </a>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onGetDirections) onGetDirections(pharmacy);
          }}
          className="flex items-center gap-1 font-bold text-[#173B2B] hover:underline"
        >
          <Navigation size={12} className="text-[#6B9B63]" />
          <span>Directions</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};
