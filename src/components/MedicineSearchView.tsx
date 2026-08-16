import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Pill, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  Zap,
  Tag,
  DollarSign,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Mic,
  MicOff
} from 'lucide-react';
import { Medicine, AvailabilityStatus } from '../types';
import { MedicineCard } from './MedicineCard';
import { useCurrency } from '../context/CurrencyContext';

interface MedicineSearchViewProps {
  medicines: Medicine[];
  initialSearchQuery?: string;
  onViewDetails: (medicine: Medicine) => void;
  onFindNearby: (medicine: Medicine) => void;
  onAskAI: (medicine: Medicine) => void;
  onSetReminder?: (medicine: Medicine) => void;
}

export const MedicineSearchView: React.FC<MedicineSearchViewProps> = ({
  medicines,
  initialSearchQuery = '',
  onViewDetails,
  onFindNearby,
  onAskAI,
  onSetReminder
}) => {
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('all');
  const [selectedStrength, setSelectedStrength] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'rx' | 'otc'>('all');
  const [maxPrice, setMaxPrice] = useState<number>(30);
  const [sortBy, setSortBy] = useState<'name' | 'price_asc' | 'price_desc' | 'availability'>('name');
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice dictation is supported in modern Chrome, Edge, and Safari.');
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsVoiceListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
      };
      recognition.onerror = () => setIsVoiceListening(false);
      recognition.onend = () => setIsVoiceListening(false);
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsVoiceListening(false);
    }
  };
  
  // Advanced filters expansion toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sync initial query if updated from outside
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Derived lists for dropdowns & chips
  const categories = [
    'All',
    'Analgesics & Antipyretics',
    'Antibiotics (Macrolide)',
    'Antibiotics (Penicillin)',
    'Antihistamines',
    'Gastrointestinal (PPI)',
    'Respiratory & Bronchodilator',
    'Antidiabetic (Biguanide)',
    'Lipid-Lowering Agent (Statin)'
  ];

  const forms = ['all', 'Tablet', 'Capsule', 'Inhaler', 'Syrup', 'Injection'];

  // Extract unique manufacturers and strengths from current dataset
  const manufacturers = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach(m => {
      if (m.manufacturer) set.add(m.manufacturer);
    });
    return Array.from(set).sort();
  }, [medicines]);

  const strengths = useMemo(() => {
    const set = new Set<string>();
    medicines.forEach(m => {
      if (m.strength) set.add(m.strength);
    });
    return Array.from(set).sort();
  }, [medicines]);

  // Filter & Sort Logic
  const filteredMedicines = useMemo(() => {
    return medicines
      .filter((med) => {
        // Search query match
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q || 
          med.name.toLowerCase().includes(q) ||
          med.generic_name.toLowerCase().includes(q) ||
          med.manufacturer.toLowerCase().includes(q) ||
          med.strength.toLowerCase().includes(q) ||
          med.uses.some(u => u.toLowerCase().includes(q));

        // Category match
        const matchesCategory = selectedCategory === 'All' || med.category === selectedCategory;

        // Manufacturer match
        const matchesManufacturer = 
          selectedManufacturer === 'all' || 
          med.manufacturer.toLowerCase() === selectedManufacturer.toLowerCase();

        // Strength match
        const matchesStrength = 
          selectedStrength === 'all' || 
          med.strength.toLowerCase() === selectedStrength.toLowerCase();

        // Availability match
        const matchesAvailability = 
          selectedAvailability === 'all' || 
          med.stock_status === selectedAvailability;

        // Form match
        const matchesForm = selectedForm === 'all' || med.form.toLowerCase() === selectedForm.toLowerCase();

        // Prescription match
        const matchesRx = 
          prescriptionFilter === 'all' || 
          (prescriptionFilter === 'rx' && med.prescription_required) ||
          (prescriptionFilter === 'otc' && !med.prescription_required);

        // Price range
        const matchesPrice = med.average_price <= maxPrice;

        return (
          matchesQuery && 
          matchesCategory && 
          matchesManufacturer && 
          matchesStrength && 
          matchesAvailability && 
          matchesForm && 
          matchesRx && 
          matchesPrice
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'price_asc') return a.average_price - b.average_price;
        if (sortBy === 'price_desc') return b.average_price - a.average_price;
        if (sortBy === 'availability') return b.available_pharmacies_count - a.available_pharmacies_count;
        return 0;
      });
  }, [
    medicines, 
    searchQuery, 
    selectedCategory, 
    selectedManufacturer, 
    selectedStrength, 
    selectedAvailability, 
    selectedForm, 
    prescriptionFilter, 
    maxPrice, 
    sortBy
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedManufacturer('all');
    setSelectedStrength('all');
    setSelectedAvailability('all');
    setSelectedForm('all');
    setPrescriptionFilter('all');
    setMaxPrice(30);
    setSortBy('name');
  };

  const activeFilterCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedManufacturer !== 'all' ? 1 : 0) +
    (selectedStrength !== 'all' ? 1 : 0) +
    (selectedAvailability !== 'all' ? 1 : 0) +
    (selectedForm !== 'all' ? 1 : 0) +
    (prescriptionFilter !== 'all' ? 1 : 0) +
    (maxPrice < 30 ? 1 : 0) +
    (searchQuery !== '' ? 1 : 0);

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER - HEALIUM STYLE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DDE8D2] shadow-xs relative overflow-hidden">
        {/* Soft background ambient gradient */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#DDE8D2]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold mb-3">
            <Pill size={14} className="text-[#6B9B63]" />
            <span>Master Medicine & Stock Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D] mb-2 tracking-tight">
            Medicine Search & Stock Availability
          </h2>
          <p className="text-xs sm:text-sm text-[#69736D] leading-relaxed">
            Search verified pharmaceutical products by brand, chemical salt, manufacturer, or strength. Compare verified prices and locate nearby pharmacies with live stock.
          </p>
        </div>

        {/* Primary Search Input */}
        <div className="mt-6 relative z-10">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#69736D]" />
            <input
              id="med-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand (Dolo, Augmentin), generic name (Paracetamol), manufacturer (Cipla), or dosage..."
              className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2] text-sm text-[#17231D] placeholder:text-[#69736D] focus:outline-none focus:border-[#173B2B] focus:ring-1 focus:ring-[#173B2B] transition-all"
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-2 rounded-xl transition-all ${
                  isVoiceListening 
                    ? 'bg-[#D95C5C] text-white animate-pulse' 
                    : 'text-[#69736D] hover:text-[#173B2B] hover:bg-[#DDE8D2]'
                }`}
                title={isVoiceListening ? 'Listening...' : 'Voice Search Medicine'}
              >
                {isVoiceListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#69736D] hover:text-[#17231D] p-1.5 rounded-full hover:bg-[#DDE8D2]/50 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top Category Filter Carousel */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar relative z-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#173B2B] text-white shadow-2xs'
                  : 'bg-[#F7F9F4] text-[#17231D] hover:bg-[#DDE8D2] border border-[#DDE8D2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FILTER CONTROLS & ADVANCED DRAWER */}
      <div className="bg-white rounded-3xl border border-[#DDE8D2] p-5 shadow-xs space-y-4">
        
        {/* Top Row: Quick Filters & Advanced Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="font-bold text-[#17231D] flex items-center gap-1.5 w-full sm:w-auto">
              <SlidersHorizontal size={15} className="text-[#6B9B63]" />
              Quick Filters:
            </span>

            {/* Availability Status Filter */}
            <select
              id="filter-availability-status"
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs font-semibold text-[#17231D] focus:outline-none cursor-pointer"
            >
              <option value="all">Availability: All</option>
              <option value="available">🟢 In Stock</option>
              <option value="low_stock">🟡 Low Stock</option>
              <option value="unavailable">🔴 Out of Stock</option>
            </select>

            {/* Manufacturer Quick Filter */}
            <select
              id="filter-manufacturer"
              value={selectedManufacturer}
              onChange={(e) => setSelectedManufacturer(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs font-semibold text-[#17231D] focus:outline-none cursor-pointer max-w-[160px] sm:max-w-[190px] truncate"
            >
              <option value="all">Manufacturer: All</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Strength Quick Filter */}
            <select
              id="filter-strength"
              value={selectedStrength}
              onChange={(e) => setSelectedStrength(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs font-semibold text-[#17231D] focus:outline-none cursor-pointer"
            >
              <option value="all">Strength: All</option>
              {strengths.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Advanced Filters Expand Toggle */}
            <button
              id="btn-toggle-advanced-filters"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                showAdvancedFilters || activeFilterCount > 0
                  ? 'bg-[#173B2B] text-white border-[#173B2B]'
                  : 'bg-[#F7F9F4] text-[#17231D] border-[#DDE8D2] hover:bg-[#DDE8D2]/60'
              }`}
            >
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#6B9B63] text-white text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DDE8D2]/60">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-[#69736D]" />
              <span className="text-[#69736D] font-medium">Sort:</span>
            </div>
            <select
              id="select-sort-medicines"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs font-bold text-[#173B2B] focus:outline-none cursor-pointer"
            >
              <option value="name">Name (A–Z)</option>
              <option value="availability">Stock (Highest)</option>
              <option value="price_asc">Price (Lowest)</option>
              <option value="price_desc">Price (Highest)</option>
            </select>
          </div>

        </div>

        {/* EXPANDABLE ADVANCED FILTER PANEL */}
        {showAdvancedFilters && (
          <div className="pt-4 mt-2 border-t border-[#F7F9F4] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Dosage Form Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#69736D] mb-1.5">
                Dosage Form
              </label>
              <select
                value={selectedForm}
                onChange={(e) => setSelectedForm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none"
              >
                <option value="all">All Forms (Tablets, Syrups, etc.)</option>
                {forms.filter(f => f !== 'all').map(f => (
                  <option key={f} value={f}>{f}s</option>
                ))}
              </select>
            </div>

            {/* Prescription Requirement Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#69736D] mb-1.5">
                Prescription Requirement
              </label>
              <select
                value={prescriptionFilter}
                onChange={(e) => setPrescriptionFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none"
              >
                <option value="all">All (Rx Required & OTC)</option>
                <option value="otc">Over-The-Counter (OTC) Only</option>
                <option value="rx">Prescription Required (Rx) Only</option>
              </select>
            </div>

            {/* Max Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#69736D]">
                  Max Price
                </label>
                <span className="text-xs font-bold text-[#173B2B]">{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="2"
                max="30"
                step="0.5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
                className="w-full accent-[#173B2B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#69736D] mt-0.5">
                <span>{formatPrice(2)}</span>
                <span>{formatPrice(30)}</span>
              </div>
            </div>

            {/* Reset / Actions */}
            <div className="flex flex-col justify-end">
              <button
                onClick={clearAllFilters}
                className="w-full px-3 py-2 rounded-xl bg-[#FFF2F2] hover:bg-[#FCDADA] text-[#D95C5C] text-xs font-bold border border-[#FCDADA] transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Reset All Filters</span>
              </button>
            </div>

          </div>
        )}

        {/* ACTIVE FILTER CHIPS ROW */}
        {activeFilterCount > 0 && (
          <div className="pt-3 border-t border-[#F7F9F4] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#69736D]">Active Filters:</span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDE8D2] text-[#173B2B]">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDE8D2] text-[#173B2B]">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedManufacturer !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDE8D2] text-[#173B2B]">
                Brand: {selectedManufacturer}
                <button onClick={() => setSelectedManufacturer('all')} className="hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedStrength !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDE8D2] text-[#173B2B]">
                Dose: {selectedStrength}
                <button onClick={() => setSelectedStrength('all')} className="hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedAvailability !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDE8D2] text-[#173B2B]">
                Stock: {selectedAvailability.replace('_', ' ').toUpperCase()}
                <button onClick={() => setSelectedAvailability('all')} className="hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}

            {selectedForm !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDE8D2] text-[#173B2B]">
                Form: {selectedForm}
                <button onClick={() => setSelectedForm('all')} className="hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}

            {prescriptionFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDE8D2] text-[#173B2B]">
                Type: {prescriptionFilter.toUpperCase()}
                <button onClick={() => setPrescriptionFilter('all')} className="hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}

            {maxPrice < 30 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDE8D2] text-[#173B2B]">
                Max: {formatPrice(maxPrice)}
                <button onClick={() => setMaxPrice(30)} className="hover:text-black">
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-[#D95C5C] hover:underline ml-1"
            >
              Clear All
            </button>
          </div>
        )}

      </div>

      {/* RESULTS COUNT */}
      <div className="flex items-center justify-between text-xs text-[#69736D] px-1">
        <span>
          Showing <strong className="text-[#17231D]">{filteredMedicines.length}</strong> matching medications (out of {medicines.length} in catalog)
        </span>
        {sortBy && (
          <span className="hidden sm:inline">
            Ordered by: <strong className="text-[#173B2B] capitalize">{sortBy.replace('_', ' ')}</strong>
          </span>
        )}
      </div>

      {/* MEDICINES CARD GRID */}
      {filteredMedicines.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#DDE8D2] p-8 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#DDE8D2] text-[#173B2B] flex items-center justify-center mx-auto mb-4">
            <Pill size={28} />
          </div>
          <h3 className="text-lg font-bold font-heading text-[#17231D] mb-1">
            No Medicines Match Your Active Filter Criteria
          </h3>
          <p className="text-xs text-[#69736D] max-w-sm mx-auto mb-5 leading-relaxed">
            Try adjusting your strength or manufacturer selection, broadening the price range, or clearing current filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl bg-[#173B2B] text-white text-xs font-bold shadow-2xs hover:bg-[#173B2B]/90 transition-all"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onViewDetails={onViewDetails}
              onFindNearby={onFindNearby}
              onAskAI={onAskAI}
              onSetReminder={onSetReminder}
            />
          ))}
        </div>
      )}
    </div>
  );
};
