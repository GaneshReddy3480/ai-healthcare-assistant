export type Role = 'user' | 'pharmacist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  pharmacy_id?: string;
  created_at?: string;
  blood_group?: string;
  allergies?: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relation: string;
  };
  address?: string;
  date_of_birth?: string;
}

export interface UserSettings {
  reminder_notifications: boolean;
  sound_alerts: boolean;
  distance_unit: 'km' | 'miles';
  auto_save_search_history: boolean;
  ai_detail_level: 'concise' | 'standard' | 'detailed';
  emergency_sos_number: string;
}

export interface MedicineFilterParams {
  query?: string;
  category?: string;
  manufacturer?: string;
  strength?: string;
  availability?: AvailabilityStatus | 'all';
  form?: string;
  prescription_required?: 'all' | 'rx' | 'otc';
  min_price?: number;
  max_price?: number;
  sort_by?: 'name' | 'price_asc' | 'price_desc' | 'availability';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export type AvailabilityStatus = 'available' | 'low_stock' | 'unavailable';

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  manufacturer: string;
  strength: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler' | 'Ointment' | 'Drops' | string;
  category: string;
  description: string;
  uses: string[];
  side_effects: string[];
  precautions: string[];
  dosage_info: string;
  prescription_required: boolean;
  average_price: number;
  available_pharmacies_count: number;
  stock_status: AvailabilityStatus;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviews_count: number;
  opening_hours: string;
  is_open_now: boolean;
  is_24x7: boolean;
  distance_km?: number;
}

export interface InventoryItem {
  id: string;
  pharmacy_id: string;
  medicine_id: string;
  pharmacy_name?: string;
  medicine_name?: string;
  generic_name?: string;
  strength?: string;
  form?: string;
  stock_quantity: number;
  price: number;
  status: AvailabilityStatus;
  batch_number?: string;
  expiry_date?: string;
  last_updated?: string;
}

export interface DetectedMedicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  confidence: number;
  matched_medicine_id?: string;
  status: AvailabilityStatus;
  available_pharmacies_count: number;
}

export interface PrescriptionScan {
  id: string;
  image_url: string;
  raw_text: string;
  doctor_name?: string;
  patient_name?: string;
  date?: string;
  detected_medicines: DetectedMedicine[];
  created_at: string;
  status: 'scanning' | 'processed' | 'verified' | string;
}

export interface Reminder {
  id: string;
  user_id?: string;
  medicine_name: string;
  dosage: string;
  time: string;
  frequency: string;
  days_of_week?: string;
  days?: string[];
  start_date: string;
  end_date?: string;
  notes?: string;
  is_active: boolean;
  last_taken?: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  is_emergency?: boolean;
  suggested_questions?: string[];
  referenced_medicine?: string;
}

export interface SearchQueryLog {
  id: string;
  query: string;
  category?: string;
  results_count?: number;
  timestamp: string;
}

export type SearchHistoryItem = SearchQueryLog;

export interface MedicineReservation {
  id: string;
  pickup_token: string;
  medicine_id: string;
  medicine_name: string;
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_address?: string;
  pharmacy_phone?: string;
  patient_name: string;
  patient_phone: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  status: 'reserved' | 'ready' | 'completed' | 'cancelled';
  expires_at: string;
  created_at: string;
}

export interface DrugInteraction {
  id: string;
  drug_a: string;
  drug_b: string;
  severity: 'Severe' | 'Moderate' | 'Mild' | 'Safe / No Interaction';
  effect: string;
  mechanism?: string;
  recommendation: string;
}

export interface GenericSubstitute {
  id: string;
  brand_name: string;
  generic_name: string;
  strength: string;
  substitute_name: string;
  manufacturer: string;
  price: number;
  savings_percentage: number;
  dosage_form: string;
  prescription_required: boolean;
  bioequivalent: boolean;
}

export interface AdminStats {
  total_medicines: number;
  total_pharmacies: number;
  total_inventory_items: number;
  total_users: number;
  total_searches: number;
  low_stock_count: number;
  unavailable_count: number;
  active_reminders_count: number;
  prescriptions_scanned_count: number;
  active_reservations_count?: number;
}
