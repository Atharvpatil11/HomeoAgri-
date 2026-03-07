
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.db import Base

class Plant(Base):
    __tablename__ = "plants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional link to user
    name = Column(String(255), index=True)
    species = Column(String(255))
    status = Column(String(50), default="Healthy")
    image_url = Column(String(512), nullable=True)
    growth_requirements = Column(Text, nullable=True)
    homeopathic_remedies = Column(Text, nullable=True)
    other_applications = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    scans = relationship("Scan", back_populates="plant", cascade="all, delete-orphan")
    treatments = relationship("Treatment", back_populates="plant", cascade="all, delete-orphan")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"))
    height = Column(Float)
    disease = Column(String(255))
    confidence = Column(Float)
    health_score = Column(Float)
    moisture = Column(Float, nullable=True)
    temp = Column(Float, nullable=True)
    light = Column(Float, nullable=True)
    image_path = Column(String(512))
    
    # New metadata fields
    estimated_distance = Column(Float, nullable=True)
    device_info = Column(String(255), nullable=True)
    gps_location = Column(String(255), nullable=True)
    growth_stage = Column(String(100), nullable=True)
    location_type = Column(String(100), nullable=True) # farm, indoor, greenhouse
    symptoms = Column(Text, nullable=True) # JSON or comma-separated
    sunlight = Column(String(100), nullable=True)
    watering = Column(String(100), nullable=True)
    soil_type = Column(String(100), nullable=True)
    treatment_medicine = Column(String(255), nullable=True)
    treatment_dosage = Column(String(255), nullable=True)
    treatment_method = Column(String(255), nullable=True)
    treatment_start_date = Column(DateTime, nullable=True)
    treatment_stop_date = Column(DateTime, nullable=True)
    reference_object_confirmed = Column(Integer, default=0) # Boolean handled as int (0/1)

    user_medicine_record = Column(Text, nullable=True)
    other_details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    plant = relationship("Plant", back_populates="scans")

class Treatment(Base):
    __tablename__ = "treatments"

    id = Column(Integer, primary_key=True, index=True)
    plant_id = Column(Integer, ForeignKey("plants.id"))
    medicine_name = Column(String(255))
    dosage = Column(String(255))
    method = Column(String(255)) # spray/soil
    date_applied = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    
    # AI Comparison Data
    pre_health_score = Column(Float, nullable=True)
    post_health_score = Column(Float, nullable=True)
    pre_image_path = Column(String(512), nullable=True)
    post_image_path = Column(String(512), nullable=True)
    
    status = Column(String(50), default="In Progress") # In Progress, Completed
    created_at = Column(DateTime, default=datetime.utcnow)

    plant = relationship("Plant", back_populates="treatments")
