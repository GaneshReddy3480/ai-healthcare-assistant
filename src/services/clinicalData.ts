import { DrugInteraction, GenericSubstitute, MedicineReservation } from '../types';

export const INITIAL_GENERIC_SUBSTITUTES: Record<string, GenericSubstitute[]> = {
  'med-1': [ // Paracetamol 500mg (GSK - $3.50)
    {
      id: 'sub-1a',
      brand_name: 'Paracetamol 500mg',
      generic_name: 'Acetaminophen / Paracetamol',
      strength: '500 mg',
      substitute_name: 'Jan Aushadhi Paracetamol',
      manufacturer: 'BPPI / PMBJP Labs',
      price: 0.90,
      savings_percentage: 74,
      dosage_form: 'Tablet',
      prescription_required: false,
      bioequivalent: true
    },
    {
      id: 'sub-1b',
      brand_name: 'Paracetamol 500mg',
      generic_name: 'Acetaminophen / Paracetamol',
      strength: '500 mg',
      substitute_name: 'Micro Labs Pacimol 500',
      manufacturer: 'Micro Labs Ltd.',
      price: 1.60,
      savings_percentage: 54,
      dosage_form: 'Tablet',
      prescription_required: false,
      bioequivalent: true
    },
    {
      id: 'sub-1c',
      brand_name: 'Paracetamol 500mg',
      generic_name: 'Acetaminophen / Paracetamol',
      strength: '500 mg',
      substitute_name: 'Cipla Calpol 500',
      manufacturer: 'Cipla Ltd.',
      price: 2.10,
      savings_percentage: 40,
      dosage_form: 'Tablet',
      prescription_required: false,
      bioequivalent: true
    }
  ],
  'med-4': [ // Amoxicillin + Clavulanic Acid 625mg (GSK Augmentin - $14.50)
    {
      id: 'sub-4a',
      brand_name: 'Amoxicillin + Clavulanic Acid 625mg',
      generic_name: 'Amoxicillin & Potassium Clavulanate',
      strength: '625 mg',
      substitute_name: 'Moxclav 625',
      manufacturer: 'Sun Pharmaceutical Industries',
      price: 6.80,
      savings_percentage: 53,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    },
    {
      id: 'sub-4b',
      brand_name: 'Amoxicillin + Clavulanic Acid 625mg',
      generic_name: 'Amoxicillin & Potassium Clavulanate',
      strength: '625 mg',
      substitute_name: 'Clavam 625',
      manufacturer: 'Alkem Laboratories',
      price: 7.20,
      savings_percentage: 50,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    },
    {
      id: 'sub-4c',
      brand_name: 'Amoxicillin + Clavulanic Acid 625mg',
      generic_name: 'Amoxicillin & Potassium Clavulanate',
      strength: '625 mg',
      substitute_name: 'Jan Aushadhi Amox-Clav 625',
      manufacturer: 'PMBJP Pharma Co.',
      price: 3.50,
      savings_percentage: 76,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    }
  ],
  'med-3': [ // Azithromycin 500mg (Pfizer - $12.80)
    {
      id: 'sub-3a',
      brand_name: 'Azithromycin 500mg',
      generic_name: 'Azithromycin',
      strength: '500 mg',
      substitute_name: 'Azee 500',
      manufacturer: 'Cipla Ltd.',
      price: 5.90,
      savings_percentage: 54,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    },
    {
      id: 'sub-3b',
      brand_name: 'Azithromycin 500mg',
      generic_name: 'Azithromycin',
      strength: '500 mg',
      substitute_name: 'Azithral 500',
      manufacturer: 'Alembic Pharmaceuticals',
      price: 6.40,
      savings_percentage: 50,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    }
  ],
  'med-5': [ // Metformin 500mg SR (Sun Pharma - $5.10)
    {
      id: 'sub-5a',
      brand_name: 'Metformin 500mg SR',
      generic_name: 'Metformin Hydrochloride (SR)',
      strength: '500 mg',
      substitute_name: 'Glycomet 500 SR',
      manufacturer: 'USV Private Limited',
      price: 2.20,
      savings_percentage: 57,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    },
    {
      id: 'sub-5b',
      brand_name: 'Metformin 500mg SR',
      generic_name: 'Metformin Hydrochloride (SR)',
      strength: '500 mg',
      substitute_name: 'Obimet 500 SR',
      manufacturer: 'Abbott Healthcare',
      price: 2.60,
      savings_percentage: 49,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    }
  ],
  'med-6': [ // Atorvastatin 20mg ($8.40)
    {
      id: 'sub-6a',
      brand_name: 'Atorvastatin 20mg',
      generic_name: 'Atorvastatin Calcium',
      strength: '20 mg',
      substitute_name: 'Atorva 20',
      manufacturer: 'Zydus Lifesciences',
      price: 3.90,
      savings_percentage: 53,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    },
    {
      id: 'sub-6b',
      brand_name: 'Atorvastatin 20mg',
      generic_name: 'Atorvastatin Calcium',
      strength: '20 mg',
      substitute_name: 'Lipitor Generic 20',
      manufacturer: 'Lupin Pharma',
      price: 4.20,
      savings_percentage: 50,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    }
  ],
  'med-8': [ // Pantoprazole 40mg ($6.30)
    {
      id: 'sub-8a',
      brand_name: 'Pantoprazole 40mg',
      generic_name: 'Pantoprazole Sodium Gastro-resistant',
      strength: '40 mg',
      substitute_name: 'Pan 40',
      manufacturer: 'Alkem Laboratories',
      price: 3.10,
      savings_percentage: 51,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    },
    {
      id: 'sub-8b',
      brand_name: 'Pantoprazole 40mg',
      generic_name: 'Pantoprazole Sodium Gastro-resistant',
      strength: '40 mg',
      substitute_name: 'Pantocid 40',
      manufacturer: 'Sun Pharma',
      price: 3.40,
      savings_percentage: 46,
      dosage_form: 'Tablet',
      prescription_required: true,
      bioequivalent: true
    }
  ]
};

