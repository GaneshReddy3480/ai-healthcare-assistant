import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Info, 
  Sparkles, 
  HelpCircle, 
  Pill,
  ArrowRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { Medicine, DrugInteraction } from '../types';
import { api } from '../services/api';

interface DrugInteractionCheckerViewProps {
  medicines: Medicine[];
  onNavigateToMedicine?: (medicine: Medicine) => void;
  onAskAI?: (prompt: string) => void;
}

export const DrugInteractionCheckerView: React.FC<DrugInteractionCheckerViewProps> = ({
  medicines,
  onNavigateToMedicine,
  onAskAI
}) => {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(['Paracetamol 500mg', 'Cetirizine 10mg']);
  const [customDrugInput, setCustomDrugInput] = useState('');
  const [interactions, setInteractions] = useState<DrugInteraction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Popular presets
  const presetCombinations = [
    { title: 'Pain & Allergy', drugs: ['Paracetamol 500mg', 'Cetirizine 10mg'] },
    { title: 'Antibiotic & Alcohol Warning', drugs: ['Azithromycin 500mg', 'Alcohol'] },
    { title: 'Diabetes & Alcohol Caution', drugs: ['Metformin 500mg SR', 'Alcohol'] },
    { title: 'Dual Acid / Heart Regimen', drugs: ['Pantoprazole 40mg', 'Atorvastatin 20mg'] },
    { title: 'Asthma & Beta Blocker Contradiction', drugs: ['Salbutamol Inhaler', 'Propranolol / Atenolol'] },
    { title: 'Antibiotic & Antacid Chelation', drugs: ['Azithromycin 500mg', 'Antacids (Aluminum / Magnesium)'] }
  ];

  const handleRunCheck = async (drugsToCheck = selectedDrugs) => {
    if (drugsToCheck.length < 2) return;
    setIsAnalyzing(true);
    try {
      const results = await api.checkDrugInteractions(drugsToCheck);
      setInteractions(results);
    } catch (e) {
      console.error('Error checking interactions:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    handleRunCheck(selectedDrugs);
  }, [selectedDrugs]);

  const handleAddDrug = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && !selectedDrugs.includes(trimmed)) {
      const updated = [...selectedDrugs, trimmed];
      setSelectedDrugs(updated);
      setCustomDrugInput('');
    }
  };

  const handleRemoveDrug = (name: string) => {
    if (selectedDrugs.length <= 2) {
      // allow minimum 0 but warn
    }
    const updated = selectedDrugs.filter(d => d !== name);
    setSelectedDrugs(updated);
  };

  const severeCount = interactions.filter(i => i.severity === 'Severe').length;
  const moderateCount = interactions.filter(i => i.severity === 'Moderate').length;
  const safeCount = interactions.filter(i => i.severity === 'Safe / No Interaction' || i.severity === 'Mild').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold">
            <ShieldAlert size={14} className="text-[#E7A23B]" />
            <span>Clinical Pharmacology Matrix • Multi-Drug Safety</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-heading text-[#17231D]">
            Multi-Medicine Interaction Checker
          </h1>
          <p className="text-sm text-[#69736D] leading-relaxed">
            Check prescription medicines, OTC drugs, food, and substances for adverse pharmacokinetic interactions, metabolic competition, and safety warnings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Drug Selector & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Drugs in Stack */}
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#17231D] flex items-center gap-2">
                <Pill size={18} className="text-[#6B9B63]" />
                <span>Selected Medications ({selectedDrugs.length})</span>
              </h3>
              {selectedDrugs.length > 0 && (
                <button
                  onClick={() => setSelectedDrugs([])}
                  className="text-xs text-[#69736D] hover:text-[#D95C5C] font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAddDrug(customDrugInput);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customDrugInput}
                  onChange={(e) => setCustomDrugInput(e.target.value)}
                  placeholder="Add medicine (e.g. Ibuprofen, Warfarin)..."
                  className="w-full h-11 pl-4 pr-4 bg-[#F7F9F4] border border-[#DDE8D2] rounded-xl text-xs sm:text-sm text-[#17231D] placeholder:text-[#69736D] focus:outline-none focus:ring-1 focus:ring-[#173B2B]"
                />
              </div>
              <button
                type="submit"
                disabled={!customDrugInput.trim()}
                className="px-4 h-11 bg-[#173B2B] hover:bg-[#173B2B]/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </form>

            {/* Selected Pills */}
            <div className="space-y-2 pt-2">
              {selectedDrugs.length === 0 ? (
                <div className="p-6 text-center bg-[#F7F9F4] rounded-2xl border border-[#DDE8D2]">
                  <p className="text-xs text-[#69736D]">
                    Select at least 2 medications or common substances below to verify interaction safety.
                  </p>
                </div>
              ) : (
                selectedDrugs.map((drug) => (
                  <div 
                    key={drug}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2]"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-[#17231D] truncate">
                      {drug}
                    </span>
                    <button
                      onClick={() => handleRemoveDrug(drug)}
                      className="p-1 rounded-lg text-[#69736D] hover:text-[#D95C5C] hover:bg-white transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Medicine Catalog Add */}
            <div className="pt-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#69736D] block mb-2">
                Quick-Add From Catalog:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {medicines.map((m) => {
                  const isAdded = selectedDrugs.includes(m.name);
                  return (
                    <button
                      key={m.id}
                      onClick={() => isAdded ? handleRemoveDrug(m.name) : handleAddDrug(m.name)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isAdded 
                          ? 'bg-[#173B2B] text-white border-[#173B2B]' 
                          : 'bg-white text-[#17231D] border-[#DDE8D2] hover:bg-[#DDE8D2]'
                      }`}
                    >
                      {isAdded ? '✓ ' : '+ '}{m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Clinical Presets */}
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#69736D]">
              Clinical Test Scenarios:
            </h4>
            <div className="space-y-2">
              {presetCombinations.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDrugs(preset.drugs)}
                  className="w-full text-left p-3 rounded-xl bg-[#F7F9F4] hover:bg-[#DDE8D2] border border-[#DDE8D2] transition-colors"
                >
                  <div className="font-bold text-xs text-[#17231D]">{preset.title}</div>
                  <div className="text-[11px] text-[#69736D] mt-0.5 truncate">
                    {preset.drugs.join(' + ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Interaction Matrix Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Summary Status Strip */}
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold font-heading text-[#17231D]">
                Safety Assessment Summary
              </h3>
              <p className="text-xs text-[#69736D] mt-0.5">
                Evaluated against verified pharmacology monographs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {severeCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-[#FFF0F0] text-[#D95C5C] font-bold text-xs border border-[#D95C5C]/30 flex items-center gap-1">
                  <AlertTriangle size={13} />
                  {severeCount} Severe
                </span>
              )}
              {moderateCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-[#FFFBF0] text-[#E7A23B] font-bold text-xs border border-[#E7A23B]/30 flex items-center gap-1">
                  <AlertTriangle size={13} />
                  {moderateCount} Moderate
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-[#EBF3E8] text-[#173B2B] font-bold text-xs border border-[#6B9B63]/30 flex items-center gap-1">
                <CheckCircle2 size={13} className="text-[#6B9B63]" />
                {safeCount} Safe / Negligible
              </span>
            </div>
          </div>

          {/* Interaction Cards */}
          {selectedDrugs.length < 2 ? (
            <div className="bg-white rounded-3xl border border-[#DDE8D2] p-10 text-center space-y-3">
              <ShieldAlert size={36} className="text-[#69736D] mx-auto opacity-50" />
              <h4 className="font-bold text-base text-[#17231D]">Select 2 or More Medications</h4>
              <p className="text-xs text-[#69736D] max-w-sm mx-auto">
                Add medications on the left to compute pairwise biochemical interactions and warnings.
              </p>
            </div>
          ) : isAnalyzing ? (
            <div className="bg-white rounded-3xl border border-[#DDE8D2] p-10 text-center space-y-3">
              <RefreshCw size={28} className="text-[#6B9B63] mx-auto animate-spin" />
              <p className="text-xs font-semibold text-[#17231D]">Cross-referencing drug database...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interactions.map((interaction) => {
                const isSevere = interaction.severity === 'Severe';
                const isModerate = interaction.severity === 'Moderate';
                const isSafe = interaction.severity === 'Safe / No Interaction' || interaction.severity === 'Mild';

                return (
                  <div
                    key={interaction.id}
                    className={`p-6 rounded-3xl border transition-all ${
                      isSevere 
                        ? 'bg-[#FFF9F9] border-[#D95C5C]/40 shadow-xs' 
                        : isModerate 
                        ? 'bg-[#FFFDF5] border-[#E7A23B]/40 shadow-xs'
                        : 'bg-white border-[#DDE8D2] shadow-2xs'
                    }`}
                  >
                    {/* Header: Drugs + Severity Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#DDE8D2]/60">
                      <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-[#17231D]">
                        <span>{interaction.drug_a}</span>
                        <span className="text-[#69736D] font-normal">↔</span>
                        <span>{interaction.drug_b}</span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        isSevere 
                          ? 'bg-[#D95C5C] text-white' 
                          : isModerate 
                          ? 'bg-[#E7A23B] text-[#17231D]' 
                          : 'bg-[#DDE8D2] text-[#173B2B]'
                      }`}>
                        {isSevere || isModerate ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                        {interaction.severity}
                      </span>
                    </div>

                    {/* Effect description */}
                    <div className="mt-3 space-y-2.5">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#69736D] block">
                          Clinical Effect:
                        </span>
                        <p className={`text-xs sm:text-sm font-semibold mt-0.5 ${
                          isSevere ? 'text-[#D95C5C]' : isModerate ? 'text-[#B87A1E]' : 'text-[#17231D]'
                        }`}>
                          {interaction.effect}
                        </p>
                      </div>

                      {interaction.mechanism && (
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#69736D] block">
                            Mechanism / Physiology:
                          </span>
                          <p className="text-xs text-[#69736D] mt-0.5 leading-relaxed">
                            {interaction.mechanism}
                          </p>
                        </div>
                      )}

                      <div className="p-3 rounded-2xl bg-white/80 border border-[#DDE8D2]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#173B2B] block mb-1">
                          Pharmacist Recommendation:
                        </span>
                        <p className="text-xs text-[#17231D] font-medium leading-relaxed">
                          {interaction.recommendation}
                        </p>
                      </div>

                      {onAskAI && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => onAskAI(`Explain the clinical interaction between ${interaction.drug_a} and ${interaction.drug_b} in detail.`)}
                            className="text-xs font-bold text-[#173B2B] hover:underline flex items-center gap-1"
                          >
                            <Sparkles size={13} className="text-[#6B9B63]" />
                            <span>Ask AI Assistant for detailed precautions</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
