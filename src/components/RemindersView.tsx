import React, { useState } from 'react';
import { 
  Bell, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  Pill, 
  X, 
  Check,
  Sparkles
} from 'lucide-react';
import { Reminder } from '../types';

interface RemindersViewProps {
  reminders: Reminder[];
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at'>) => void;
  onToggleTaken: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onClose?: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onAddReminder,
  onToggleTaken,
  onDeleteReminder,
  onClose
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    medicine_name: '',
    dosage: '1 Tablet',
    time: '08:00 AM',
    frequency: 'Daily',
    days_of_week: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicine_name.trim()) return;

    onAddReminder({
      medicine_name: formData.medicine_name,
      dosage: formData.dosage,
      time: formData.time,
      frequency: formData.frequency,
      days_of_week: formData.days_of_week,
      start_date: formData.start_date,
      end_date: formData.end_date || undefined,
      notes: formData.notes || undefined,
      is_active: true
    });

    setShowAddModal(false);
    setFormData({
      medicine_name: '',
      dosage: '1 Tablet',
      time: '08:00 AM',
      frequency: 'Daily',
      days_of_week: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: ''
    });
  };

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#DDE8D2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8D2] text-[#173B2B] text-xs font-bold mb-2">
            <Bell size={14} className="text-[#6B9B63]" />
            <span>Medication Adherence Tracker</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#17231D]">
            Daily Medicine Reminders
          </h2>
          <p className="text-xs sm:text-sm text-[#69736D] mt-1">
            Today is <strong className="text-[#173B2B]">{todayStr}</strong>. Track your doses and maintain healthy consistency.
          </p>
        </div>

        <button
          id="btn-add-new-reminder"
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-center flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs font-bold transition-all shadow-xs"
        >
          <Plus size={16} className="text-[#DDE8D2]" />
          <span>New Reminder</span>
        </button>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF] rounded-3xl border border-[#DDE8D2] p-8">
          <div className="w-16 h-16 rounded-2xl bg-[#DDE8D2] text-[#173B2B] flex items-center justify-center mx-auto mb-4">
            <Bell size={28} />
          </div>
          <h3 className="text-lg font-bold font-heading text-[#17231D] mb-1">No Active Reminders</h3>
          <p className="text-xs text-[#69736D] max-w-sm mx-auto mb-5">
            Add your daily medications or scan a prescription to automatically generate reminder schedules.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#173B2B] text-white text-xs font-bold"
          >
            Create Your First Reminder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => {
            const isTakenToday = !!rem.last_taken;

            return (
              <div
                key={rem.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isTakenToday
                    ? 'bg-[#F7F9F4] border-[#DDE8D2] opacity-85'
                    : 'bg-[#FFFFFF] border-[#DDE8D2] hover:border-[#6B9B63] shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isTakenToday ? 'bg-[#DDE8D2] text-[#173B2B]' : 'bg-[#173B2B] text-white'
                    }`}>
                      <Pill size={18} />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#17231D] leading-tight">
                        {rem.medicine_name}
                      </h4>
                      <p className="text-xs text-[#69736D] mt-0.5">
                        {rem.dosage} • {rem.frequency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#F7F9F4] px-3 py-1 rounded-xl border border-[#DDE8D2]">
                    <Clock size={13} className="text-[#173B2B]" />
                    <span className="text-xs font-bold text-[#173B2B]">{rem.time}</span>
                  </div>
                </div>

                {rem.notes && (
                  <p className="text-xs text-[#69736D] bg-[#F7F9F4] p-3 rounded-xl mb-4 italic">
                    "{rem.notes}"
                  </p>
                )}

                {/* Footer action row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#F7F9F4]">
                  <button
                    onClick={() => onToggleTaken(rem.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isTakenToday
                        ? 'bg-[#DDE8D2] text-[#173B2B]'
                        : 'bg-[#173B2B] text-white hover:bg-[#173B2B]/90 shadow-2xs'
                    }`}
                  >
                    <CheckCircle2 size={15} />
                    <span>{isTakenToday ? `Taken at ${rem.last_taken}` : 'Mark as Taken Today'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteReminder(rem.id)}
                    className="p-2 text-[#69736D] hover:text-[#D95C5C] hover:bg-[#FDF0F0] rounded-xl transition-colors"
                    title="Delete reminder"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17231D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-md rounded-3xl shadow-2xl border border-[#DDE8D2] p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE8D2] mb-4">
              <h3 className="text-lg font-bold font-heading text-[#17231D] flex items-center gap-2">
                <Bell size={18} className="text-[#6B9B63]" />
                Add Medication Reminder
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full hover:bg-[#F7F9F4] text-[#69736D]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#17231D] block mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol 500mg"
                  value={formData.medicine_name}
                  onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-sm text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#17231D] block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#17231D] block mb-1">Reminder Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#17231D] block mb-1">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                >
                  <option value="Daily">Daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As needed (SOS)">As needed (SOS)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#17231D] block mb-1">Instructions / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Take after breakfast with a full glass of water"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DDE8D2]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#69736D] hover:bg-[#F7F9F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#173B2B] text-white text-xs font-bold shadow-xs"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
