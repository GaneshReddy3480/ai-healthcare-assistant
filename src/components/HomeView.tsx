import React, { useState } from 'react';
import { 
  Search, 
  Upload, 
  MapPin, 
  Bot, 
  Pill, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Bell, 
  Clock, 
  Sparkles, 
  Building2, 
  ChevronRight,
  Store,
  Compass,
  Send,
  FileText,
  Scan,
  Check,
  Phone,
  Navigation,
  Star,
  Plus,
  AlertCircle,
  TrendingDown,
  ShieldAlert,
  FileHeart,
  Lock,
  Activity,
  Zap
} from 'lucide-react';
import { Medicine, Pharmacy, Reminder, User } from '../types';
import { MedicineCard } from './MedicineCard';
import { PharmacyMap } from './PharmacyMap';
import { PharmacyCard } from './PharmacyCard';

interface HomeViewProps {
  onNavigate: (tab: string, context?: any) => void;
  onSearchSubmit: (query: string) => void;
  featuredMedicines: Medicine[];
  pharmacies: Pharmacy[];
  reminders: Reminder[];
  currentUser: User | null;
  onViewMedicineDetails: (medicine: Medicine) => void;
  onFindNearby: (medicine: Medicine) => void;
  onAskAI: (medicine: Medicine) => void;
  onToggleReminderTaken: (id: string) => void;
  onSetReminder?: (medicine: Medicine) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSearchSubmit,
  featuredMedicines,
  pharmacies,
  reminders,
  currentUser,
  onViewMedicineDetails,
  onFindNearby,
  onAskAI,
  onToggleReminderTaken,
  onSetReminder
}) => {
  const [heroSearchInput, setHeroSearchInput] = useState('');
  const [quickAiPrompt, setQuickAiPrompt] = useState('');
  const [selectedHomePharmacy, setSelectedHomePharmacy] = useState<Pharmacy | null>(pharmacies[0] || null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  const quickSearchTags = [
    'Paracetamol', 
    'Azithromycin', 
    'Cetirizine', 
    'Metformin', 
    'Amoxicillin', 
    'Inhaler'
  ];

  const categories = [
    'All',
    'Analgesics',
    'Antibiotics',
    'Antihistamines',
    'Respiratory',
    'Antidiabetic'
  ];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchInput.trim()) {
      onSearchSubmit(heroSearchInput.trim());
    }
  };

  const handleQuickAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAiPrompt.trim()) {
      onNavigate('assistant', { initialMessage: quickAiPrompt.trim() });
    }
  };

  const filteredMedicines = activeCategoryFilter === 'All'
    ? featuredMedicines
    : featuredMedicines.filter(m => m.category.toLowerCase().includes(activeCategoryFilter.toLowerCase()));

  return (
    <div className="space-y-12 pb-16">
      
      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 1: HEALIUM HERO & CLINICAL BENTO */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Hero Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-10 shadow-xs relative flex flex-col justify-between overflow-hidden">
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#DDE8D2]/40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold tracking-tight">
                <span className="w-2 h-2 rounded-full bg-[#6B9B63] animate-pulse" />
                <span>Healium Health Engine • Real-Time Chemist Radar</span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] text-[#17231D] tracking-tight font-heading">
                  Find medicines faster.<br />
                  <span className="text-[#173B2B]">Understand your health better.</span>
                </h1>
                <p className="text-sm sm:text-base text-[#69736D] mt-3 leading-relaxed max-w-xl">
                  Locate verified in-stock medicines at nearby pharmacies, discover generic bio-equivalent savings up to 80%, and get instant AI-backed drug interaction safety checks.
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleHeroSubmit} className="relative pt-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-[#69736D]">
                    <Search size={20} className="text-[#173B2B]" />
                  </div>
                  <input
                    id="hero-search-input"
                    type="text"
                    value={heroSearchInput}
                    onChange={(e) => setHeroSearchInput(e.target.value)}
                    placeholder="Search by brand, salt, or symptom (e.g. Dolo 650, Metformin, Fever)..."
                    className="w-full h-14 sm:h-16 pl-11 sm:pl-13 pr-24 sm:pr-36 bg-[#F7F9F4] border border-[#DDE8D2] rounded-2xl text-xs sm:text-base text-[#17231D] placeholder:text-[#69736D] focus:outline-none focus:ring-2 focus:ring-[#173B2B] transition-all"
                  />
                  <button
                    id="btn-hero-search-submit"
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Search</span>
                    <ArrowRight size={14} className="text-[#DDE8D2]" />
                  </button>
                </div>

                {/* Quick Trending Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 text-xs text-[#69736D]">
                  <span className="font-semibold text-[#17231D]">Popular Searches:</span>
                  {quickSearchTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => onSearchSubmit(tag)}
                      className="px-3 py-1 rounded-full bg-white hover:bg-[#DDE8D2] text-[#17231D] text-xs font-semibold border border-[#DDE8D2] transition-colors shadow-2xs"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Bottom Floating Stats Pill */}
            <div className="mt-8 pt-6 border-t border-[#DDE8D2] grid grid-cols-3 gap-2 sm:gap-4 text-left">
              <div>
                <div className="text-lg sm:text-2xl font-bold font-heading text-[#173B2B]">2,400+</div>
                <div className="text-[10px] sm:text-[11px] text-[#69736D] font-medium leading-tight">Verified Pharmacies</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold font-heading text-[#173B2B]">15,000+</div>
                <div className="text-[10px] sm:text-[11px] text-[#69736D] font-medium leading-tight">Bio-Equivalents</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold font-heading text-[#6B9B63]">4-Hour</div>
                <div className="text-[10px] sm:text-[11px] text-[#69736D] font-medium leading-tight">Guaranteed Hold</div>
              </div>
            </div>
          </div>

          {/* Right Bento Action Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Bento Card 1: Prescription OCR Scan */}
            <div 
              onClick={() => onNavigate('prescription')}
              className="p-6 rounded-3xl bg-[#173B2B] text-white shadow-xs hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex-1 flex flex-col justify-between"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#6B9B63]/20 rounded-full blur-2xl pointer-events-none" />
              
              <div>
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                  <Scan size={20} className="text-[#DDE8D2]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DDE8D2] block mb-1">
                  AI Optical Vision
                </span>
                <h3 className="text-xl font-bold font-heading text-white">
                  Scan Doctor's Rx
                </h3>
                <p className="text-xs text-[#DDE8D2] mt-1 line-clamp-2">
                  Extract handwritten and printed medicines with automatic dosage and stock lookup.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#DDE8D2]">
                <span>Upload or Snap Photo</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bento Card 2: Drug Interaction Checker */}
            <div 
              onClick={() => onNavigate('interactions')}
              className="p-6 rounded-3xl bg-[#DDE8D2] text-[#173B2B] shadow-xs hover:shadow-md transition-all cursor-pointer group flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#173B2B] text-white flex items-center justify-center mb-3">
                  <ShieldAlert size={20} className="text-[#DDE8D2]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#173B2B]/70 block mb-1">
                  Clinical Pharmacology
                </span>
                <h3 className="text-xl font-bold font-heading text-[#173B2B]">
                  Drug Interaction Checker
                </h3>
                <p className="text-xs text-[#17231D]/80 mt-1 line-clamp-2">
                  Verify multi-drug contraindications, food warnings, and metabolic interference.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#173B2B]">
                <span>Test Drug Regimen</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 2: HEALIUM FEATURE CARDS (4 PILLARS) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate('medicines')}
          className="p-5 rounded-3xl bg-white border border-[#DDE8D2] hover:border-[#173B2B] transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F7F9F4] group-hover:bg-[#173B2B] text-[#173B2B] group-hover:text-white flex items-center justify-center transition-colors mb-3">
            <TrendingDown size={20} />
          </div>
          <h4 className="font-bold text-sm text-[#17231D]">Generic Substitutes</h4>
          <p className="text-xs text-[#69736D] mt-1 leading-relaxed">
            Find bio-equivalent generic molecules and save up to 80% on brand-name prescriptions.
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#173B2B] mt-3">
            <span>Explore Index</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        <div 
          onClick={() => onNavigate('passport')}
          className="p-5 rounded-3xl bg-white border border-[#DDE8D2] hover:border-[#173B2B] transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F7F9F4] group-hover:bg-[#173B2B] text-[#173B2B] group-hover:text-white flex items-center justify-center transition-colors mb-3">
            <FileHeart size={20} />
          </div>
          <h4 className="font-bold text-sm text-[#17231D]">Emergency Health Passport</h4>
          <p className="text-xs text-[#69736D] mt-1 leading-relaxed">
            Standardized 1-page clinical record with allergies, blood group, and active Rx for ER doctors.
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#173B2B] mt-3">
            <span>Generate PDF</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        <div 
          onClick={() => onNavigate('pharmacies')}
          className="p-5 rounded-3xl bg-white border border-[#DDE8D2] hover:border-[#173B2B] transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F7F9F4] group-hover:bg-[#173B2B] text-[#173B2B] group-hover:text-white flex items-center justify-center transition-colors mb-3">
            <Store size={20} />
          </div>
          <h4 className="font-bold text-sm text-[#17231D]">1-Click Chemist Hold</h4>
          <p className="text-xs text-[#69736D] mt-1 leading-relaxed">
            Reserve essential medicines for 4 hours with instant counter pickup tokens.
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#173B2B] mt-3">
            <span>Find Stores</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

        <div 
          onClick={() => onNavigate('assistant')}
          className="p-5 rounded-3xl bg-white border border-[#DDE8D2] hover:border-[#173B2B] transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F7F9F4] group-hover:bg-[#173B2B] text-[#173B2B] group-hover:text-white flex items-center justify-center transition-colors mb-3">
            <Bot size={20} />
          </div>
          <h4 className="font-bold text-sm text-[#17231D]">Voice Health Assistant</h4>
          <p className="text-xs text-[#69736D] mt-1 leading-relaxed">
            Speak or type queries for multilingual dosage instructions and side-effect advice.
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#173B2B] mt-3">
            <span>Ask Assistant</span>
            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>

      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 3: MEDICINE AVAILABILITY (FEATURED / RECENT MEDICINES) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#DDE8D2]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#6B9B63] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#69736D]">Live Verified Catalog</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D]">
              Medicine Availability
            </h2>
            <p className="text-xs text-[#69736D]">
              Featured medicines and frequently inquired prescriptions with real-time chemist inventory.
            </p>
          </div>

          {/* Category Chips & View All Link */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[calc(100vw-180px)] sm:max-w-none py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategoryFilter === cat
                      ? 'bg-[#173B2B] text-white shadow-2xs'
                      : 'bg-white text-[#17231D] hover:bg-[#DDE8D2] border border-[#DDE8D2]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('medicines')}
              className="px-3.5 py-1.5 rounded-xl bg-[#173B2B] text-white text-xs font-bold hover:bg-[#173B2B]/90 transition-all flex items-center gap-1 shrink-0 ml-auto sm:ml-0"
            >
              <span className="hidden xs:inline sm:inline">View Full Directory</span>
              <span className="xs:hidden sm:hidden">View All</span>
              <ChevronRight size={14} className="text-[#DDE8D2]" />
            </button>
          </div>
        </div>

        {/* Medicines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.slice(0, 6).map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              onViewDetails={onViewMedicineDetails}
              onFindNearby={onFindNearby}
              onAskAI={onAskAI}
              onSetReminder={onSetReminder}
            />
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 4: NEARBY PHARMACIES (MAP + PHARMACY CARDS) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#DDE8D2]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#69736D]">Geo-Location Network</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D]">
              Nearby Pharmacies
            </h2>
            <p className="text-xs text-[#69736D]">
              Live map view and verified local chemist locations with operating hours and contact lines.
            </p>
          </div>

          <button
            onClick={() => onNavigate('pharmacies')}
            className="px-3.5 py-1.5 rounded-xl bg-[#173B2B] text-white text-xs font-bold hover:bg-[#173B2B]/90 transition-all flex items-center gap-1 shrink-0"
          >
            <span>Open Interactive Map</span>
            <ChevronRight size={14} className="text-[#DDE8D2]" />
          </button>
        </div>

        {/* Map + Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Pharmacy Cards Column (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5 order-2 lg:order-1">
            {pharmacies.slice(0, 3).map((pharmacy) => (
              <PharmacyCard
                key={pharmacy.id}
                pharmacy={pharmacy}
                isSelected={selectedHomePharmacy?.id === pharmacy.id}
                onSelect={(p) => setSelectedHomePharmacy(p)}
                onGetDirections={(p) => onNavigate('pharmacies', { selectedPharmacyId: p.id })}
              />
            ))}
          </div>

          {/* Interactive Map Preview (7 cols) */}
          <div className="lg:col-span-7 h-[360px] sm:h-[420px] rounded-3xl overflow-hidden border border-[#DDE8D2] shadow-xs order-1 lg:order-2 relative">
            <PharmacyMap
              pharmacies={pharmacies}
              selectedPharmacy={selectedHomePharmacy}
              onSelectPharmacy={(p) => setSelectedHomePharmacy(p)}
            />
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 5: YOUR HEALTH ASSISTANT (AI CHAT) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Description & Prompt Starters (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold">
              <Bot size={14} className="text-[#6B9B63]" />
              <span>AI Health & Drug Assistant</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D]">
                Your Health Assistant
              </h2>
              <p className="text-xs sm:text-sm text-[#69736D] mt-1.5 leading-relaxed">
                Have questions about generic alternatives, side effects, or drug interactions? Ask our Gemini-powered health assistant for clear, plain-language answers.
              </p>
            </div>

            {/* Quick Prompt Starters */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#69736D]">Common Inquiries:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Can I take Paracetamol with Ibuprofen?',
                  'What are the side effects of Azithromycin?',
                  'How does Metformin control blood sugar?',
                  'What is an affordable generic for Augmentin?'
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onNavigate('assistant', { initialMessage: prompt })}
                    className="text-xs bg-[#F7F9F4] hover:bg-[#DDE8D2] text-[#17231D] px-3 py-1.5 rounded-xl border border-[#DDE8D2] transition-colors text-left font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('assistant')}
                className="px-5 py-3 rounded-xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2"
              >
                <Bot size={16} className="text-[#DDE8D2]" />
                <span>Start AI Consultation</span>
              </button>
            </div>
          </div>

          {/* Right Simulated Interactive Chat Box (6 cols) */}
          <div className="lg:col-span-6 bg-[#F7F9F4] rounded-2xl border border-[#DDE8D2] p-5 flex flex-col justify-between space-y-4">
            
            {/* Sample Message Bubbles */}
            <div className="space-y-3">
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#173B2B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  AI
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-[#DDE8D2] text-xs text-[#17231D] leading-relaxed shadow-2xs">
                  Hello! I'm your MediFind healthcare assistant. Ask me anything regarding prescription indications, precautions, or pharmacy locations.
                </div>
              </div>

              <div className="flex gap-2.5 flex-row-reverse">
                <div className="w-8 h-8 rounded-xl bg-[#6B9B63] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="bg-[#DDE8D2] p-3 rounded-2xl rounded-tr-none text-xs text-[#173B2B] font-semibold leading-relaxed">
                  Is Cetirizine 10mg safe to take before driving?
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#173B2B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  AI
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-[#DDE8D2] text-xs text-[#17231D] leading-relaxed shadow-2xs">
                  Cetirizine is a second-generation antihistamine with low sedation, but it can still cause mild drowsiness in some individuals. It is best to avoid driving until you know how it affects you.
                </div>
              </div>
            </div>

            {/* Quick Ask Box */}
            <form onSubmit={handleQuickAiSubmit} className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#DDE8D2]">
              <input
                type="text"
                value={quickAiPrompt}
                onChange={(e) => setQuickAiPrompt(e.target.value)}
                placeholder="Type your medical or dosage question..."
                className="flex-1 bg-transparent border-none text-xs text-[#17231D] focus:outline-none px-2.5 placeholder:text-[#69736D]"
              />
              <button 
                type="submit"
                className="w-8 h-8 bg-[#173B2B] hover:bg-[#173B2B]/90 text-white rounded-lg flex items-center justify-center shrink-0 transition-colors"
              >
                <Send size={13} className="text-[#DDE8D2]" />
              </button>
            </form>

          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SECTION 6: MEDICATION REMINDERS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDE8D2] mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-[#6B9B63]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#69736D]">Daily Schedule & Adherence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D]">
              Medication Reminders
            </h2>
            <p className="text-xs text-[#69736D]">
              Stay on track with personalized dosage schedules and sound alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('reminders')}
              className="px-4 py-2 rounded-xl bg-[#173B2B] text-white text-xs font-bold hover:bg-[#173B2B]/90 transition-all flex items-center gap-1.5"
            >
              <Plus size={14} className="text-[#DDE8D2]" />
              <span>Schedule Reminder</span>
            </button>
          </div>
        </div>

        {reminders.length === 0 ? (
          <div className="p-8 bg-[#F7F9F4] rounded-2xl text-center border border-[#DDE8D2]">
            <Clock size={28} className="text-[#69736D] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-[#17231D]">No Medication Reminders Scheduled</p>
            <p className="text-xs text-[#69736D] mt-0.5">
              Add your daily prescription times to receive timely notifications.
            </p>
            <button
              onClick={() => onNavigate('reminders')}
              className="mt-4 px-4 py-2 rounded-xl bg-[#173B2B] text-white text-xs font-bold"
            >
              Add First Reminder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  rem.last_taken 
                    ? 'bg-[#F7F9F4] border-[#DDE8D2] opacity-75' 
                    : 'bg-white border-[#DDE8D2] shadow-2xs hover:border-[#6B9B63]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    rem.last_taken 
                      ? 'bg-[#DDE8D2] border-[#DDE8D2] text-[#173B2B]' 
                      : 'bg-[#F7F9F4] border-[#DDE8D2] text-[#6B9B63]'
                  }`}>
                    {rem.last_taken ? <Check size={18} /> : <Pill size={18} />}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#17231D] truncate">
                      {rem.medicine_name}
                    </h4>
                    <p className="text-[11px] text-[#69736D] truncate">
                      {rem.dosage} • <span className="font-semibold text-[#173B2B]">{rem.time}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onToggleReminderTaken(rem.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    rem.last_taken 
                      ? 'bg-[#DDE8D2] text-[#173B2B]' 
                      : 'bg-[#173B2B] hover:bg-[#173B2B]/90 text-white shadow-2xs'
                  }`}
                >
                  {rem.last_taken ? (
                    <>
                      <Check size={12} />
                      <span>Taken</span>
                    </>
                  ) : (
                    <span>Mark Taken</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
