
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ScanBase(BaseModel):
    height: float
    disease: str
    confidence: float
    health_score: float
    moisture: Optional[float] = None
    temp: Optional[float] = None
    light: Optional[float] = None
    
    # New metadata fields
    estimated_distance: Optional[float] = None
    device_info: Optional[str] = None
    gps_location: Optional[str] = None
    growth_stage: Optional[str] = None
    location_type: Optional[str] = None
    symptoms: Optional[str] = None
    sunlight: Optional[str] = None
    watering: Optional[str] = None
    soil_type: Optional[str] = None
    treatment_medicine: Optional[str] = None
    treatment_dosage: Optional[str] = None
    treatment_method: Optional[str] = None
    treatment_start_date: Optional[datetime] = None
    treatment_stop_date: Optional[datetime] = None
    reference_object_confirmed: Optional[bool] = False

    user_medicine_record: Optional[str] = None
    other_details: Optional[str] = None

class ScanCreate(ScanBase):
    plant_id: int
    image_path: str

class Scan(ScanBase):
    id: int
    plant_id: int
    image_path: str
    created_at: datetime

    class Config:
        from_attributes = True

class PlantBase(BaseModel):
    name: str
    species: str
    status: str = "Healthy"
    image_url: Optional[str] = None
    growth_requirements: Optional[str] = None
    homeopathic_remedies: Optional[str] = None
    other_applications: Optional[str] = None

class PlantCreate(PlantBase):
    pass

class Plant(PlantBase):
    id: int
    created_at: datetime
    scans: List[Scan] = []
    treatments: List['Treatment'] = []

    class Config:
        from_attributes = True

class TreatmentBase(BaseModel):
    medicine_name: str
    dosage: str
    method: str
    notes: Optional[str] = None
    pre_health_score: Optional[float] = None
    post_health_score: Optional[float] = None
    pre_image_path: Optional[str] = None
    post_image_path: Optional[str] = None
    status: str = "In Progress"

class TreatmentCreate(TreatmentBase):
    plant_id: int

class Treatment(TreatmentBase):
    id: int
    plant_id: int
    date_applied: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    height: float
    disease: str
    confidence: float
    health_score: float
    image_path: str
    timestamp: datetime
    
    # Metadata fields reproduced for the response if needed
    estimated_distance: Optional[float] = None
    device_info: Optional[str] = None
    gps_location: Optional[str] = None
    growth_stage: Optional[str] = None
    location_type: Optional[str] = None
    symptoms: Optional[str] = None
    sunlight: Optional[str] = None
    watering: Optional[str] = None
    soil_type: Optional[str] = None
    treatment_medicine: Optional[str] = None
    treatment_dosage: Optional[str] = None
    treatment_method: Optional[str] = None
    reference_object_confirmed: Optional[bool] = False

    user_medicine_record: Optional[str] = None
    other_details: Optional[str] = None
