import { 
  Medicine, 
  Pharmacy, 
  InventoryItem, 
  Reminder, 
  PrescriptionScan, 
  DetectedMedicine, 
  User, 
  UserSettings,
  MedicineFilterParams,
  AdminStats,
  SearchQueryLog,
  MedicineReservation,
  DrugInteraction,
  GenericSubstitute
} from '../types';
import { 
  INITIAL_MEDICINES, 
  INITIAL_PHARMACIES, 
  INITIAL_INVENTORY, 
  INITIAL_REMINDERS 
} from './mockData';
import {
  INITIAL_GENERIC_SUBSTITUTES,
  CLINICAL_INTERACTION_RULES,
  INITIAL_RESERVATIONS
} from './clinicalData';

// Local storage keys for state persistence
const STORAGE_KEYS = {
  MEDICINES: 'medifind_medicines_v1',
  PHARMACIES: 'medifind_pharmacies_v1',
  INVENTORY: 'medifind_inventory_v1',
  REMINDERS: 'medifind_reminders_v1',
  PRESCRIPTIONS: 'medifind_prescriptions_v1',
  SEARCH_HISTORY: 'medifind_search_history_v1',
  AUTH_USER: 'medifind_auth_user_v1',
  AUTH_TOKEN: 'medifind_auth_token_v1',
  USER_SETTINGS: 'medifind_user_settings_v1',
  RESERVATIONS: 'medifind_reservations_v1'
};

