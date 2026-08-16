"""
Database Seeding Script for MediFind AI (MySQL / SQLite)
Run: python -m backend.seed_data
"""
import json
from datetime import datetime
from backend.app.database.connection import SessionLocal, engine, Base
from backend.app.models import User, Medicine, Pharmacy, Inventory, Reminder

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Medicine).first():
        print("Database already contains data. Skipping seed.")
        db.close()
        return

    print("Seeding MediFind AI database...")

    # Seed Admin and Pharmacist users
    admin = User(name="System Administrator", email="admin@medifind.ai", password_hash="hashed_admin123", role="admin")
    pharmacist = User(name="Apollo Chemist Lead", email="pharmacist@apollo.com", password_hash="hashed_pharm123", role="pharmacist")
    patient = User(name="Nikhil Vardhan", email="patient@medifind.ai", phone="+91 9876543210", password_hash="hashed_pass123", role="user")
    db.add_all([admin, pharmacist, patient])
    db.commit()

    # Seed Pharmacies
    p1 = Pharmacy(
        name="Apollo 24|7 Pharmacy — Metro Heights",
        address="Shop 4-5, Ground Floor, Metro Heights, 100ft Ring Road",
        city="Bengaluru", state="Karnataka", postal_code="560078",
        phone="+91 80 2658 9100", email="metroheights@apollopharmacy.org",
        latitude=12.9716, longitude=77.5946, rating=4.8, reviews_count=320,
        opening_hours="24 Hours Open", is_open_now=True, is_24x7=True
    )
    p2 = Pharmacy(
        name="MedPlus Health & Chemist",
        address="No. 42, 12th Main, 4th Block, Koramangala",
        city="Bengaluru", state="Karnataka", postal_code="560034",
        phone="+91 80 4123 5588", email="koramangala@medplusindia.com",
        latitude=12.9352, longitude=77.6245, rating=4.6, reviews_count=215,
        opening_hours="7:30 AM – 11:00 PM", is_open_now=True, is_24x7=False
    )
    p3 = Pharmacy(
        name="Wellness Forever Day & Night Chemists",
        address="Plot 18, 80ft Road, Indiranagar",
        city="Bengaluru", state="Karnataka", postal_code="560038",
        phone="+91 80 2520 8899", email="indiranagar@wellnessforever.in",
        latitude=12.9784, longitude=77.6408, rating=4.9, reviews_count=480,
        opening_hours="24 Hours Open", is_open_now=True, is_24x7=True
    )
    db.add_all([p1, p2, p3])
    db.commit()

    # Seed Medicines
    m1 = Medicine(
        name="Paracetamol 500mg", generic_name="Acetaminophen / Paracetamol",
        manufacturer="GSK Pharmaceuticals", strength="500 mg", form="Tablet",
        category="Analgesics & Antipyretics",
        description="Paracetamol is a widely used pain reliever and fever reducer.",
        uses=json.dumps(["Headache", "Fever", "Muscle aches"]),
        side_effects=json.dumps(["Rare nausea", "Liver strain with overdose"]),
        precautions=json.dumps(["Do not exceed 4g/day", "Avoid alcohol"]),
        dosage_info="1-2 tablets every 4-6 hours as needed. Max 4000mg/day.",
        prescription_required=False, average_price=3.50
    )
    m2 = Medicine(
        name="Azithromycin 500mg", generic_name="Azithromycin",
        manufacturer="Pfizer Inc.", strength="500 mg", form="Tablet",
        category="Antibiotics (Macrolide)",
        description="Macrolide antibiotic used for respiratory and bacterial infections.",
        uses=json.dumps(["Sinusitis", "Pneumonia", "Tonsillitis"]),
        side_effects=json.dumps(["Loose stools", "Nausea", "Abdominal cramps"]),
        precautions=json.dumps(["Complete full course", "Take before food"]),
        dosage_info="500mg once daily for 3 to 5 days as prescribed.",
        prescription_required=True, average_price=12.80
    )
    m3 = Medicine(
        name="Cetirizine 10mg", generic_name="Cetirizine Hydrochloride",
        manufacturer="Dr. Reddy's", strength="10 mg", form="Tablet",
        category="Antihistamines",
        description="Second generation antihistamine for allergy relief.",
        uses=json.dumps(["Allergic rhinitis", "Hives", "Sneezing", "Watery eyes"]),
        side_effects=json.dumps(["Mild drowsiness", "Dry mouth"]),
        precautions=json.dumps(["Caution while driving", "Avoid alcohol"]),
        dosage_info="10mg once daily in the evening.",
        prescription_required=False, average_price=4.20
    )
    db.add_all([m1, m2, m3])
    db.commit()

    # Seed Inventory
    inv1 = Inventory(pharmacy_id=p1.id, medicine_id=m1.id, stock_quantity=120, price=3.20, status="available", batch_number="PCM-01")
    inv2 = Inventory(pharmacy_id=p2.id, medicine_id=m1.id, stock_quantity=80, price=3.50, status="available", batch_number="PCM-02")
    inv3 = Inventory(pharmacy_id=p1.id, medicine_id=m2.id, stock_quantity=35, price=12.50, status="available", batch_number="AZ-90")
    inv4 = Inventory(pharmacy_id=p3.id, medicine_id=m2.id, stock_quantity=20, price=12.80, status="available", batch_number="AZ-91")
    db.add_all([inv1, inv2, inv3, inv4])
    db.commit()

    # Seed Reminders
    rem1 = Reminder(
        user_id=patient.id, medicine_name="Pantoprazole 40mg", dosage="1 Tablet",
        time="07:30 AM", frequency="Daily", days_of_week="Mon,Tue,Wed,Thu,Fri,Sat,Sun",
        start_date="2026-08-01", notes="Take on empty stomach 30 mins before breakfast."
    )
    db.add(rem1)
    db.commit()

    print("Seed completed successfully!")
    db.close()

if __name__ == "__main__":
    seed()