export const CLINICAL_INTERACTION_RULES: DrugInteraction[] = [
  {
    id: 'int-1',
    drug_a: 'Paracetamol',
    drug_b: 'Alcohol',
    severity: 'Severe',
    effect: 'Increased risk of severe hepatotoxicity (liver injury)',
    mechanism: 'Alcohol induces CYP2E1 enzyme, causing higher accumulation of toxic paracetamol metabolite NAPQI.',
    recommendation: 'Strictly avoid chronic or excessive alcohol when taking paracetamol (>2g/day).'
  },
  {
    id: 'int-2',
    drug_a: 'Azithromycin',
    drug_b: 'Antacids (Aluminum / Magnesium)',
    severity: 'Moderate',
    effect: 'Decreased rate of azithromycin absorption and peak serum concentration',
    mechanism: 'Antacid polyvalent cations bind and delay antibiotic absorption.',
    recommendation: 'Separate doses by at least 2 hours before or 4 hours after taking antacids.'
  },
  {
    id: 'int-3',
    drug_a: 'Metformin',
    drug_b: 'Alcohol',
    severity: 'Severe',
    effect: 'Increased risk of acute lactic acidosis and severe hypoglycemia',
    mechanism: 'Ethanol inhibits hepatic gluconeogenesis and increases serum lactate levels.',
    recommendation: 'Avoid binge drinking while on metformin therapy.'
  },
  {
    id: 'int-4',
    drug_a: 'Atorvastatin',
    drug_b: 'Azithromycin',
    severity: 'Moderate',
    effect: 'Potential increase in atorvastatin plasma concentrations leading to myopathy risk',
    mechanism: 'Weak CYP3A4 / P-glycoprotein competition.',
    recommendation: 'Monitor for unexplained muscle tenderness, pain, or weakness.'
  },
  {
    id: 'int-5',
    drug_a: 'Amoxicillin + Clavulanic Acid',
    drug_b: 'Methotrexate',
    severity: 'Severe',
    effect: 'Inhibition of renal tubular secretion of methotrexate leading to toxicity',
    mechanism: 'Penicillins reduce methotrexate renal clearance.',
    recommendation: 'Close hematologic monitoring or avoid combination.'
  },
  {
    id: 'int-6',
    drug_a: 'Salbutamol Inhaler',
    drug_b: 'Beta-Blockers (e.g., Propranolol, Atenolol)',
    severity: 'Severe',
    effect: 'Mutual antagonism and risk of severe bronchospasm in asthma patients',
    mechanism: 'Non-selective beta-blockers block beta-2 pulmonary receptors targeted by salbutamol.',
    recommendation: 'Beta-blockers are contraindicated in patients requiring bronchodilators.'
  },
  {
    id: 'int-7',
    drug_a: 'Pantoprazole',
    drug_b: 'Atorvastatin',
    severity: 'Safe / No Interaction',
    effect: 'No significant pharmacokinetic or pharmacodynamic contraindications detected',
    mechanism: 'Independent metabolic pathways.',
    recommendation: 'Can be taken concurrently as directed by your physician.'
  },
  {
    id: 'int-8',
    drug_a: 'Paracetamol',
    drug_b: 'Cetirizine',
    severity: 'Safe / No Interaction',
    effect: 'Safe combination for pain relief and allergy symptom management',
    mechanism: 'No adverse receptor or metabolic competition.',
    recommendation: 'Safe to take together; follow standard dosage intervals.'
  },
  {
    id: 'int-9',
    drug_a: 'Cetirizine',
    drug_b: 'Alcohol / Sedatives',
    severity: 'Moderate',
    effect: 'Additive central nervous system depression and increased drowsiness',
    mechanism: 'Potentiation of CNS sedative effects.',
    recommendation: 'Avoid alcohol and caution with driving or operating machinery.'
  },
  {
    id: 'int-10',
    drug_a: 'Pantoprazole',
    drug_b: 'Amoxicillin + Clavulanic Acid',
    severity: 'Safe / No Interaction',
    effect: 'Standard clinical co-prescription for H. pylori eradication and GI protection',
    mechanism: 'Pantoprazole stabilizes gastric pH improving antibiotic efficacy.',
    recommendation: 'Take pantoprazole 30 minutes before breakfast; take antibiotic with food.'
  }
];

