import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserByUid, updateUserProfile } from './src/db/users.ts';
import { 
  getUserReminders, 
  insertReminder, 
  deleteReminderById, 
  getUserReservations, 
  insertReservation,
  getSearchHistory,
  insertSearchLog
} from './src/db/queries.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. AI Chat will use fallback educational responses.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MediFind AI Health & Medicine Discovery Platform',
    version: '1.0.0 (CSE Minor Project)',
    time: new Date().toISOString()
  });
});

// In-memory user profile data storage on server
let serverUserProfile = {
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

let serverUserSettings = {
  reminder_notifications: true,
  sound_alerts: true,
  distance_unit: 'km',
  auto_save_search_history: true,
  ai_detail_level: 'standard',
  emergency_sos_number: '108'
};

let serverSearchHistory = [
  { id: 'sh-1', query: 'Paracetamol 500mg', category: 'medicine', results_count: 5, timestamp: '2 hours ago' },
  { id: 'sh-2', query: 'Azithromycin nearby', category: 'pharmacy', results_count: 3, timestamp: 'Yesterday' },
  { id: 'sh-3', query: 'Apollo Pharmacy 24/7', category: 'pharmacy', results_count: 8, timestamp: '2 days ago' }
];

// USER PROFILE API ROUTES
app.get('/api/user/profile', (req, res) => {
  res.json({ profile: serverUserProfile, success: true });
});

app.put('/api/user/profile', (req, res) => {
  try {
    const { name, email, phone, blood_group, allergies, emergency_contact, address, date_of_birth } = req.body;
    
    if (name) serverUserProfile.name = name;
    if (email) serverUserProfile.email = email;
    if (phone !== undefined) serverUserProfile.phone = phone;
    if (blood_group !== undefined) serverUserProfile.blood_group = blood_group;
    if (allergies !== undefined) serverUserProfile.allergies = allergies;
    if (emergency_contact !== undefined) serverUserProfile.emergency_contact = emergency_contact;
    if (address !== undefined) serverUserProfile.address = address;
    if (date_of_birth !== undefined) serverUserProfile.date_of_birth = date_of_birth;

    res.json({
      message: 'Profile updated successfully',
      profile: serverUserProfile,
      success: true
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user profile', details: err.message });
  }
});

// USER SETTINGS API ROUTES
app.get('/api/user/settings', (req, res) => {
  res.json({ settings: serverUserSettings, success: true });
});

app.put('/api/user/settings', (req, res) => {
  try {
    const updates = req.body;
    serverUserSettings = { ...serverUserSettings, ...updates };
    res.json({
      message: 'Settings updated successfully',
      settings: serverUserSettings,
      success: true
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// USER SEARCH HISTORY API ROUTES
app.get('/api/user/search-history', (req, res) => {
  res.json({ history: serverSearchHistory, success: true });
});

app.delete('/api/user/search-history/:id', (req, res) => {
  const { id } = req.params;
  serverSearchHistory = serverSearchHistory.filter(item => item.id !== id);
  res.json({ message: 'Search history item deleted', history: serverSearchHistory, success: true });
});

app.delete('/api/user/search-history', (req, res) => {
  serverSearchHistory = [];
  res.json({ message: 'All search history cleared', history: [], success: true });
});

// CLOUD SQL & FIREBASE AUTHENTICATED USER ROUTES
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || '';
    const name = (req.user as any)?.name || '';
    if (!uid) {
      return res.status(400).json({ error: 'Missing UID in authenticated token' });
    }
    const dbUser = await getOrCreateUser(uid, email, name);
    res.json({ user: dbUser, success: true });
  } catch (error: any) {
    console.error('Failed to sync auth user to Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to synchronize authenticated user' });
  }
});

app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });
    const dbUser = await getUserByUid(uid);
    res.json({ user: dbUser, success: true });
  } catch (error: any) {
    console.error('Failed to get user profile from Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// CLOUD SQL REMINDERS ENDPOINTS
app.get('/api/db/reminders', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'usr-1';
    const dbReminders = await getUserReminders(userId);
    res.json({ reminders: dbReminders, success: true });
  } catch (error: any) {
    console.error('Failed to fetch reminders from Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

app.post('/api/db/reminders', async (req, res) => {
  try {
    const reminderData = req.body;
    if (!reminderData || !reminderData.medicineName) {
      return res.status(400).json({ error: 'Medicine name is required' });
    }
    const saved = await insertReminder({
      id: reminderData.id || `rem-${Date.now()}`,
      userId: reminderData.userId || 'usr-1',
      medicineName: reminderData.medicineName,
      dosage: reminderData.dosage || '1 unit',
      time: reminderData.time || '08:00 AM',
      frequency: reminderData.frequency || 'Daily',
      daysOfWeek: reminderData.daysOfWeek,
      startDate: reminderData.startDate || new Date().toISOString().split('T')[0],
      endDate: reminderData.endDate,
      notes: reminderData.notes,
      isActive: reminderData.isActive !== false,
    });
    res.json({ reminder: saved, success: true });
  } catch (error: any) {
    console.error('Failed to save reminder in Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to save reminder' });
  }
});

app.delete('/api/db/reminders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || 'usr-1';
    await deleteReminderById(id, userId);
    res.json({ message: 'Reminder deleted from Cloud SQL', success: true });
  } catch (error: any) {
    console.error('Failed to delete reminder in Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// CLOUD SQL RESERVATIONS ENDPOINTS
app.get('/api/db/reservations', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'usr-1';
    const dbReservations = await getUserReservations(userId);
    res.json({ reservations: dbReservations, success: true });
  } catch (error: any) {
    console.error('Failed to fetch reservations from Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

app.post('/api/db/reservations', async (req, res) => {
  try {
    const resData = req.body;
    const saved = await insertReservation({
      id: resData.id || `res-${Date.now()}`,
      userId: resData.userId || 'usr-1',
      medicineId: resData.medicineId || 'med-1',
      pharmacyId: resData.pharmacyId || 'pharm-1',
      medicineName: resData.medicineName || 'Medicine',
      pharmacyName: resData.pharmacyName || 'Pharmacy',
      quantity: resData.quantity || 1,
      status: resData.status || 'confirmed',
      reservedAt: resData.reservedAt || new Date().toISOString(),
      expiresAt: resData.expiresAt || new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
      totalEstimatedCost: resData.totalEstimatedCost || 0,
      tokenCode: resData.tokenCode || `MF-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: resData.notes || '',
    });
    res.json({ reservation: saved, success: true });
  } catch (error: any) {
    console.error('Failed to save reservation in Cloud SQL:', error);
    res.status(500).json({ error: 'Failed to save reservation' });
  }
});

// ADVANCED MEDICINE SEARCH API ROUTE
app.get('/api/medicines/search', (req, res) => {
  try {
    const { 
      q, 
      category, 
      manufacturer, 
      strength, 
      availability, 
      form, 
      rx, 
      max_price, 
      min_price, 
      sort_by 
    } = req.query;

    res.json({
      query_params: { q, category, manufacturer, strength, availability, form, rx, max_price, min_price, sort_by },
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Error querying medicine repository', details: err.message });
  }
});

// AI Health Assistant Route
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, medicine_context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    // Emergency keyword check
    const lower = message.toLowerCase();
    const isEmergency = 
      lower.includes('chest pain') || 
      lower.includes('heart attack') || 
      lower.includes('cannot breathe') || 
      lower.includes('breathing difficulty') || 
      lower.includes('unconscious') || 
      lower.includes('severe bleeding') ||
      lower.includes('anaphylaxis') ||
      lower.includes('overdose') ||
      lower.includes('poison');

    if (isEmergency) {
      return res.json({
        text: `⚠️ **EMERGENCY MEDICAL WARNING**\n\nYour query suggests a potentially life-threatening or acute medical emergency.\n\n**Immediate Actions:**\n1. **Call Emergency Services Immediately** (108 / 112 in India, 911 in US, or your local emergency line).\n2. **Visit the Nearest Emergency Department**.\n3. Do not rely on online tools or wait for symptoms to subside.\n\n*Notice: MediFind AI is an educational reference system and cannot provide emergency clinical triage.*`,
        is_emergency: true,
        suggested_questions: [
          'Emergency helpline numbers',
          'First aid basics while waiting for help',
          'Find nearest 24/7 hospital / pharmacy'
        ]
      });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response if no key configured
      return res.json({
        text: `**MediFind Educational Guide:**\n\nRegarding your question on "${message}":\n\n- **Medication Use:** Always adhere strictly to the dosage and timing specified by your certified physician or clinical pharmacist.\n- **Precautions:** Inform your healthcare provider about any allergies, concurrent medications, or preexisting renal/liver conditions.\n- **Storage:** Maintain medicines in original packaging in a cool, moisture-free location.\n\n*Notice: AI-generated information is for general educational purposes and is not a substitute for advice from a qualified healthcare professional.*`,
        is_emergency: false,
        suggested_questions: [
          'What are the common side effects of this medicine?',
          'Should this be taken with food or on an empty stomach?',
          'What questions should I ask my pharmacist?'
        ]
      });
    }

    const systemInstruction = `You are MediFind AI, an expert, calm, empathetic, and evidence-based healthcare educational assistant built for an engineering minor project.
Your primary role is to help patients understand medicines, dosages, precautions, general wellness concepts, and questions to ask their doctor or pharmacist.

STRICT MEDICAL ETHICS & SAFETY DIRECTIVES:
1. NEVER diagnose illnesses or conditions.
2. NEVER prescribe medications, calculate unverified weight-based pediatric dosages, or suggest changing or discontinuing a prescribed medication.
3. Clearly explain drug classes, mechanisms of action, generic names, common approved uses, typical precautions, and storage guidelines in simple, patient-friendly language.
4. If the user mentions prescription drugs (e.g. antibiotics, antihypertensives, steroids), remind them that a registered medical practitioner's prescription is required.
5. If the query indicates an urgent symptom, emphasize seeking immediate professional medical care.
6. Keep responses well-structured with bullet points and bold headers for easy readability.
7. Always append or maintain a calm, reassuring, professional tone.`;

    let prompt = `User Question: ${message}`;
    if (medicine_context) {
      prompt += `\n[Context: User is currently viewing medicine: ${medicine_context}]`;
    }
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-4).map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
      prompt = `Recent Conversation:\n${recentHistory}\n\n${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const outputText = response.text || 'I apologize, but I could not generate a response at this moment. Please consult your physician or pharmacist.';

    return res.json({
      text: outputText,
      is_emergency: false,
      suggested_questions: [
        'What are common precautions for this medication?',
        'Can this medicine be taken with food or milk?',
        'What should I ask my pharmacist about this prescription?'
      ]
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({
      error: 'Failed to process AI health query',
      details: error.message || 'Unknown error'
    });
  }
});

// Prescription OCR Processing endpoint
app.post('/api/prescriptions/process', async (req, res) => {
  try {
    const { image, samplePreset } = req.body;

    let rawText = samplePreset;

    if (!rawText) {
      // Default sample extraction
      rawText = `Rx
1. Tab. Paracetamol 500mg — 1 tab TDS x 3 days
2. Tab. Azithromycin 500mg — 1 tab OD x 3 days
3. Tab. Cetirizine 10mg — 1 tab HS x 5 days
Adv: Plenty of warm fluids, steam inhalation.`;
    }

    const detectedMedicines = [
      {
        id: 'det-1',
        name: 'Paracetamol 500mg',
        dosage: '500 mg',
        frequency: 'Three times daily (TDS)',
        duration: '3 days',
        confidence: 0.96,
        matched_medicine_id: 'med-1',
        status: 'available',
        available_pharmacies_count: 5
      },
      {
        id: 'det-2',
        name: 'Azithromycin 500mg',
        dosage: '500 mg',
        frequency: 'Once daily (OD)',
        duration: '3 days',
        confidence: 0.92,
        matched_medicine_id: 'med-3',
        status: 'available',
        available_pharmacies_count: 4
      },
      {
        id: 'det-3',
        name: 'Cetirizine 10mg',
        dosage: '10 mg',
        frequency: 'At bedtime (HS)',
        duration: '5 days',
        confidence: 0.94,
        matched_medicine_id: 'med-2',
        status: 'available',
        available_pharmacies_count: 4
      }
    ];

    res.json({
      id: `rx-${Date.now()}`,
      image_url: image || '',
      raw_text: rawText,
      doctor_name: 'Dr. Ramesh Sharma, M.D. (Internal Medicine)',
      patient_name: 'Patient (Self)',
      date: new Date().toLocaleDateString('en-GB'),
      detected_medicines: detectedMedicines,
      created_at: new Date().toISOString(),
      status: 'processed'
    });
  } catch (e: any) {
    console.error('Error processing prescription:', e);
    res.status(500).json({ error: 'Failed to process prescription image' });
  }
});

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediFind AI server running at http://localhost:${PORT}`);
  });
}

startServer();
