import React, { useState } from 'react';
import { 
  Pill, 
  MapPin, 
  FileText, 
  Bot, 
  Home, 
  User as UserIcon, 
  Bell, 
  History, 
  Layers, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  ShieldCheck,
  ChevronDown,
  Settings,
  ShieldAlert,
  FileHeart,
  Globe,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { CurrencyModal } from './CurrencyModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenReminders: () => void;
  onOpenSearchHistory: () => void;
  onLogout: () => void;
  onSwitchRole?: (role: 'user' | 'pharmacist' | 'admin') => void;
  remindersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenReminders,
  onOpenSearchHistory,
  onLogout,
  onSwitchRole,
  remindersCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);

  const { currencyConfig, detectedCountry, isAutoDetected } = useCurrency();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'interactions', label: 'Interaction Checker', icon: ShieldAlert },
    { id: 'passport', label: 'Health Passport', icon: FileHeart },
    { id: 'pharmacies', label: 'Pharmacies', icon: MapPin },
    { id: 'prescription', label: 'Scan Rx', icon: FileText },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#DDE8D2]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#173B2B] flex items-center justify-center text-[#F7F9F4] shadow-sm transition-transform group-hover:scale-105">
              <div className="relative">
                <Pill className="w-5 h-5 text-[#DDE8D2]" />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#6B9B63] rounded-full border-2 border-[#173B2B]"></span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-heading text-[#173B2B] tracking-tight">MediFind</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[#DDE8D2] text-[#173B2B] uppercase tracking-wider">AI</span>
              </div>
              <p className="text-[11px] text-[#69736D] -mt-0.5 hidden sm:block">Find medicine. Understand health.</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#173B2B] text-[#FFFFFF] shadow-xs'
                      : 'text-[#17231D] hover:bg-[#F7F9F4] hover:text-[#173B2B]'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-[#DDE8D2]' : 'text-[#69736D]'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Auto-Location Currency Pill */}
            <button
              id="btn-currency-selector"
              onClick={() => setCurrencyModalOpen(true)}
              title={`Location: ${detectedCountry} • Currency: ${currencyConfig.code} (${currencyConfig.symbol}) • Click to adjust`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#DDE8D2] hover:border-[#6B9B63] bg-[#F7F9F4] hover:bg-[#DDE8D2]/60 text-xs font-semibold text-[#173B2B] transition-all"
            >
              <span className="text-sm">{currencyConfig.flag}</span>
              <span className="font-bold">{currencyConfig.code}</span>
              <span className="text-[#69736D] text-[11px] font-mono">({currencyConfig.symbol})</span>
              {isAutoDetected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B9B63] animate-pulse" title="Auto-identified from location" />
              )}
            </button>

            {/* Quick Reminder Bell */}
            <button
              id="btn-quick-reminders"
              onClick={onOpenReminders}
              title="View Reminders"
              className="relative p-2.5 text-[#17231D] hover:bg-[#F7F9F4] rounded-xl transition-colors"
            >
              <Bell size={19} className="text-[#173B2B]" />
              {remindersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#6B9B63] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {remindersCount}
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-[#DDE8D2] hover:border-[#6B9B63] bg-[#FFFFFF] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#173B2B] text-white flex items-center justify-center text-xs font-bold uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-[#17231D] truncate max-w-[110px] leading-tight">
                      {currentUser.name}
                    </p>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6B9B63]">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-[#69736D]" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    id="user-dropdown-card"
                    className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#DDE8D2] p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="p-3 border-b border-[#F7F9F4] mb-1">
                      <p className="text-sm font-bold text-[#17231D]">{currentUser.name}</p>
                      <p className="text-xs text-[#69736D] truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#DDE8D2] text-[#173B2B]">
                          <ShieldCheck size={12} />
                          {currentUser.role.toUpperCase()} MODE
                        </span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <button
                        id="nav-user-profile-link"
                        onClick={() => {
                          setActiveTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#173B2B] bg-[#F7F9F4] hover:bg-[#DDE8D2] rounded-xl transition-colors"
                      >
                        <UserIcon size={16} className="text-[#6B9B63]" />
                        <span>My Profile & Health Details</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('passport');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#173B2B] hover:bg-[#F7F9F4] rounded-xl transition-colors"
                      >
                        <FileHeart size={16} className="text-[#6B9B63]" />
                        <span>Emergency Health Passport</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('interactions');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#17231D] hover:bg-[#F7F9F4] rounded-xl transition-colors"
                      >
                        <ShieldAlert size={16} className="text-[#6B9B63]" />
                        <span>Drug Interaction Checker</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenReminders();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#17231D] hover:bg-[#F7F9F4] rounded-xl transition-colors"
                      >
                        <Bell size={16} className="text-[#6B9B63]" />
                        <span>My Reminders ({remindersCount})</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenSearchHistory();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#17231D] hover:bg-[#F7F9F4] rounded-xl transition-colors"
                      >
                        <History size={16} className="text-[#6B9B63]" />
                        <span>Search History</span>
                      </button>

                      <button
                        id="btn-nav-currency-menu"
                        onClick={() => {
                          setCurrencyModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-[#17231D] hover:bg-[#F7F9F4] rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Globe size={16} className="text-[#6B9B63]" />
                          <span>Currency & Pricing</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#DDE8D2] text-[#173B2B]">
                          {currencyConfig.flag} {currencyConfig.code}
                        </span>
                      </button>

                      {(currentUser.role === 'admin' || currentUser.role === 'pharmacist') && (
                        <button
                          onClick={() => {
                            setActiveTab('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#17231D] hover:bg-[#F7F9F4] rounded-xl transition-colors"
                        >
                          <Layers size={16} className="text-[#6B9B63]" />
                          <span>{currentUser.role === 'admin' ? 'Admin Console' : 'Pharmacy Inventory'}</span>
                        </button>
                      )}

                      {/* Demo Role Switcher for CSE Minor project evaluation */}
                      {onSwitchRole && (
                        <div className="pt-2 mt-2 border-t border-[#F7F9F4] px-3 py-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#69736D] mb-1.5">
                            Demo Role Switch
                          </p>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => { onSwitchRole('user'); setUserDropdownOpen(false); }}
                              className={`text-[11px] py-1 px-1.5 rounded-lg font-medium ${currentUser.role === 'user' ? 'bg-[#173B2B] text-white' : 'bg-[#F7F9F4] text-[#17231D]'}`}
                            >
                              Patient
                            </button>
                            <button
                              onClick={() => { onSwitchRole('pharmacist'); setUserDropdownOpen(false); }}
                              className={`text-[11px] py-1 px-1.5 rounded-lg font-medium ${currentUser.role === 'pharmacist' ? 'bg-[#173B2B] text-white' : 'bg-[#F7F9F4] text-[#17231D]'}`}
                            >
                              Chemist
                            </button>
                            <button
                              onClick={() => { onSwitchRole('admin'); setUserDropdownOpen(false); }}
                              className={`text-[11px] py-1 px-1.5 rounded-lg font-medium ${currentUser.role === 'admin' ? 'bg-[#173B2B] text-white' : 'bg-[#F7F9F4] text-[#17231D]'}`}
                            >
                              Admin
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pt-1 mt-1 border-t border-[#F7F9F4]">
                        <button
                          id="btn-logout"
                          onClick={() => {
                            onLogout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#D95C5C] hover:bg-[#FDF0F0] rounded-xl transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-nav-login"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#173B2B] text-[#FFFFFF] text-sm font-medium hover:bg-[#173B2B]/90 transition-all shadow-xs"
              >
                <LogIn size={15} className="text-[#DDE8D2]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#173B2B] hover:bg-[#F7F9F4] rounded-xl"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFFFF] border-b border-[#DDE8D2] px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-[#173B2B] text-white'
                    : 'text-[#17231D] hover:bg-[#F7F9F4]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#DDE8D2]' : 'text-[#69736D]'} />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <button
            onClick={() => {
              setActiveTab('admin');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#17231D] hover:bg-[#F7F9F4]"
          >
            <Layers size={18} className="text-[#69736D]" />
            <span>Pharmacy & Admin Dashboard</span>
          </button>

          <button
            onClick={() => {
              setCurrencyModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-[#17231D] hover:bg-[#F7F9F4]"
          >
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-[#6B9B63]" />
              <span>Currency & Regional Pricing</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#DDE8D2] text-[#173B2B]">
              {currencyConfig.flag} {currencyConfig.code} ({currencyConfig.symbol})
            </span>
          </button>
        </div>
      )}

      {/* Currency Selection Modal */}
      <CurrencyModal
        isOpen={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar as requested in Design Doc */}
      <nav 
        id="mobile-bottom-nav" 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF]/98 backdrop-blur-md border-t border-[#DDE8D2] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(23,59,43,0.08)] pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]"
      >
        <button
          id="mobile-nav-home"
          onClick={() => setActiveTab('home')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'home' 
              ? 'bg-[#DDE8D2]/70 text-[#173B2B] font-bold shadow-2xs' 
              : 'text-[#69736D] hover:text-[#173B2B]'
          }`}
        >
          <Home size={19} className={activeTab === 'home' ? 'text-[#173B2B] stroke-[2.5]' : 'stroke-[1.75]'} />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
        </button>

        <button
          id="mobile-nav-medicines"
          onClick={() => setActiveTab('medicines')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'medicines' 
              ? 'bg-[#DDE8D2]/70 text-[#173B2B] font-bold shadow-2xs' 
              : 'text-[#69736D] hover:text-[#173B2B]'
          }`}
        >
          <Pill size={19} className={activeTab === 'medicines' ? 'text-[#173B2B] stroke-[2.5]' : 'stroke-[1.75]'} />
          <span className="text-[10px] mt-0.5 tracking-tight">Medicines</span>
        </button>

        <button
          id="mobile-nav-scan"
          onClick={() => setActiveTab('prescription')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'prescription' 
              ? 'bg-[#173B2B] text-white font-bold shadow-xs' 
              : 'text-[#69736D] hover:text-[#173B2B]'
          }`}
        >
          <FileText size={19} className={activeTab === 'prescription' ? 'text-[#DDE8D2] stroke-[2.5]' : 'stroke-[1.75]'} />
          <span className="text-[10px] mt-0.5 tracking-tight">Scan</span>
        </button>

        <button
          id="mobile-nav-ai"
          onClick={() => setActiveTab('assistant')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'assistant' 
              ? 'bg-[#DDE8D2]/70 text-[#173B2B] font-bold shadow-2xs' 
              : 'text-[#69736D] hover:text-[#173B2B]'
          }`}
        >
          <Bot size={19} className={activeTab === 'assistant' ? 'text-[#173B2B] stroke-[2.5]' : 'stroke-[1.75]'} />
          <span className="text-[10px] mt-0.5 tracking-tight">AI</span>
        </button>

        <button
          id="mobile-nav-profile"
          onClick={() => {
            if (currentUser) {
              setActiveTab('profile');
            } else {
              onOpenAuth();
            }
          }}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
            activeTab === 'profile' 
              ? 'bg-[#DDE8D2]/70 text-[#173B2B] font-bold shadow-2xs' 
              : 'text-[#69736D] hover:text-[#173B2B]'
          }`}
        >
          <UserIcon size={19} className={activeTab === 'profile' ? 'text-[#173B2B] stroke-[2.5]' : 'stroke-[1.75]'} />
          <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
        </button>
      </nav>
    </header>
  );
};