export const INITIAL_RESERVATIONS: MedicineReservation[] = [
  {
    id: 'res-101',
    pickup_token: 'MED-7842',
    medicine_id: 'med-1',
    medicine_name: 'Paracetamol 500mg',
    pharmacy_id: 'pharm-1',
    pharmacy_name: 'Apollo 24/7 Pharmacy - Connaught Place',
    pharmacy_address: 'Block B, Inner Circle, Connaught Place, New Delhi',
    pharmacy_phone: '+91 11 2341 5566',
    patient_name: 'Nikhil Vardhan',
    patient_phone: '+91 98765 43210',
    quantity: 2,
    price_per_unit: 3.50,
    total_price: 7.00,
    status: 'ready',
    expires_at: '2026-08-14T06:30:00Z',
    created_at: '2026-08-14T02:30:00Z'
  },
  {
    id: 'res-102',
    pickup_token: 'MED-9312',
    medicine_id: 'med-4',
    medicine_name: 'Amoxicillin + Clavulanic Acid 625mg',
    pharmacy_id: 'pharm-2',
    pharmacy_name: 'Fortis HealthWorld Pharmacy',
    pharmacy_address: 'Sector 44, Opposite Epicentre, Gurugram',
    pharmacy_phone: '+91 124 456 7890',
    patient_name: 'Nikhil Vardhan',
    patient_phone: '+91 98765 43210',
    quantity: 1,
    price_per_unit: 14.50,
    total_price: 14.50,
    status: 'reserved',
    expires_at: '2026-08-14T05:45:00Z',
    created_at: '2026-08-14T01:45:00Z'
  }
];
