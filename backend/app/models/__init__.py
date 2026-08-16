from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user") # 'user', 'pharmacist', 'admin'
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    prescriptions = relationship("Prescription", back_populates="user")
    reminders = relationship("Reminder", back_populates="user")
    search_history = relationship("SearchHistory", back_populates="user")
    pharmacy = relationship("Pharmacy", back_populates="staff_users")

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    generic_name = Column(String(150), index=True, nullable=False)
    manufacturer = Column(String(150), nullable=False)
    strength = Column(String(50), nullable=False)
    form = Column(String(50), nullable=False) # Tablet, Capsule, Syrup, etc.
    category = Column(String(100), index=True, nullable=False)
    description = Column(Text, nullable=False)
    uses = Column(Text, nullable=False) # JSON or comma separated
    side_effects = Column(Text, nullable=False)
    precautions = Column(Text, nullable=False)
    dosage_info = Column(Text, nullable=False)
    prescription_required = Column(Boolean, default=False)
    average_price = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory_items = relationship("Inventory", back_populates="medicine")

class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), index=True, nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(120), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Float, default=4.5)
    reviews_count = Column(Integer, default=0)
    opening_hours = Column(String(100), default="8:00 AM - 10:00 PM")
    is_open_now = Column(Boolean, default=True)
    is_24x7 = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    inventory_items = relationship("Inventory", back_populates="pharmacy")
    staff_users = relationship("User", back_populates="pharmacy")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    pharmacy_id = Column(Integer, ForeignKey("pharmacies.id"), nullable=False)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False)
    stock_quantity = Column(Integer, default=0)
    price = Column(Float, nullable=False)
    status = Column(String(30), default="available") # 'available', 'low_stock', 'unavailable'
    batch_number = Column(String(50), nullable=True)
    expiry_date = Column(String(30), nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pharmacy = relationship("Pharmacy", back_populates="inventory_items")
    medicine = relationship("Medicine", back_populates="inventory_items")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String(255), nullable=True)
    raw_ocr_text = Column(Text, nullable=True)
    doctor_name = Column(String(100), nullable=True)
    patient_name = Column(String(100), nullable=True)
    detected_medicines_json = Column(Text, nullable=True)
    status = Column(String(30), default="processed") # 'processed', 'verified'
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="prescriptions")

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    medicine_name = Column(String(150), nullable=False)
    dosage = Column(String(50), nullable=False)
    time = Column(String(20), nullable=False) # e.g. "08:00 AM"
    frequency = Column(String(50), default="Daily")
    days_of_week = Column(String(100), default="Mon,Tue,Wed,Thu,Fri,Sat,Sun")
    start_date = Column(String(30), nullable=False)
    end_date = Column(String(30), nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    last_taken = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reminders")

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    query = Column(String(200), nullable=False)
    category = Column(String(50), default="medicine")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="search_history")
