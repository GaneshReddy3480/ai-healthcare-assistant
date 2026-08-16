import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  MapPin, 
  FileText, 
  Bot, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X,
  Store,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';

import { 
  Medicine, 
  Pharmacy, 
  InventoryItem, 
  Reminder, 
  User, 
  SearchQueryLog, 
  DetectedMedicine 
} from './types';
import { api } from './services/api';

import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { MedicineSearchView } from './components/MedicineSearchView';
import { PharmacyFinderView } from './components/PharmacyFinderView';
import { PrescriptionScanner } from './components/PrescriptionScanner';
import { AIChatView } from './components/AIChatView';
import { RemindersView } from './components/RemindersView';
import { AdminInventoryView } from './components/AdminInventoryView';
import { UserProfileView } from './components/UserProfileView';
import { MedicineDetailModal } from './components/MedicineDetailModal';
import { AuthModal } from './components/AuthModal';
import { SearchHistoryModal } from './components/SearchHistoryModal';
import { DrugInteractionCheckerView } from './components/DrugInteractionCheckerView';
import { HealthPassportView } from './components/HealthPassportView';
import { Footer } from './components/Footer';
import { MedicineReservation } from './types';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentQuery, setCurrentQuery] = useState<string>('');

  // Data Collections
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchQueryLog[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<MedicineReservation[]>([]);

  // Context & Modal State
  const [selectedMedicineModal, setSelectedMedicineModal] = useState<Medicine | null>(null);
  const [selectedMedicineForPharmacy, setSelectedMedicineForPharmacy] = useState<Medicine | null>(null);
  const [selectedMedicineForAI, setSelectedMedicineForAI] = useState<Medicine | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      try {
        const [meds, pharms, inv, rems, hist, user] = await Promise.all([
          api.getMedicines(),
          api.getPharmacies(),
          api.getInventory(),
          api.getReminders(),
          api.getSearchHistory(),
          api.getCurrentUser()
        ]);
        setMedicines(meds);
        setPharmacies(pharms);
        setInventory(inv);
        setReminders(rems);
        setSearchHistory(hist);
        setCurrentUser(user);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    initData();
  }, []);

  // Navigation Handler
  const handleNavigate = (tab: string, context?: any) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search from Hero or anywhere
  const handleSearchSubmit = async (query: string) => {
    setCurrentQuery(query);
    setActiveTab('medicines');
    await api.logSearch(query);
    const updatedHistory = await api.getSearchHistory();
    setSearchHistory(updatedHistory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View Medicine Detail
  const handleViewMedicineDetails = (medicine: Medicine) => {
    setSelectedMedicineModal(medicine);
  };

  // Find Nearby action from card
  const handleFindNearby = (medicine: Medicine) => {
    setSelectedMedicineForPharmacy(medicine);
    setSelectedMedicineModal(null);
    setActiveTab('pharmacies');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ask AI about this medicine
  const handleAskAI = (medicine: Medicine) => {
    setSelectedMedicineForAI(medicine);
    setSelectedMedicineModal(null);
    setActiveTab('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Set Reminder for Medicine
  const handleSetReminder = async (medicine: Medicine) => {
    try {
      const newRem = await api.createReminder({
        medicine_name: `${medicine.name} (${medicine.strength})`,
        dosage: '1 ' + medicine.form,
        time: '08:00 AM',
        frequency: 'Daily',
        days_of_week: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
        start_date: new Date().toISOString().split('T')[0],
        notes: `Take ${medicine.dosage_info || 'as directed by physician'}.`,
        is_active: true
      });
      setReminders(prev => [newRem, ...prev]);
      showToast(`Reminder created for ${medicine.name}!`);
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}
    } catch (err) {
      console.error('Failed to create reminder:', err);
    }
  };

  // Toggle Reminder Taken
  const handleToggleReminderTaken = async (id: string) => {
    try {
      const updated = await api.toggleReminderTaken(id);
      setReminders(prev => prev.map(r => r.id === id ? updated : r));
      if (updated.last_taken) {
        showToast('Medication dose marked as taken today! Great job.');
        try {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        } catch (e) {}
      } else {
        showToast('Medication reset to pending.');
      }
    } catch (err) {
      console.error('Failed to toggle reminder:', err);
    }
  };

  // Add Custom Reminder
  const handleAddReminder = async (data: Omit<Reminder, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const newRem = await api.createReminder(data);
      setReminders(prev => [newRem, ...prev]);
      showToast(`Reminder added for ${data.medicine_name}!`);
    } catch (err) {
      console.error('Failed to add reminder:', err);
    }
  };

  // Delete Reminder
  const handleDeleteReminder = async (id: string) => {
    try {
      await api.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      showToast('Reminder deleted.', 'info');
    } catch (err) {
      console.error('Failed to delete reminder:', err);
    }
  };

  // OCR Bulk Actions
  const handleOCRCheckAvailability = (detectedList: DetectedMedicine[]) => {
    if (detectedList.length === 0) return;
    const firstMedName = detectedList[0].name;
    setCurrentQuery(firstMedName);
    setActiveTab('medicines');
    showToast(`Searching stock for verified prescription medicines (${detectedList.length} items)...`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOCRSetReminders = async (detectedList: DetectedMedicine[]) => {
    let count = 0;
    for (const med of detectedList) {
      await api.createReminder({
        medicine_name: `${med.name} (${med.dosage})`,
        dosage: '1 dose',
        time: '08:00 AM',
        frequency: med.frequency,
        days_of_week: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
        start_date: new Date().toISOString().split('T')[0],
        notes: `Schedule: ${med.frequency}, Duration: ${med.duration}`,
        is_active: true
      });
      count++;
    }
    const updated = await api.getReminders();
    setReminders(updated);
    showToast(`Created reminders for ${count} prescribed medications!`);
    try {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
    } catch (e) {}
  };

  // Switch demo user role
  const handleSwitchRole = (role: 'user' | 'pharmacist' | 'admin') => {
    const updatedUser: User = currentUser ? {
      ...currentUser,
      role
    } : {
      id: 'usr-1',
      name: role === 'admin' ? 'System Administrator' : role === 'pharmacist' ? 'Chemist Lead' : 'Patient User',
      email: `${role}@medifind.ai`,
      role
    };
    setCurrentUser(updatedUser);
    showToast(`Switched to ${role.toUpperCase()} mode.`);
  };

  // Logout
  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    showToast('Signed out successfully.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F4] text-[#17231D] font-sans flex flex-col selection:bg-[#DDE8D2] selection:text-[#173B2B] overflow-x-hidden">
      
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
            toastMessage.type === 'success'
              ? 'bg-[#173B2B] text-white border-[#6B9B63]'
              : toastMessage.type === 'warning'
              ? 'bg-[#FFF9E6] text-[#B26B00] border-[#E7A23B]'
              : 'bg-white text-[#17231D] border-[#DDE8D2]'
          }`}>
            <CheckCircle2 size={16} className="text-[#6B9B63]" />
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 text-white/60 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Top & Bottom Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenReminders={() => {
          setActiveTab('reminders');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearchHistory={() => setHistoryModalOpen(true)}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        remindersCount={reminders.filter(r => !r.last_taken).length}
      />

      {/* Main Content Area - Responsive padding with safe-area spacing for mobile bottom navigation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <HomeView
                onNavigate={handleNavigate}
                onSearchSubmit={handleSearchSubmit}
                featuredMedicines={medicines}
                pharmacies={pharmacies}
                reminders={reminders}
                currentUser={currentUser}
                onViewMedicineDetails={handleViewMedicineDetails}
                onFindNearby={handleFindNearby}
                onAskAI={handleAskAI}
                onToggleReminderTaken={handleToggleReminderTaken}
              />
            </motion.div>
          )}

          {activeTab === 'medicines' && (
            <motion.div
              key="medicines"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <MedicineSearchView
                medicines={medicines}
                initialSearchQuery={currentQuery}
                onViewDetails={handleViewMedicineDetails}
                onFindNearby={handleFindNearby}
                onAskAI={handleAskAI}
                onSetReminder={handleSetReminder}
              />
            </motion.div>
          )}

          {activeTab === 'interactions' && (
            <motion.div
              key="interactions"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <DrugInteractionCheckerView
                medicines={medicines}
                onNavigateToMedicine={(med) => {
                  handleViewMedicineDetails(med);
                }}
                onAskAI={() => {
                  setActiveTab('assistant');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'passport' && (
            <motion.div
              key="passport"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <HealthPassportView
                user={currentUser}
                reminders={reminders}
                reservations={reservations}
              />
            </motion.div>
          )}

          {activeTab === 'pharmacies' && (
            <motion.div
              key="pharmacies"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <PharmacyFinderView
                pharmacies={pharmacies}
                inventory={inventory}
                filterMedicine={selectedMedicineForPharmacy}
                onClearMedicineFilter={() => setSelectedMedicineForPharmacy(null)}
              />
            </motion.div>
          )}

          {activeTab === 'prescription' && (
            <motion.div
              key="prescription"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <PrescriptionScanner
                onCheckAvailability={handleOCRCheckAvailability}
                onSetReminders={handleOCRSetReminders}
                onViewMedicineDetails={(name) => {
                  setCurrentQuery(name);
                  setActiveTab('medicines');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'assistant' && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <AIChatView
                initialMedicineContext={selectedMedicineForAI}
                onNavigateToMedicine={(name) => {
                  setCurrentQuery(name);
                  setActiveTab('medicines');
                }}
              />
            </motion.div>
          )}

          {activeTab === 'reminders' && (
            <motion.div
              key="reminders"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <RemindersView
                reminders={reminders}
                onAddReminder={handleAddReminder}
                onToggleTaken={handleToggleReminderTaken}
                onDeleteReminder={handleDeleteReminder}
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <UserProfileView
                currentUser={currentUser}
                onUpdateUser={(updated) => setCurrentUser(updated)}
                onNavigateToSearch={(query) => {
                  setCurrentQuery(query);
                  setActiveTab('medicines');
                }}
                onShowToast={showToast}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <AdminInventoryView
                currentUserRole={currentUser?.role || 'admin'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Modals */}
      <MedicineDetailModal
        medicine={selectedMedicineModal}
        onClose={() => setSelectedMedicineModal(null)}
        onFindNearby={handleFindNearby}
        onAskAI={handleAskAI}
        onSetReminder={handleSetReminder}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />

      <SearchHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={searchHistory}
        onSelectQuery={(q) => handleSearchSubmit(q)}
        onClearHistory={async () => {
          await api.clearSearchHistory();
          setSearchHistory([]);
          showToast('Search history cleared.', 'info');
        }}
      />

      {/* Project Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
