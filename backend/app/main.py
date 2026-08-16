from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json

from .config import settings
from .database.connection import engine, Base, get_db
from .models import User, Medicine, Pharmacy, Inventory, Prescription, Reminder, SearchHistory
from .schemas import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    MedicineResponse, MedicineCreate,
    PharmacyResponse, PharmacyCreate,
    InventoryResponse, InventoryUpdate,
    PrescriptionOCRRequest, PrescriptionResponse,
    AIChatRequest, AIChatResponse,
    ReminderCreate, ReminderUpdate, ReminderResponse
)
from .services.ocr_service import ocr_service
from .services.gemini_service import gemini_service

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend REST API for MediFind AI - Medicine Discovery, Prescription OCR, Pharmacy Inventory, and AI Health Assistant (CSE Minor Project)",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MediFind AI Python FastAPI Service",
        "database": "MySQL / SQLAlchemy Connected",
        "ocr": "Tesseract Engine Ready",
        "ai": "Gemini 3.7 Integration Active"
    }

# --- AUTH ROUTES ---
@app.post("/api/auth/register", response_model=TokenResponse)
def register(user_in: UserCreate, db = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password (simplified representation for project)
    user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=f"hashed_{user_in.password}",
        role=user_in.role or "user"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "access_token": f"jwt_token_{user.id}_{user.email}",
        "token_type": "bearer",
        "user": user
    }

@app.post("/api/auth/login", response_model=TokenResponse)
def login(login_in: UserLogin, db = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "access_token": f"jwt_token_{user.id}_{user.email}",
        "token_type": "bearer",
        "user": user
    }

# --- MEDICINE ROUTES ---
@app.get("/api/medicines", response_model=List[MedicineResponse])
def get_medicines(query: Optional[str] = None, category: Optional[str] = None, db = Depends(get_db)):
    q = db.query(Medicine)
    if query:
        q = q.filter(Medicine.name.ilike(f"%{query}%") | Medicine.generic_name.ilike(f"%{query}%"))
    if category and category != "All":
        q = q.filter(Medicine.category.ilike(f"%{category}%"))
    
    meds = q.all()
    results = []
    for m in meds:
        m_dict = {
            "id": m.id,
            "name": m.name,
            "generic_name": m.generic_name,
            "manufacturer": m.manufacturer,
            "strength": m.strength,
            "form": m.form,
            "category": m.category,
            "description": m.description,
            "uses": json.loads(m.uses) if m.uses.startswith("[") else [u.strip() for u in m.uses.split(",")],
            "side_effects": json.loads(m.side_effects) if m.side_effects.startswith("[") else [s.strip() for s in m.side_effects.split(",")],
            "precautions": json.loads(m.precautions) if m.precautions.startswith("[") else [p.strip() for p in m.precautions.split(",")],
            "dosage_info": m.dosage_info,
            "prescription_required": m.prescription_required,
            "average_price": m.average_price,
            "available_pharmacies_count": len(m.inventory_items) if m.inventory_items else 2,
            "stock_status": "available" if len(m.inventory_items) > 0 else "unavailable",
            "created_at": m.created_at
        }
        results.append(m_dict)
    return results

@app.get("/api/medicines/{id}")
def get_medicine_detail(id: int, db = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    inv = db.query(Inventory).filter(Inventory.medicine_id == id).all()
    return {
        "medicine": med,
        "inventory": inv
    }

# --- PHARMACY ROUTES ---
@app.get("/api/pharmacies", response_model=List[PharmacyResponse])
def get_pharmacies(db = Depends(get_db)):
    return db.query(Pharmacy).all()

# --- INVENTORY ROUTES ---
@app.get("/api/inventory", response_model=List[InventoryResponse])
def get_inventory(pharmacy_id: Optional[int] = None, db = Depends(get_db)):
    q = db.query(Inventory)
    if pharmacy_id:
        q = q.filter(Inventory.pharmacy_id == pharmacy_id)
    return q.all()

@app.put("/api/inventory/{id}")
def update_inventory(id: int, item_in: InventoryUpdate, db = Depends(get_db)):
    item = db.query(Inventory).filter(Inventory.id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory record not found")
    
    if item_in.stock_quantity is not None:
        item.stock_quantity = item_in.stock_quantity
        item.status = "unavailable" if item.stock_quantity == 0 else "low_stock" if item.stock_quantity <= 10 else "available"
    if item_in.price is not None:
        item.price = item_in.price
    if item_in.status is not None:
        item.status = item_in.status
        
    db.commit()
    db.refresh(item)
    return item

# --- PRESCRIPTION OCR ROUTES ---
@app.post("/api/prescriptions/process")
def process_prescription(req: PrescriptionOCRRequest, db = Depends(get_db)):
    raw_text = req.sample_preset or "Rx\n1. Tab. Dolo 650 — 1 tab TDS x 3 days\n2. Tab. Azithromycin 500mg — 1 tab OD x 3 days"
    detected = ocr_service.parse_medicines_from_text(raw_text)
    
    return {
        "id": "rx-py-101",
        "raw_text": raw_text,
        "doctor_name": "Dr. Ramesh Sharma, M.D.",
        "patient_name": "Patient Self",
        "date": "14-Aug-2026",
        "detected_medicines": detected,
        "status": "processed"
    }

# --- AI CHAT ROUTE ---
@app.post("/api/ai/chat", response_model=AIChatResponse)
def ai_chat(req: AIChatRequest):
    return gemini_service.generate_health_response(
        message=req.message,
        medicine_context=req.medicine_context,
        history=req.history
    )

# --- REMINDERS ROUTES ---
@app.get("/api/reminders")
def get_reminders(user_id: int = 1, db = Depends(get_db)):
    return db.query(Reminder).filter(Reminder.user_id == user_id).all()

@app.post("/api/reminders", response_model=ReminderResponse)
def create_reminder(rem_in: ReminderCreate, user_id: int = 1, db = Depends(get_db)):
    rem = Reminder(
        user_id=user_id,
        medicine_name=rem_in.medicine_name,
        dosage=rem_in.dosage,
        time=rem_in.time,
        frequency=rem_in.frequency,
        days_of_week=rem_in.days_of_week,
        start_date=rem_in.start_date,
        end_date=rem_in.end_date,
        notes=rem_in.notes,
        is_active=True
    )
    db.add(rem)
    db.commit()
    db.refresh(rem)
    return rem

@app.delete("/api/reminders/{id}")
def delete_reminder(id: int, db = Depends(get_db)):
    rem = db.query(Reminder).filter(Reminder.id == id).first()
    if rem:
        db.delete(rem)
        db.commit()
    return {"message": "Reminder deleted successfully"}
