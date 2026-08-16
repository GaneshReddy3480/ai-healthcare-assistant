import React from 'react';
import { X, History, Trash2, Search, ArrowUpRight } from 'lucide-react';
import { SearchQueryLog } from '../types';

interface SearchHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SearchQueryLog[];
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
}

export const SearchHistoryModal: React.FC<SearchHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectQuery,
  onClearHistory
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17231D]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] w-full max-w-md rounded-3xl shadow-2xl border border-[#DDE8D2] p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-[#DDE8D2] mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#6B9B63]" />
            <h3 className="text-base font-bold font-heading text-[#17231D]">Recent Search History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F7F9F4] text-[#69736D]"
          >
            <X size={18} />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#69736D]">
            No recent search history found.
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectQuery(item.query);
                  onClose();
                }}
                className="p-3 rounded-2xl bg-[#F7F9F4] hover:bg-[#DDE8D2]/50 border border-[#DDE8D2] flex items-center justify-between cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Search size={14} className="text-[#69736D] group-hover:text-[#173B2B]" />
                  <div>
                    <span className="text-xs font-bold text-[#17231D]">{item.query}</span>
                    <p className="text-[10px] text-[#69736D]">{item.results_count} medicines found • {item.timestamp}</p>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-[#69736D] group-hover:text-[#173B2B]" />
              </div>
            ))}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#DDE8D2] flex justify-end">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#D95C5C] hover:bg-[#FDF0F0] transition-colors"
            >
              <Trash2 size={13} />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
