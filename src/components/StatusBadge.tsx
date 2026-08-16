import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { AvailabilityStatus } from '../types';

interface StatusBadgeProps {
  status: AvailabilityStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const normalized = (status || '').toLowerCase();

  let bg = 'bg-[#DDE8D2]/60 text-[#173B2B] border-[#6B9B63]/30';
  let label = 'Available';
  let Icon = CheckCircle2;

  if (normalized === 'low_stock' || normalized === 'low stock') {
    bg = 'bg-[#FFF7E6] text-[#B26B00] border-[#E7A23B]/40';
    label = 'Low Stock';
    Icon = AlertTriangle;
  } else if (normalized === 'unavailable' || normalized === 'out_of_stock' || normalized === 'out of stock') {
    bg = 'bg-[#FDF0F0] text-[#D95C5C] border-[#D95C5C]/30';
    label = 'Unavailable';
    Icon = XCircle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }[size];

  return (
    <span 
      id={`status-badge-${normalized}`}
      className={`inline-flex items-center rounded-full border ${bg} ${sizeClasses} whitespace-nowrap shadow-2xs transition-colors`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
