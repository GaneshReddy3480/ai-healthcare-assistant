import React, { useState } from 'react';
import { 
  X, 
  Globe, 
  MapPin, 
  Sparkles, 
  Check, 
  Navigation, 
  Search, 
  Info, 
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { useCurrency, SUPPORTED_CURRENCIES, CurrencyConfig } from '../context/CurrencyContext';

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyModal: React.FC<CurrencyModalProps> = ({ isOpen, onClose }) => {
  const { 
    currency, 
    setCurrency, 
    currencyConfig,
    isAutoDetected, 
    detectedCountry, 
    detectionMethod, 
    detectLocationViaGPS,
    isDetectingGPS,
    gpsError,
    resetToAutoDetect,
    formatPrice
  } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  if (!isOpen) return null;

  const currenciesList: CurrencyConfig[] = Object.values(SUPPORTED_CURRENCIES);

  const regions = ['All', 'South Asia', 'North America', 'Europe', 'East Asia', 'Southeast Asia', 'Middle East', 'Oceania', 'Africa', 'South America'];

  const filteredCurrencies = currenciesList.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      c.code.toLowerCase().includes(q) || 
      c.name.toLowerCase().includes(q) || 
      c.country.toLowerCase().includes(q) || 
      c.symbol.toLowerCase().includes(q);

    const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
    return matchesQuery && matchesRegion;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17231D]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        id="currency-selector-modal"
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#DDE8D2] overflow-hidden flex flex-col max-h-[90vh]"
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
            <Globe size={13} />
            <span>Automatic Geolocation & Pricing</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
            Currency & Regional Pricing
          </h2>
          <p className="text-xs text-[#DDE8D2] mt-1 leading-relaxed">
            MediFind AI automatically detects your country to format real-time medicine inventory prices.
          </p>
        </div>

        {/* Current Location Status Card */}
        <div className="p-5 bg-[#F7F9F4] border-b border-[#DDE8D2] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#DDE8D2]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#DDE8D2] text-[#173B2B] flex items-center justify-center text-xl shrink-0">
                {currencyConfig.flag}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#17231D]">
                    {detectedCountry} ({currencyConfig.code} - {currencyConfig.symbol})
                  </span>
                  {isAutoDetected ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#EBF3E8] text-[#173B2B] text-[10px] font-bold border border-[#6B9B63]/40 flex items-center gap-1">
                      <Sparkles size={10} className="text-[#6B9B63]" />
                      Auto-Identified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E7A23B] text-[10px] font-bold border border-[#E7A23B]/30">
                      Manual Override
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#69736D] mt-0.5">
                  1 USD ≈ {currencyConfig.symbol}{currencyConfig.rateAgainstUSD} {currencyConfig.code} • Sample med: {formatPrice(5.0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={detectLocationViaGPS}
                disabled={isDetectingGPS}
                className="px-3 py-1.5 rounded-xl bg-[#F7F9F4] hover:bg-[#DDE8D2] text-[#173B2B] text-xs font-bold border border-[#DDE8D2] transition-colors flex items-center gap-1"
                title="Use GPS for precise city and regional identification"
              >
                <Navigation size={12} className={isDetectingGPS ? 'animate-spin' : ''} />
                <span>{isDetectingGPS ? 'Detecting...' : 'Detect GPS'}</span>
              </button>

              {!isAutoDetected && (
                <button
                  onClick={resetToAutoDetect}
                  className="px-3 py-1.5 rounded-xl bg-[#173B2B] text-white text-xs font-bold hover:bg-[#173B2B]/90 transition-colors flex items-center gap-1"
                  title="Reset to automatic location detection"
                >
                  <RefreshCw size={11} />
                  <span>Reset Auto</span>
                </button>
              )}
            </div>
          </div>

          {gpsError && (
            <p className="text-[11px] text-[#D95C5C] bg-[#FFF0F0] p-2.5 rounded-xl border border-[#D95C5C]/30 flex items-center gap-1.5">
              <Info size={13} />
              <span>{gpsError}</span>
            </p>
          )}
        </div>

        {/* Search & Region Filter Chips */}
        <div className="p-4 border-b border-[#DDE8D2] space-y-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by country, currency name (e.g. INR, Euro, Dollar)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRegion === reg
                    ? 'bg-[#173B2B] text-white shadow-2xs'
                    : 'bg-[#F7F9F4] text-[#17231D] hover:bg-[#DDE8D2] border border-[#DDE8D2]'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Grid */}
        <div className="p-4 overflow-y-auto max-h-[340px] grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredCurrencies.map((item) => {
            const isSelected = currency === item.code;
            return (
              <button
                key={item.code}
                onClick={() => {
                  setCurrency(item.code);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected 
                    ? 'bg-[#EBF3E8] border-[#173B2B] shadow-2xs' 
                    : 'bg-white border-[#DDE8D2] hover:border-[#6B9B63] hover:bg-[#F7F9F4]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">{item.flag}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#17231D]">{item.code}</span>
                      <span className="text-[11px] text-[#69736D] font-mono">({item.symbol})</span>
                    </div>
                    <p className="text-[11px] text-[#69736D] truncate">{item.name} • {item.country}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#173B2B] text-white flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F9F4] border-t border-[#DDE8D2] flex items-center justify-between text-xs">
          <span className="text-[#69736D] text-[11px]">
            * All medicine prices are automatically converted from base rates.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#173B2B] text-white font-bold hover:bg-[#173B2B]/90 transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
