import React from 'react';
import { Pill, Heart, ShieldAlert, GraduationCap, MapPin, Sparkles } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#173B2B] text-white border-t border-[#173B2B]/80 mt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#6B9B63] flex items-center justify-center text-white">
                <Pill size={17} />
              </div>
              <span className="text-xl font-bold font-heading tracking-tight text-white">MediFind AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#DDE8D2] text-[#173B2B]">
                CSE MINOR PROJECT
              </span>
            </div>

            <p className="text-xs text-[#DDE8D2] max-w-sm leading-relaxed">
              Find your medicine. Understand your health. A unified digital healthcare assistant for discovering real-time medicine availability, scanning prescriptions via OCR, and navigating verified pharmacies.
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-white/70">
              <GraduationCap size={15} className="text-[#6B9B63]" />
              <span>Computer Science & Engineering Minor Project • 2026</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#DDE8D2] mb-3">
              Application Modules
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>
                <button onClick={() => onNavigate('medicines')} className="hover:text-[#DDE8D2] transition-colors">
                  Medicine Catalog Search
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pharmacies')} className="hover:text-[#DDE8D2] transition-colors">
                  Interactive Pharmacy Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('prescription')} className="hover:text-[#DDE8D2] transition-colors">
                  Prescription OCR Scanner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('assistant')} className="hover:text-[#DDE8D2] transition-colors">
                  AI Health Assistant
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-[#DDE8D2] transition-colors">
                  Chemist Inventory Console
                </button>
              </li>
            </ul>
          </div>

          {/* Safety & Emergency Contacts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#DDE8D2] mb-3">
              Medical Safety & Helplines
            </h4>
            <div className="p-3 rounded-2xl bg-white/10 text-[11px] text-white/90 space-y-1.5 border border-white/10">
              <p className="font-bold text-[#DDE8D2]">Emergency Medical Helplines:</p>
              <p>🚑 National Ambulance: <strong>108 / 112</strong></p>
              <p>📞 Poison Control / Health Info: <strong>1075</strong></p>
              <p className="text-[10px] text-white/70 pt-1 border-t border-white/10">
                In acute life-threatening situations, contact emergency services immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} MediFind AI. Designed and built for academic and healthcare educational demonstration.
          </p>
          <p className="text-[11px]">
            Strictly Educational • Not a substitute for licensed medical advice
          </p>
        </div>
      </div>
    </footer>
  );
};
