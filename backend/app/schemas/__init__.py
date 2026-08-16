from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = "user"
    pharmacy_id: Optional[int] = None

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- MEDICINE SCHEMAS ---
class MedicineBase(BaseModel):
    name: str
    generic_name: str
    manufacturer: str
    strength: str
    form: str
    category: str
    description: str
    uses: List[str]
    side_effects: List[str]
    precautions: List[str]
    dosage_info: str
    prescription_required: bool = False
    average_price: float = 0.0

class MedicineCreate(MedicineBase):
    pass

class MedicineResponse(MedicineBase):
    id: int
    available_pharmacies_count: Optional[int] = 0
    stock_status: Optional[str] = "available"
    created_at: datetime
    class Config:
        from_attributes = True

# --- PHARMACY SCHEMAS ---
class PharmacyBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    postal_code: str
    phone: str
    email: Optional[str] = None
    latitude: float
    longitude: float
    rating: float = 4.5
    reviews_count: int = 0
    opening_hours: str = "8:00 AM - 10:00 PM"
    is_open_now: bool = True
    is_24x7: bool = False

class PharmacyCreate(PharmacyBase):
    pass

class PharmacyResponse(PharmacyBase):
    id: int
    distance_km: Optional[float] = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- INVENTORY SCHEMAS ---
class InventoryBase(BaseModel):
    pharmacy_id: int
    medicine_id: int
    stock_quantity: int
    price: float
    status: Optional[str] = "available"
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None

class InventoryUpdate(BaseModel):
    stock_quantity: Optional[int] = None
    price: Optional[float] = None
    status: Optional[str] = None
    batch_number: Optional[str] = None
    expiry_date: Optional[str] = None

class InventoryResponse(InventoryBase):
    id: int
    pharmacy_name: Optional[str] = None
    medicine_name: Optional[str] = None
    generic_name: Optional[str] = None
    strength: Optional[str] = None
    form: Optional[str] = None
    last_updated: datetime
    class Config:
        from_attributes = True

# --- PRESCRIPTION & OCR SCHEMAS ---
class DetectedMedicineSchema(BaseModel):
    id: str
    name: str
    dosage: str
    frequency: str
    duration: str
    confidence: float
    matched_medicine_id: Optional[int] = None
    status: str = "available"
    available_pharmacies_count: int = 1

class PrescriptionOCRRequest(BaseModel):
    image_base64: Optional[str] = None
    sample_preset: Optional[str] = None

class PrescriptionResponse(BaseModel):
    id: str
    raw_text: str
    doctor_name: Optional[str] = None
    patient_name: Optional[str] = None
    date: Optional[str] = None
    detected_medicines: List[DetectedMedicineSchema]
    status: str
    created_at: datetime

# --- AI CHAT SCHEMAS ---
class AIChatRequest(BaseModel):
    message: str
    medicine_context: Optional[str] = None
    history: Optional[List[dict]] = None

class AIChatResponse(BaseModel):
    text: str
    is_emergency: bool = False
    suggested_questions: List[str] = []

# --- REMINDER SCHEMAS ---
class ReminderCreate(BaseModel):
    medicine_name: str
    dosage: str
    time: str
    frequency: str = "Daily"
    days_of_week: Optional[str] = "Mon,Tue,Wed,Thu,Fri,Sat,Sun"
    start_date: str
    end_date: Optional[str] = None
    notes: Optional[str] = None

class ReminderUpdate(BaseModel):
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    time: Optional[str] = None
    frequency: Optional[str] = None
    days_of_week: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    last_taken: Optional[str] = None

class ReminderResponse(ReminderCreate):
    id: int
    user_id: int
    is_active: bool
    last_taken: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True