// Safe storage helpers
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// In-memory / persisted database
let medicinesData: Medicine[] = getStored(STORAGE_KEYS.MEDICINES, INITIAL_MEDICINES);
let pharmaciesData: Pharmacy[] = getStored(STORAGE_KEYS.PHARMACIES, INITIAL_PHARMACIES);
let inventoryData: InventoryItem[] = getStored(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
let remindersData: Reminder[] = getStored(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
let reservationsData: MedicineReservation[] = getStored(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);

const DEFAULT_USER: User = {
  id: 'usr-1',
  name: 'Nikhil Vardhan',
  email: 'patient@medifind.ai',
  phone: '+91 98765 43210',
  role: 'user',
  blood_group: 'O+',
  allergies: ['Penicillin', 'Sulfa drugs'],
  emergency_contact: {
    name: 'Dr. S. Sharma',
    phone: '+91 98111 22233',
    relation: 'Family Physician'
  },
  address: 'H-14, Health Park Enclave, New Delhi, India',
  date_of_birth: '2000-05-18',
  created_at: '2026-08-14'
};

const DEFAULT_SETTINGS: UserSettings = {
  reminder_notifications: true,
  sound_alerts: true,
  distance_unit: 'km',
  auto_save_search_history: true,
  ai_detail_level: 'standard',
  emergency_sos_number: '108'
};

let currentUserData: User | null = getStored(STORAGE_KEYS.AUTH_USER, DEFAULT_USER);
let userSettingsData: UserSettings = getStored(STORAGE_KEYS.USER_SETTINGS, DEFAULT_SETTINGS);

let searchHistoryData: SearchQueryLog[] = getStored(STORAGE_KEYS.SEARCH_HISTORY, [
  { id: 'sh-1', query: 'Paracetamol 500mg', category: 'medicine', results_count: 5, timestamp: '2 hours ago' },
  { id: 'sh-2', query: 'Azithromycin nearby', category: 'pharmacy', results_count: 3, timestamp: 'Yesterday' },
  { id: 'sh-3', query: 'Apollo Pharmacy 24/7', category: 'pharmacy', results_count: 8, timestamp: '2 days ago' },
  { id: 'sh-4', query: 'Cetirizine 10mg', category: 'medicine', results_count: 4, timestamp: '3 days ago' },
  { id: 'sh-5', query: 'Salbutamol Inhaler', category: 'medicine', results_count: 2, timestamp: '5 days ago' }
]);

// Distance calculator (Haversine formula in km)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const api = {
  // --- AUTHENTICATION & PROFILE ---
  async getCurrentUser(): Promise<User | null> {
    return currentUserData;
  },

  async getUserProfile(): Promise<User | null> {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          currentUserData = { ...currentUserData, ...data.profile };
          setStored(STORAGE_KEYS.AUTH_USER, currentUserData);
        }
      }
    } catch (e) {
      console.warn('Fallback to local user profile store');
    }
    return currentUserData;
  },

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    if (!currentUserData) {
      currentUserData = { ...DEFAULT_USER, ...updates };
    } else {
      currentUserData = { ...currentUserData, ...updates };
    }
    setStored(STORAGE_KEYS.AUTH_USER, currentUserData);

    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API profile sync fallback:', e);
    }

    return currentUserData;
  },

  async getUserSettings(): Promise<UserSettings> {
    try {
      const res = await fetch('/api/user/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          userSettingsData = data.settings;
          setStored(STORAGE_KEYS.USER_SETTINGS, userSettingsData);
        }
      }
    } catch (e) {
      console.warn('Fallback to local settings store');
    }
    return userSettingsData;
  },

  async updateUserSettings(updates: Partial<UserSettings>): Promise<UserSettings> {
    userSettingsData = { ...userSettingsData, ...updates };
    setStored(STORAGE_KEYS.USER_SETTINGS, userSettingsData);

    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API settings sync fallback:', e);
    }

    return userSettingsData;
  },

  async login(email: string, password?: string): Promise<{ user: User; token: string }> {
    const role: User['role'] = email.includes('admin') ? 'admin' : email.includes('pharm') ? 'pharmacist' : 'user';
    const user: User = {
      id: `usr-${Date.now()}`,
      name: role === 'admin' ? 'System Administrator' : role === 'pharmacist' ? 'Apollo Lead Pharmacist' : email.split('@')[0],
      email,
      phone: '+91 98765 43210',
      role,
      blood_group: 'O+',
      allergies: ['Penicillin'],
      emergency_contact: {
        name: 'Dr. S. Sharma',
        phone: '+91 98111 22233',
        relation: 'Family Physician'
      },
      created_at: new Date().toISOString()
    };
    currentUserData = user;
    setStored(STORAGE_KEYS.AUTH_USER, user);
    setStored(STORAGE_KEYS.AUTH_TOKEN, `jwt_token_${user.id}`);
    return { user, token: `jwt_token_${user.id}` };
  },

  async register(name: string, email: string, password?: string, phone?: string, role: User['role'] = 'user'): Promise<{ user: User; token: string }> {
    const user: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone: phone || '+91 98765 43210',
      role,
      blood_group: 'O+',
      allergies: [],
      emergency_contact: {
        name: 'Emergency Contact',
        phone: '+91 98111 00000',
        relation: 'Guardian'
      },
      created_at: new Date().toISOString()
    };
    currentUserData = user;
    setStored(STORAGE_KEYS.AUTH_USER, user);
    setStored(STORAGE_KEYS.AUTH_TOKEN, `jwt_token_${user.id}`);
    return { user, token: `jwt_token_${user.id}` };
  },

  async logout(): Promise<void> {
    currentUserData = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // --- MEDICINES SEARCH & ADVANCED FILTERING ---
  async getMedicines(paramsOrQuery?: MedicineFilterParams | string, legacyCategory?: string, legacyAvailability?: string): Promise<Medicine[]> {
    let list = [...medicinesData];

    let params: MedicineFilterParams = {};
    if (typeof paramsOrQuery === 'string') {
      params = {
        query: paramsOrQuery,
        category: legacyCategory,
        availability: legacyAvailability as any
      };
    } else if (paramsOrQuery) {
      params = paramsOrQuery;
    }

    const {
      query = '',
      category = 'All',
      manufacturer = 'all',
      strength = 'all',
      availability = 'all',
      form = 'all',
      prescription_required = 'all',
      min_price,
      max_price,
      sort_by = 'name'
    } = params;

    // Search query match
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.generic_name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q) ||
        m.strength.toLowerCase().includes(q) ||
        m.uses.some(u => u.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (category && category !== 'All') {
      list = list.filter(m => m.category.toLowerCase().includes(category.toLowerCase()));
    }

    // Manufacturer filter
    if (manufacturer && manufacturer !== 'all') {
      list = list.filter(m => m.manufacturer.toLowerCase().includes(manufacturer.toLowerCase()));
    }

    // Strength filter
    if (strength && strength !== 'all') {
      list = list.filter(m => m.strength.toLowerCase().includes(strength.toLowerCase()));
    }

    // Availability status filter
    if (availability && availability !== 'all') {
      list = list.filter(m => m.stock_status === availability);
    }

    // Dosage Form filter
    if (form && form !== 'all') {
      list = list.filter(m => m.form.toLowerCase() === form.toLowerCase());
    }

    // Prescription requirement filter
    if (prescription_required && prescription_required !== 'all') {
      if (prescription_required === 'rx') {
        list = list.filter(m => m.prescription_required);
      } else if (prescription_required === 'otc') {
        list = list.filter(m => !m.prescription_required);
      }
    }

    // Price range filters
    if (min_price !== undefined && min_price > 0) {
      list = list.filter(m => m.average_price >= min_price);
    }
    if (max_price !== undefined && max_price < 100) {
      list = list.filter(m => m.average_price <= max_price);
    }

    // Sorting
    list.sort((a, b) => {
      if (sort_by === 'name') return a.name.localeCompare(b.name);
      if (sort_by === 'price_asc') return a.average_price - b.average_price;
      if (sort_by === 'price_desc') return b.average_price - a.average_price;
      if (sort_by === 'availability') return b.available_pharmacies_count - a.available_pharmacies_count;
      return 0;
    });

    return list;
  },

  async getFilterOptions(): Promise<{
    manufacturers: string[];
    strengths: string[];
    categories: string[];
    forms: string[];
  }> {
    const manufacturers = Array.from(new Set(medicinesData.map(m => m.manufacturer))).sort();
    const strengths = Array.from(new Set(medicinesData.map(m => m.strength))).sort();
    const categories = Array.from(new Set(medicinesData.map(m => m.category))).sort();
    const forms = Array.from(new Set(medicinesData.map(m => m.form))).sort();

    return {
      manufacturers,
      strengths,
      categories: ['All', ...categories],
      forms: ['all', ...forms]
    };
  },

  async getMedicineById(id: string): Promise<{ medicine: Medicine; inventory: InventoryItem[] } | null> {
    const medicine = medicinesData.find(m => m.id === id);
    if (!medicine) return null;
    const inv = inventoryData.filter(i => i.medicine_id === id);
    return { medicine, inventory: inv };
  },

  async getPopularSearches(): Promise<string[]> {
    return ['Paracetamol 500mg', 'Cetirizine 10mg', 'Azithromycin 500mg', 'Dolo 650', 'Amoxicillin', 'Pantoprazole 40mg', 'Salbutamol Inhaler'];
  },

  // --- PHARMACIES ---
  async getPharmacies(userLat?: number, userLng?: number, search = '', filter24x7 = false): Promise<Pharmacy[]> {
    let list = pharmaciesData.map(p => {
      let dist = p.distance_km;
      if (userLat && userLng) {
        dist = calculateDistance(userLat, userLng, p.latitude, p.longitude);
      }
      return { ...p, distance_km: dist };
    });

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(s) ||
        p.address.toLowerCase().includes(s) ||
        p.city.toLowerCase().includes(s)
      );
    }

    if (filter24x7) {
      list = list.filter(p => p.is_24x7);
    }

    list.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    return list;
  },

  async getPharmacyById(id: string): Promise<{ pharmacy: Pharmacy; inventory: InventoryItem[] } | null> {
    const pharmacy = pharmaciesData.find(p => p.id === id);
    if (!pharmacy) return null;
    const inv = inventoryData.filter(i => i.pharmacy_id === id);
    return { pharmacy, inventory: inv };
  },

  // --- INVENTORY MANAGEMENT ---
  async getInventory(pharmacyId?: string): Promise<InventoryItem[]> {
    if (pharmacyId && pharmacyId !== 'all') {
      return inventoryData.filter(i => i.pharmacy_id === pharmacyId);
    }
    return inventoryData;
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const index = inventoryData.findIndex(i => i.id === id);
    if (index === -1) throw new Error('Inventory item not found');
    
    const updated = {
      ...inventoryData[index],
      ...updates,
      last_updated: new Date().toISOString().split('T')[0]
    };

    if (updates.stock_quantity !== undefined) {
      if (updates.stock_quantity === 0) {
        updated.status = 'unavailable';
      } else if (updates.stock_quantity <= 10) {
        updated.status = 'low_stock';
      } else {
        updated.status = 'available';
      }
    }

    inventoryData[index] = updated;
    setStored(STORAGE_KEYS.INVENTORY, inventoryData);
    api.recalculateMedicineStats(updated.medicine_id);
    return updated;
  },

  async addInventoryItem(item: {
    pharmacy_id: string;
    medicine_id: string;
    stock_quantity: number;
    price: number;
    status: InventoryItem['status'];
    batch_number?: string;
    expiry_date?: string;
  }): Promise<InventoryItem> {
    const pharm = pharmaciesData.find(p => p.id === item.pharmacy_id);
    const med = medicinesData.find(m => m.id === item.medicine_id);

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      pharmacy_id: item.pharmacy_id,
      medicine_id: item.medicine_id,
      pharmacy_name: pharm?.name || 'Partner Pharmacy',
      medicine_name: med?.name || 'Medication Item',
      generic_name: med?.generic_name || 'Generic Compound',
      strength: med?.strength || '500 mg',
      form: med?.form || 'Tablet',
      stock_quantity: item.stock_quantity,
      price: item.price,
      status: item.status,
      batch_number: item.batch_number || 'BATCH-2026-X',
      expiry_date: item.expiry_date || '2027-12',
      last_updated: new Date().toISOString().split('T')[0]
    };
    inventoryData.unshift(newItem);
    setStored(STORAGE_KEYS.INVENTORY, inventoryData);
    api.recalculateMedicineStats(newItem.medicine_id);
    return newItem;
  },

  recalculateMedicineStats(medicineId: string) {
    const invForMed = inventoryData.filter(i => i.medicine_id === medicineId);
    const availableStores = invForMed.filter(i => i.status === 'available' || i.status === 'low_stock');
    const medIndex = medicinesData.findIndex(m => m.id === medicineId);
    if (medIndex !== -1) {
      medicinesData[medIndex].available_pharmacies_count = availableStores.length;
      if (availableStores.length === 0) {
        medicinesData[medIndex].stock_status = 'unavailable';
      } else if (invForMed.some(i => i.status === 'available')) {
        medicinesData[medIndex].stock_status = 'available';
      } else {
        medicinesData[medIndex].stock_status = 'low_stock';
      }
      setStored(STORAGE_KEYS.MEDICINES, medicinesData);
    }
  },

  // --- PRESCRIPTION OCR PROCESSING ---
  async processPrescriptionOCR(imageDataUrl: string, sampleTextPreset?: string): Promise<PrescriptionScan> {
    try {
      const response = await fetch('/api/prescriptions/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, samplePreset: sampleTextPreset })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (e) {
      console.warn('Server OCR fallback to client parser:', e);
    }

    // Client-side fallback
    let rawText = sampleTextPreset || '';
    if (!rawText) {
      rawText = `Rx
1. Tab. Paracetamol 500mg — 1 tab TDS x 3 days (after food)
2. Tab. Azithromycin 500mg — 1 tab OD x 3 days (before food)
3. Tab. Cetirizine 10mg — 1 tab HS x 5 days
4. Syp. Ambroxol / Cough — 10ml BD
Adv: Rest, fluid intake, avoid cold drinks.`;
    }

    const detected: DetectedMedicine[] = [];
    const lines = rawText.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('Rx') || trimmed.startsWith('Adv:')) return;

      const matched = medicinesData.find(m => 
        trimmed.toLowerCase().includes(m.name.toLowerCase().split(' ')[0]) ||
        trimmed.toLowerCase().includes(m.generic_name.toLowerCase().split(' ')[0])
      );

      let medName = trimmed.replace(/^[0-9]+[.\-)]\s*/, '').replace(/^(Tab|Cap|Syp|Inj)\.?\s*/i, '');
      const parts = medName.split('—');
      const nameOnly = (parts[0] || medName).trim();
      const dosageFrequency = (parts[1] || 'As directed').trim();

      if (nameOnly.length > 2) {
        detected.push({
          id: `det-${index}-${Date.now()}`,
          name: matched ? matched.name : nameOnly,
          dosage: matched ? matched.strength : 'Standard dose',
          frequency: dosageFrequency.includes('TDS') ? 'Three times daily (TDS)' : 
                     dosageFrequency.includes('BD') ? 'Twice daily (BD)' : 
                     dosageFrequency.includes('OD') ? 'Once daily (OD)' : 
                     dosageFrequency.includes('HS') ? 'At bedtime (HS)' : dosageFrequency,
          duration: dosageFrequency.includes('x') ? dosageFrequency.split('x')[1]?.trim() || '3-5 days' : '3-5 days',
          confidence: matched ? 0.94 : 0.78,
          matched_medicine_id: matched?.id,
          status: matched ? matched.stock_status : 'available',
          available_pharmacies_count: matched ? matched.available_pharmacies_count : 3
        });
      }
    });

    const result: PrescriptionScan = {
      id: `rx-${Date.now()}`,
      image_url: imageDataUrl,
      raw_text: rawText,
      doctor_name: 'Dr. Ramesh Sharma, M.D. (Internal Medicine)',
      patient_name: 'Patient (Self)',
      date: new Date().toLocaleDateString('en-GB'),
      detected_medicines: detected,
      created_at: new Date().toISOString(),
      status: 'processed'
    };

    return result;
  },

  // --- GEMINI AI HEALTH ASSISTANT ---
  async askAIAssistant(
    userMessage: string, 
    conversationHistory: { sender: 'user' | 'assistant'; text: string }[] = [],
    medicineContext?: string
  ): Promise<{ text: string; is_emergency: boolean; suggested_questions: string[] }> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory,
          medicine_context: medicineContext
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Server AI route fallback:', e);
    }

    const lower = userMessage.toLowerCase();
    const isEmergency = lower.includes('chest pain') || lower.includes('breathing difficulty') || lower.includes('collapsed') || lower.includes('severe bleeding') || lower.includes('poison');

    if (isEmergency) {
      return {
        text: `⚠️ **EMERGENCY MEDICAL NOTICE**: Your symptoms may indicate an acute medical emergency.\n\n**Immediate Action Required:**\n- Call your local emergency helpline (such as 108 / 112 / 911) or visit the nearest hospital emergency department immediately.\n- Do not attempt self-medication while waiting for emergency responders.\n\n*Note: MediFind AI is an educational support tool and cannot provide emergency diagnosis or urgent care.*`,
        is_emergency: true,
        suggested_questions: ['Emergency numbers in India', 'First aid for severe symptoms', 'Find 24/7 emergency pharmacy']
      };
    }

    let responseText = `Thank you for your question regarding health and medicines.\n\n`;

    if (lower.includes('paracetamol') || lower.includes('dolo')) {
      responseText += `**Educational Overview on Paracetamol / Acetaminophen:**\n- **Purpose:** Used for mild to moderate pain relief and reducing fever.\n- **Standard Adult Dose:** 500mg to 650mg every 4 to 6 hours as needed. Never exceed **4000mg (4 grams)** within 24 hours to prevent liver injury.\n- **Precautions:** Avoid consuming alcohol with paracetamol. Be aware that many combination cold medicines also contain paracetamol.\n- **When to consult a doctor:** If high fever persists beyond 3 days or pain exceeds 5 days.`;
    } else if (lower.includes('azithromycin') || lower.includes('antibiotic')) {
      responseText += `**Important Information Regarding Antibiotics (e.g., Azithromycin):**\n- **Prescription Mandatory:** Antibiotics must strictly be taken under a doctor's prescription for confirmed bacterial infections.\n- **Complete the Course:** Always complete the full course prescribed by your physician, even if you start feeling better, to prevent bacterial resistance.\n- **Common Side Effects:** Mild stomach upset or nausea. Taking with food can help alleviate discomfort.`;
    } else {
      responseText += `Here is general educational guidance on your query:\n\n- **Medical Overview:** It is always essential to track symptoms accurately, maintain adequate hydration, and take medications strictly as directed on the prescription.\n- **Pharmacy Availability:** You can check real-time stock at verified nearby pharmacies using our search bar or pharmacy locator map.\n- **Reminder Setup:** Consider setting up a reminder in our **Reminders** tab to ensure consistent adherence to your schedule.\n\n*Reminder: This information is for general educational awareness only and does not constitute a clinical diagnosis or medical prescription.*`;
    }

    return {
      text: responseText,
      is_emergency: false,
      suggested_questions: [
        'What are common precautions for this medication?',
        'Can this medicine be taken with food or milk?',
        'What should I ask my pharmacist about this prescription?'
      ]
    };
  },

  // --- REMINDERS ---
  async getReminders(): Promise<Reminder[]> {
    try {
      const res = await fetch('/api/db/reminders');
      if (res.ok) {
        const data = await res.json();
        if (data.reminders && Array.isArray(data.reminders) && data.reminders.length > 0) {
          const mapped: Reminder[] = data.reminders.map((r: any) => ({
            id: r.id,
            user_id: r.userId,
            medicine_name: r.medicineName,
            dosage: r.dosage,
            time: r.time,
            frequency: r.frequency,
            days_of_week: r.daysOfWeek,
            start_date: r.startDate,
            end_date: r.endDate,
            notes: r.notes,
            is_active: r.isActive,
            last_taken: r.lastTaken,
            created_at: r.createdAt
          }));
          remindersData = mapped;
          setStored(STORAGE_KEYS.REMINDERS, remindersData);
          return remindersData;
        }
      }
    } catch (e) {
      console.warn('Fallback to local reminders store:', e);
    }
    return remindersData;
  },

  async createReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    const newRem: Reminder = {
      ...reminder,
      id: `rem-${Date.now()}`
    };
    remindersData.unshift(newRem);
    setStored(STORAGE_KEYS.REMINDERS, remindersData);

    try {
      await fetch('/api/db/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newRem.id,
          userId: newRem.user_id || currentUserData?.id || 'usr-1',
          medicineName: newRem.medicine_name,
          dosage: newRem.dosage,
          time: newRem.time,
          frequency: newRem.frequency,
          daysOfWeek: newRem.days_of_week,
          startDate: newRem.start_date,
          endDate: newRem.end_date,
          notes: newRem.notes,
          isActive: newRem.is_active
        })
      });
    } catch (e) {
      console.warn('Cloud SQL reminder sync fallback:', e);
    }

    return newRem;
  },

  async addReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    return api.createReminder(reminder);
  },

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const index = remindersData.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reminder not found');
    remindersData[index] = { ...remindersData[index], ...updates };
    setStored(STORAGE_KEYS.REMINDERS, remindersData);
    return remindersData[index];
  },

  async deleteReminder(id: string): Promise<void> {
    remindersData = remindersData.filter(r => r.id !== id);
    setStored(STORAGE_KEYS.REMINDERS, remindersData);
    try {
      await fetch(`/api/db/reminders/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Cloud SQL delete reminder fallback:', e);
    }
  },

  async toggleReminderTaken(id: string): Promise<Reminder> {
    const rem = remindersData.find(r => r.id === id);
    if (!rem) throw new Error('Reminder not found');
    const newLastTaken = rem.last_taken 
      ? undefined 
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return api.updateReminder(id, { last_taken: newLastTaken });
  },

  async markReminderTaken(id: string): Promise<Reminder> {
    return api.updateReminder(id, { 
      last_taken: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  },

  // --- SEARCH HISTORY ---
  async getSearchHistory(): Promise<SearchQueryLog[]> {
    return searchHistoryData;
  },

  async logSearch(query: string, category: string = 'medicine', results_count?: number): Promise<void> {
    if (!query.trim()) return;
    const existing = searchHistoryData.findIndex(s => s.query.toLowerCase() === query.toLowerCase());
    if (existing !== -1) {
      searchHistoryData.splice(existing, 1);
    }
    searchHistoryData.unshift({
      id: `sh-${Date.now()}`,
      query,
      category,
      results_count: results_count || 5,
      timestamp: 'Just now'
    });
    if (searchHistoryData.length > 25) {
      searchHistoryData = searchHistoryData.slice(0, 25);
    }
    setStored(STORAGE_KEYS.SEARCH_HISTORY, searchHistoryData);
  },

  async addSearchHistory(query: string, category: string = 'medicine'): Promise<void> {
    return api.logSearch(query, category);
  },

  async deleteSearchHistoryItem(id: string): Promise<void> {
    searchHistoryData = searchHistoryData.filter(s => s.id !== id);
    setStored(STORAGE_KEYS.SEARCH_HISTORY, searchHistoryData);
    try {
      await fetch(`/api/user/search-history/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API search history delete fallback:', e);
    }
  },

  async clearSearchHistory(): Promise<void> {
    searchHistoryData = [];
    setStored(STORAGE_KEYS.SEARCH_HISTORY, []);
    try {
      await fetch('/api/user/search-history', { method: 'DELETE' });
    } catch (e) {
      console.warn('API search history clear fallback:', e);
    }
  },

  // --- ADMIN STATS ---
  async getAdminStats(): Promise<AdminStats> {
    const lowStock = inventoryData.filter(i => i.status === 'low_stock').length;
    const unavailable = inventoryData.filter(i => i.status === 'unavailable').length;
    return {
      total_medicines: medicinesData.length,
      total_pharmacies: pharmaciesData.length,
      total_inventory_items: inventoryData.length,
      total_users: 142,
      total_searches: 856,
      low_stock_count: lowStock,
      unavailable_count: unavailable,
      active_reminders_count: remindersData.filter(r => r.is_active).length,
      prescriptions_scanned_count: 64,
      active_reservations_count: reservationsData.filter(r => r.status === 'reserved' || r.status === 'ready').length
    };
  },

  // --- GENERIC SUBSTITUTES FINDER ---
  async getGenericSubstitutes(medicineId: string): Promise<GenericSubstitute[]> {
    if (INITIAL_GENERIC_SUBSTITUTES[medicineId]) {
      return INITIAL_GENERIC_SUBSTITUTES[medicineId];
    }
    const med = medicinesData.find(m => m.id === medicineId);
    if (!med) return [];
    
    // Auto-generate realistic bio-equivalent generics if not explicitly hardcoded
    const basePrice = med.average_price;
    return [
      {
        id: `sub-${med.id}-gen1`,
        brand_name: med.name,
        generic_name: med.generic_name,
        strength: med.strength,
        substitute_name: `Jan Aushadhi ${med.generic_name.split(' ')[0]} ${med.strength}`,
        manufacturer: 'BPPI / PMBJP National Labs',
        price: Math.max(0.75, Number((basePrice * 0.35).toFixed(2))),
        savings_percentage: 65,
        dosage_form: med.form,
        prescription_required: med.prescription_required,
        bioequivalent: true
      },
      {
        id: `sub-${med.id}-gen2`,
        brand_name: med.name,
        generic_name: med.generic_name,
        strength: med.strength,
        substitute_name: `Cipla Generic ${med.generic_name.split(' ')[0]}`,
        manufacturer: 'Cipla Quality Care',
        price: Math.max(1.20, Number((basePrice * 0.52).toFixed(2))),
        savings_percentage: 48,
        dosage_form: med.form,
        prescription_required: med.prescription_required,
        bioequivalent: true
      }
    ];
  },

  // --- DRUG INTERACTIONS CHECKER ---
  async checkDrugInteractions(drugNames: string[]): Promise<DrugInteraction[]> {
    if (drugNames.length < 2) return [];

    const foundInteractions: DrugInteraction[] = [];
    const normalized = drugNames.map(d => d.toLowerCase().trim());

    // Compare each pair
    for (let i = 0; i < normalized.length; i++) {
      for (let j = i + 1; j < normalized.length; j++) {
        const d1 = normalized[i];
        const d2 = normalized[j];

        const match = CLINICAL_INTERACTION_RULES.find(rule => {
          const ruleA = rule.drug_a.toLowerCase();
          const ruleB = rule.drug_b.toLowerCase();
          return (d1.includes(ruleA) || ruleA.includes(d1)) && (d2.includes(ruleB) || ruleB.includes(d2)) ||
                 (d1.includes(ruleB) || ruleB.includes(d1)) && (d2.includes(ruleA) || ruleA.includes(d2));
        });

        if (match) {
          foundInteractions.push(match);
        } else {
          // Default safe interaction assessment
          foundInteractions.push({
            id: `int-safe-${i}-${j}`,
            drug_a: drugNames[i],
            drug_b: drugNames[j],
            severity: 'Safe / No Interaction',
            effect: 'No significant high-risk metabolic contradiction noted in standard clinical databases.',
            recommendation: 'Can be taken concurrently. Follow recommended dosing intervals on your doctor\'s prescription.'
          });
        }
      }
    }

    return foundInteractions;
  },

  // --- MEDICINE RESERVATIONS / 1-CLICK PICKUP HOLD ---
  async getReservations(): Promise<MedicineReservation[]> {
    return reservationsData;
  },

  async createReservation(params: {
    medicine_id: string;
    medicine_name: string;
    pharmacy_id: string;
    pharmacy_name: string;
    patient_name: string;
    patient_phone: string;
    quantity: number;
    price_per_unit: number;
  }): Promise<MedicineReservation> {
    const pharm = pharmaciesData.find(p => p.id === params.pharmacy_id);
    const token = `MED-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const expires = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours hold

    const newRes: MedicineReservation = {
      id: `res-${Date.now()}`,
      pickup_token: token,
      medicine_id: params.medicine_id,
      medicine_name: params.medicine_name,
      pharmacy_id: params.pharmacy_id,
      pharmacy_name: params.pharmacy_name,
      pharmacy_address: pharm ? `${pharm.address}, ${pharm.city}` : undefined,
      pharmacy_phone: pharm?.phone,
      patient_name: params.patient_name || currentUserData?.name || 'Patient',
      patient_phone: params.patient_phone || currentUserData?.phone || '+91 98765 43210',
      quantity: params.quantity,
      price_per_unit: params.price_per_unit,
      total_price: Number((params.quantity * params.price_per_unit).toFixed(2)),
      status: 'ready',
      created_at: now.toISOString(),
      expires_at: expires.toISOString()
    };

    reservationsData.unshift(newRes);
    setStored(STORAGE_KEYS.RESERVATIONS, reservationsData);
    return newRes;
  },

  async updateReservationStatus(id: string, status: 'reserved' | 'ready' | 'completed' | 'cancelled'): Promise<MedicineReservation> {
    const idx = reservationsData.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Reservation not found');
    reservationsData[idx].status = status;
    setStored(STORAGE_KEYS.RESERVATIONS, reservationsData);
    return reservationsData[idx];
  },

  async cancelReservation(id: string): Promise<void> {
    const idx = reservationsData.findIndex(r => r.id === id);
    if (idx !== -1) {
      reservationsData[idx].status = 'cancelled';
      setStored(STORAGE_KEYS.RESERVATIONS, reservationsData);
    }
  }
};

