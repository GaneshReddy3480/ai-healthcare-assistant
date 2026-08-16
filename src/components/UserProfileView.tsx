import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Clock, 
  History, 
  Settings, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Search, 
  Heart, 
  ShieldAlert, 
  Bell, 
  Volume2, 
  MapPin, 
  Bot, 
  Calendar, 
  ArrowRight, 
  Plus, 
  X,
  PhoneCall,
  Globe,
  Coins,
  Compass
} from 'lucide-react';
import { User as UserType, UserSettings, SearchQueryLog } from '../types';
import { api } from '../services/api';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';

interface UserProfileViewProps {
  currentUser: UserType | null;
  onUpdateUser: (updated: UserType) => void;
  onNavigateToSearch: (query: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onNavigateToSearch,
  onShowToast
}) => {
  const { 
    currency, 
    currencyConfig, 
    detectionMethod, 
    detectedCountry, 
    setCurrency, 
    detectLocationViaGPS, 
    isDetectingGPS 
  } = useCurrency();
  // Navigation inside profile
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'settings' | 'history'>('profile');

  // Profile Form State
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Nikhil Vardhan',
    email: currentUser?.email || 'patient@medifind.ai',
    phone: currentUser?.phone || '+91 98765 43210',
    blood_group: currentUser?.blood_group || 'O+',
    allergies: currentUser?.allergies || ['Penicillin', 'Sulfa drugs'],
    emergency_contact_name: currentUser?.emergency_contact?.name || 'Dr. S. Sharma',
    emergency_contact_phone: currentUser?.emergency_contact?.phone || '+91 98111 22233',
    emergency_contact_relation: currentUser?.emergency_contact?.relation || 'Family Physician',
    address: currentUser?.address || 'H-14, Health Park Enclave, New Delhi, India',
    date_of_birth: currentUser?.date_of_birth || '2000-05-18'
  });

  const [newAllergyInput, setNewAllergyInput] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<UserSettings>({
    reminder_notifications: true,
    sound_alerts: true,
    distance_unit: 'km',
    auto_save_search_history: true,
    ai_detail_level: 'standard',
    emergency_sos_number: '108'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Search History State
  const [searchHistory, setSearchHistory] = useState<SearchQueryLog[]>([]);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load Settings & History on Mount
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSettings, loadedHistory] = await Promise.all([
          api.getUserSettings(),
          api.getSearchHistory()
        ]);
        setSettings(loadedSettings);
        setSearchHistory(loadedHistory);
      } catch (err) {
        console.error('Failed to load user profile data:', err);
      }
    }
    loadData();
  }, []);

  // Sync props if currentUser updates
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        blood_group: currentUser.blood_group || prev.blood_group,
        allergies: currentUser.allergies || prev.allergies,
        emergency_contact_name: currentUser.emergency_contact?.name || prev.emergency_contact_name,
        emergency_contact_phone: currentUser.emergency_contact?.phone || prev.emergency_contact_phone,
        emergency_contact_relation: currentUser.emergency_contact?.relation || prev.emergency_contact_relation,
        address: currentUser.address || prev.address,
        date_of_birth: currentUser.date_of_birth || prev.date_of_birth
      }));
    }
  }, [currentUser]);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const updatedUser: Partial<UserType> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        blood_group: formData.blood_group,
        allergies: formData.allergies,
        address: formData.address.trim(),
        date_of_birth: formData.date_of_birth,
        emergency_contact: {
          name: formData.emergency_contact_name.trim(),
          phone: formData.emergency_contact_phone.trim(),
          relation: formData.emergency_contact_relation.trim()
        }
      };

      const result = await api.updateUserProfile(updatedUser);
      onUpdateUser(result);
      onShowToast('Profile information updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      onShowToast('Failed to save profile changes.', 'warning');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Allergy Tag Management
  const handleAddAllergy = () => {
    const trimmed = newAllergyInput.trim();
    if (trimmed && !formData.allergies.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, trimmed]
      }));
      setNewAllergyInput('');
    }
  };

  const handleRemoveAllergy = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== tag)
    }));
  };

  // Settings Save
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const updated = await api.updateUserSettings(settings);
      setSettings(updated);
      onShowToast('Application settings saved successfully!', 'success');
    } catch (err) {
      console.error('Error saving settings:', err);
      onShowToast('Failed to save application settings.', 'warning');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Delete Individual Search History
  const handleDeleteHistoryItem = async (id: string) => {
    try {
      await api.deleteSearchHistoryItem(id);
      setSearchHistory(prev => prev.filter(item => item.id !== id));
      onShowToast('Search query removed from history.', 'info');
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  // Clear All History
  const handleClearAllHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire search history?')) {
      try {
        await api.clearSearchHistory();
        setSearchHistory([]);
        onShowToast('All search history cleared.', 'info');
      } catch (err) {
        console.error('Failed to clear search history:', err);
      }
    }
  };

  // Filtered History
  const filteredHistory = searchHistory.filter(item => 
    item.query.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(historySearchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* HEALIUM INSPIRED USER HERO CARD */}
      <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#DDE8D2]/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* User Identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#173B2B] text-white flex items-center justify-center text-2xl font-bold font-heading shadow-sm shrink-0">
              {formData.name.charAt(0)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#17231D]">
                  {formData.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DDE8D2] text-[#173B2B]">
                  <ShieldCheck size={13} className="text-[#6B9B63]" />
                  {currentUser?.role ? currentUser.role.toUpperCase() : 'PATIENT'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#69736D]">
                <span className="flex items-center gap-1">
                  <Mail size={13} />
                  {formData.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={13} />
                  {formData.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  Joined August 2026
                </span>
              </div>
            </div>
          </div>

          {/* Quick Health Summary Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#F7F9F4] border border-[#DDE8D2] px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736D] block">Blood Group</span>
              <span className="text-sm font-bold text-[#173B2B]">{formData.blood_group || 'O+'}</span>
            </div>

            <div className="bg-[#F7F9F4] border border-[#DDE8D2] px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736D] block">Allergies</span>
              <span className="text-sm font-bold text-[#173B2B]">{formData.allergies.length} Listed</span>
            </div>

            <div className="bg-[#F7F9F4] border border-[#DDE8D2] px-4 py-2.5 rounded-2xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#69736D] block">Emergency SOS</span>
              <span className="text-sm font-bold text-[#6B9B63]">{settings.emergency_sos_number}</span>
            </div>
          </div>

        </div>

        {/* PROFILE TAB SELECTOR */}
        <div className="mt-8 pt-4 border-t border-[#F7F9F4] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-profile-info"
            onClick={() => setActiveProfileTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeProfileTab === 'profile'
                ? 'bg-[#173B2B] text-white shadow-2xs'
                : 'bg-[#F7F9F4] text-[#69736D] hover:text-[#17231D] hover:bg-[#DDE8D2]/60'
            }`}
          >
            <User size={14} />
            <span>Personal & Health Profile</span>
          </button>

          <button
            id="tab-profile-settings"
            onClick={() => setActiveProfileTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeProfileTab === 'settings'
                ? 'bg-[#173B2B] text-white shadow-2xs'
                : 'bg-[#F7F9F4] text-[#69736D] hover:text-[#17231D] hover:bg-[#DDE8D2]/60'
            }`}
          >
            <Settings size={14} />
            <span>App & Notification Settings</span>
          </button>

          <button
            id="tab-profile-history"
            onClick={() => setActiveProfileTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeProfileTab === 'history'
                ? 'bg-[#173B2B] text-white shadow-2xs'
                : 'bg-[#F7F9F4] text-[#69736D] hover:text-[#17231D] hover:bg-[#DDE8D2]/60'
            }`}
          >
            <History size={14} />
            <span>Past Search History ({searchHistory.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PERSONAL & HEALTH PROFILE EDITING */}
      {activeProfileTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {/* Main Details Section */}
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F7F9F4] mb-6">
              <div>
                <h3 className="text-lg font-bold font-heading text-[#17231D]">Personal Identification</h3>
                <p className="text-xs text-[#69736D]">Manage your primary contact and identification credentials.</p>
              </div>
              <span className="text-xs text-[#69736D] italic">All fields sync securely with your account</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Full Legal Name <span className="text-[#D95C5C]">*</span>
                </label>
                <input
                  id="profile-input-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Email Address <span className="text-[#D95C5C]">*</span>
                </label>
                <input
                  id="profile-input-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Phone Number <span className="text-[#D95C5C]">*</span>
                </label>
                <input
                  id="profile-input-phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Date of Birth
                </label>
                <input
                  id="profile-input-dob"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                />
              </div>

              {/* Residential Address / City */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Primary Location / Delivery Address
                </label>
                <input
                  id="profile-input-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, locality, city, pincode"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                />
              </div>
            </div>
          </div>

          {/* Clinical & Emergency Profile */}
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F7F9F4] mb-6">
              <div>
                <h3 className="text-lg font-bold font-heading text-[#17231D] flex items-center gap-2">
                  <Heart size={18} className="text-[#6B9B63]" />
                  Clinical & Emergency Healthcare Details
                </h3>
                <p className="text-xs text-[#69736D]">Critical medical notes used for safety warnings and emergency response.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Blood Group */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Blood Group
                </label>
                <select
                  id="profile-select-blood"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                >
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                </select>
              </div>

              {/* Emergency Contact Name */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Emergency Contact Person
                </label>
                <input
                  id="profile-input-emergency-name"
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="e.g. Dr. Sharma or Spouse"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                />
              </div>

              {/* Emergency Contact Phone */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Emergency Contact Phone
                </label>
                <input
                  id="profile-input-emergency-phone"
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="+91 98111 22233"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs sm:text-sm text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                />
              </div>
            </div>

            {/* Known Drug & Food Allergies */}
            <div className="mt-6 pt-6 border-t border-[#F7F9F4]">
              <label className="block text-xs font-bold text-[#17231D] mb-2">
                Known Drug & Substance Allergies
              </label>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {formData.allergies.map((allergy) => (
                  <span
                    key={allergy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF2F2] text-[#D95C5C] border border-[#FCDADA]"
                  >
                    <ShieldAlert size={12} />
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="hover:text-red-800 p-0.5 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {formData.allergies.length === 0 && (
                  <span className="text-xs text-[#69736D] italic">No allergies registered.</span>
                )}
              </div>

              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newAllergyInput}
                  onChange={(e) => setNewAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAllergy();
                    }
                  }}
                  placeholder="Add allergy (e.g., Penicillin, Aspirin, NSAIDs)..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:ring-2 focus:ring-[#6B9B63]"
                />
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  className="px-3.5 py-2 rounded-xl bg-[#173B2B] text-white text-xs font-bold hover:bg-[#173B2B]/90 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="btn-save-profile"
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3.5 rounded-xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              {isSavingProfile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Profile Changes...</span>
                </>
              ) : (
                <>
                  <Save size={16} className="text-[#DDE8D2]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: APPLICATION & NOTIFICATION SETTINGS */}
      {activeProfileTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs">
            <div className="pb-4 border-b border-[#F7F9F4] mb-6">
              <h3 className="text-lg font-bold font-heading text-[#17231D] flex items-center gap-2">
                <Bell size={18} className="text-[#6B9B63]" />
                Medication & Adherence Alerts
              </h3>
              <p className="text-xs text-[#69736D]">Configure daily notifications and sound reminders.</p>
            </div>

            <div className="space-y-4">
              {/* Push Reminder Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2]">
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#17231D]">Medication Schedule Push Alerts</p>
                  <p className="text-xs text-[#69736D]">Receive on-time reminders for your prescribed dosages.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminder_notifications}
                    onChange={(e) => setSettings({ ...settings, reminder_notifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#173B2B]" />
                </label>
              </div>

              {/* Sound Alerts */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2]">
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#17231D] flex items-center gap-1.5">
                    <Volume2 size={15} className="text-[#6B9B63]" />
                    Sound Chimes for Reminders
                  </p>
                  <p className="text-xs text-[#69736D]">Play an audio cue when it is time to take your medicine.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sound_alerts}
                    onChange={(e) => setSettings({ ...settings, sound_alerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#173B2B]" />
                </label>
              </div>

              {/* Auto-save Search Queries */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2]">
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#17231D]">Auto-Save Search Queries</p>
                  <p className="text-xs text-[#69736D]">Keep a private local history of searched medicines and pharmacies.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_save_search_history}
                    onChange={(e) => setSettings({ ...settings, auto_save_search_history: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#173B2B]" />
                </label>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs">
            <div className="pb-4 border-b border-[#F7F9F4] mb-6">
              <h3 className="text-lg font-bold font-heading text-[#17231D] flex items-center gap-2">
                <MapPin size={18} className="text-[#6B9B63]" />
                Navigation & AI Preferences
              </h3>
              <p className="text-xs text-[#69736D]">Customize proximity calculations and healthcare AI assistant detail.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Distance Units */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Proximity Distance Unit
                </label>
                <select
                  value={settings.distance_unit}
                  onChange={(e) => setSettings({ ...settings, distance_unit: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none"
                >
                  <option value="km">Kilometers (km) - Default</option>
                  <option value="miles">Miles (mi)</option>
                </select>
              </div>

              {/* AI Detail Level */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  AI Assistant Response Style
                </label>
                <select
                  value={settings.ai_detail_level}
                  onChange={(e) => setSettings({ ...settings, ai_detail_level: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none"
                >
                  <option value="concise">Concise & Direct</option>
                  <option value="standard">Standard Healthcare Guidance</option>
                  <option value="detailed">Comprehensive Clinical Insights</option>
                </select>
              </div>

              {/* Emergency SOS Number */}
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1.5">
                  Emergency SOS Helpline
                </label>
                <select
                  value={settings.emergency_sos_number}
                  onChange={(e) => setSettings({ ...settings, emergency_sos_number: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none"
                >
                  <option value="108">108 (Emergency Ambulance - India)</option>
                  <option value="112">112 (National Emergency Number)</option>
                  <option value="911">911 (US Emergency Services)</option>
                  <option value="102">102 (Specialized Maternity & Ambulance)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Regional Pricing & Currency Settings */}
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F7F9F4] mb-6">
              <div>
                <h3 className="text-lg font-bold font-heading text-[#17231D] flex items-center gap-2">
                  <Coins size={18} className="text-[#6B9B63]" />
                  Currency & Automatic Location Pricing
                </h3>
                <p className="text-xs text-[#69736D]">
                  Medicine prices are automatically formatted based on your country and timezone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => detectLocationViaGPS()}
                disabled={isDetectingGPS}
                className="px-4 py-2 rounded-xl bg-[#F7F9F4] hover:bg-[#DDE8D2] text-[#173B2B] text-xs font-bold border border-[#DDE8D2] transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <Compass size={14} className={isDetectingGPS ? 'animate-spin' : 'text-[#6B9B63]'} />
                <span>{isDetectingGPS ? 'Detecting via GPS...' : 'Auto-Detect via GPS'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F9F4] border border-[#DDE8D2] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{currencyConfig.flag}</div>
                <div>
                  <div className="text-sm font-bold text-[#17231D]">
                    Active Currency: {currencyConfig.code} ({currencyConfig.symbol}) — {currencyConfig.country}
                  </div>
                  <div className="text-xs text-[#69736D]">
                    Detected via: <span className="font-semibold text-[#173B2B] capitalize">{detectionMethod}</span>
                    {detectedCountry && ` • Region: ${detectedCountry}`}
                  </div>
                </div>
              </div>
              <div className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#DDE8D2] font-mono text-[#173B2B] font-bold">
                1 USD = {currencyConfig.rateAgainstUSD} {currencyConfig.code}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17231D] mb-3">
                Select Currency Override:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {Object.values(SUPPORTED_CURRENCIES).map((curr) => {
                  const isSelected = curr.code === currency;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setCurrency(curr.code)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#173B2B] text-white border-[#173B2B] shadow-2xs'
                          : 'bg-white text-[#17231D] border-[#DDE8D2] hover:bg-[#F7F9F4]'
                      }`}
                    >
                      <span className="text-lg">{curr.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight truncate">
                          {curr.code} ({curr.symbol})
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-[#69736D]'}`}>
                          {curr.country}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              id="btn-save-settings"
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="px-6 py-3.5 rounded-xl bg-[#173B2B] hover:bg-[#173B2B]/90 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              {isSavingSettings ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save size={16} className="text-[#DDE8D2]" />
                  <span>Save Application Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PAST SEARCH HISTORY */}
      {activeProfileTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#DDE8D2] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F7F9F4] mb-6">
              <div>
                <h3 className="text-lg font-bold font-heading text-[#17231D] flex items-center gap-2">
                  <History size={18} className="text-[#6B9B63]" />
                  Search History & Activity Logs
                </h3>
                <p className="text-xs text-[#69736D]">
                  Review past medication searches, re-run inquiries instantly, or clear stored logs.
                </p>
              </div>

              {searchHistory.length > 0 && (
                <button
                  id="btn-clear-all-history"
                  onClick={handleClearAllHistory}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#D95C5C] hover:bg-[#FFF2F2] border border-[#FCDADA] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Trash2 size={13} />
                  <span>Clear All History</span>
                </button>
              )}
            </div>

            {/* Search Filter for History */}
            <div className="relative mb-5">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736D]" />
              <input
                type="text"
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                placeholder="Filter search history by medicine or query..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F9F4] border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:ring-1 focus:ring-[#173B2B]"
              />
            </div>

            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 bg-[#F7F9F4] rounded-2xl border border-[#DDE8D2] p-6">
                <History size={28} className="text-[#69736D] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#17231D]">No Search History Found</p>
                <p className="text-xs text-[#69736D] mt-0.5">
                  {historySearchTerm ? 'No queries match your search filter.' : 'Your past medicine queries will appear here automatically.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F7F9F4]">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#F7F9F4]/70 px-3 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#DDE8D2] text-[#173B2B] flex items-center justify-center shrink-0">
                        <Search size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#17231D] truncate">
                          {item.query}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[#69736D]">
                          <span className="capitalize">{item.category || 'Medicine'} search</span>
                          <span>•</span>
                          <span>{item.timestamp}</span>
                          {item.results_count !== undefined && (
                            <>
                              <span>•</span>
                              <span className="text-[#173B2B] font-semibold">{item.results_count} results found</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onNavigateToSearch(item.query)}
                        className="px-3 py-1.5 rounded-lg bg-[#173B2B] text-white hover:bg-[#173B2B]/90 text-xs font-bold transition-all flex items-center gap-1"
                        title="Search again"
                      >
                        <span>Re-search</span>
                        <ArrowRight size={12} className="text-[#DDE8D2]" />
                      </button>

                      <button
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="p-1.5 text-[#69736D] hover:text-[#D95C5C] hover:bg-[#FFF2F2] rounded-lg transition-colors"
                        title="Delete log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
