import { relations } from 'drizzle-orm';
import { boolean, doublePrecision, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (PostgreSQL relational representation keyed by Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  role: text('role').default('user').notNull(),
  bloodGroup: text('blood_group'),
  allergies: text('allergies'), // JSON-serialized string or comma-separated
  address: text('address'),
  dateOfBirth: text('date_of_birth'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Medicines catalog table
export const medicines = pgTable('medicines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  genericName: text('generic_name').notNull(),
  manufacturer: text('manufacturer').notNull(),
  strength: text('strength').notNull(),
  form: text('form').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  uses: text('uses').notNull(), // JSON string array
  sideEffects: text('side_effects').notNull(), // JSON string array
  precautions: text('precautions').notNull(), // JSON string array
  dosageInfo: text('dosage_info').notNull(),
  prescriptionRequired: boolean('prescription_required').default(false).notNull(),
  averagePrice: doublePrecision('average_price').notNull(),
  availablePharmaciesCount: integer('available_pharmacies_count').default(0).notNull(),
  stockStatus: text('stock_status').default('available').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Pharmacies table
export const pharmacies = pgTable('pharmacies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  rating: doublePrecision('rating').default(4.5).notNull(),
  reviewsCount: integer('reviews_count').default(0).notNull(),
  openingHours: text('opening_hours').notNull(),
  isOpenNow: boolean('is_open_now').default(true).notNull(),
  is24x7: boolean('is_24x7').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Pharmacy Inventory mapping table
export const inventory = pgTable('inventory', {
  id: text('id').primaryKey(),
  pharmacyId: text('pharmacy_id').notNull().references(() => pharmacies.id),
  medicineId: text('medicine_id').notNull().references(() => medicines.id),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  price: doublePrecision('price').notNull(),
  status: text('status').default('available').notNull(),
  batchNumber: text('batch_number'),
  expiryDate: text('expiry_date'),
  lastUpdated: timestamp('last_updated').defaultNow(),
});

// Medication reminders
export const reminders = pgTable('reminders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // References Firebase Auth UID
  medicineName: text('medicine_name').notNull(),
  dosage: text('dosage').notNull(),
  time: text('time').notNull(),
  frequency: text('frequency').notNull(),
  daysOfWeek: text('days_of_week'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  lastTaken: text('last_taken'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4-Hour Hold Pharmacy Reservations
export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(), // References Firebase Auth UID
  medicineId: text('medicine_id').notNull().references(() => medicines.id),
  pharmacyId: text('pharmacy_id').notNull().references(() => pharmacies.id),
  medicineName: text('medicine_name').notNull(),
  pharmacyName: text('pharmacy_name').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  status: text('status').default('confirmed').notNull(),
  reservedAt: text('reserved_at').notNull(),
  expiresAt: text('expires_at').notNull(),
  totalEstimatedCost: doublePrecision('total_estimated_cost').notNull(),
  tokenCode: text('token_code').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Search Logs
export const searchLogs = pgTable('search_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  query: text('query').notNull(),
  category: text('category').default('medicine').notNull(),
  resultsCount: integer('results_count').default(0).notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  reminders: many(reminders),
  reservations: many(reservations),
}));

export const medicinesRelations = relations(medicines, ({ many }) => ({
  inventory: many(inventory),
  reservations: many(reservations),
}));

export const pharmaciesRelations = relations(pharmacies, ({ many }) => ({
  inventory: many(inventory),
  reservations: many(reservations),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  pharmacy: one(pharmacies, {
    fields: [inventory.pharmacyId],
    references: [pharmacies.id],
  }),
  medicine: one(medicines, {
    fields: [inventory.medicineId],
    references: [medicines.id],
  }),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  medicine: one(medicines, {
    fields: [reservations.medicineId],
    references: [medicines.id],
  }),
  pharmacy: one(pharmacies, {
    fields: [reservations.pharmacyId],
    references: [pharmacies.id],
  }),
}));
