
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime

from app.database.db import get_db
from app.models.plant import Plant as PlantModel, Scan as ScanModel, Treatment as TreatmentModel
from app.schemas.plant_schema import PlantCreate, Plant, AnalysisResponse, Scan as ScanSchema, Treatment as TreatmentSchema, TreatmentCreate
from app.services.ml_service import ml_service
from app.services.image_service import ImageProcessingService
from app.core.config import settings

router = APIRouter()

@router.post("/treatments/", response_model=TreatmentSchema)
def create_treatment(treatment: TreatmentCreate, db: Session = Depends(get_db)):
    db_treatment = TreatmentModel(**treatment.dict())
    db.add(db_treatment)
    db.commit()
    db.refresh(db_treatment)
    return db_treatment

@router.get("/treatments/{plant_id}", response_model=List[TreatmentSchema])
def get_treatments(plant_id: int, db: Session = Depends(get_db)):
    return db.query(TreatmentModel).filter(TreatmentModel.plant_id == plant_id).all()

@router.put("/treatments/{treatment_id}", response_model=TreatmentSchema)
def update_treatment(treatment_id: int, treatment_data: dict, db: Session = Depends(get_db)):
    db_treatment = db.query(TreatmentModel).filter(TreatmentModel.id == treatment_id).first()
    if not db_treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    
    for key, value in treatment_data.items():
        setattr(db_treatment, key, value)
    
    db.commit()
    db.refresh(db_treatment)
    return db_treatment

@router.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...), 
    estimated_distance: Optional[str] = Form(None), # Change to str to handle empty values
    device_info: Optional[str] = Form(None),
    gps_location: Optional[str] = Form(None),
    plant_name: Optional[str] = Form(None),
    plant_type: Optional[str] = Form(None),
    growth_stage: Optional[str] = Form(None),
    location_type: Optional[str] = Form(None),
    symptoms: Optional[str] = Form(None),
    sunlight: Optional[str] = Form(None),
    watering: Optional[str] = Form(None),
    soil_type: Optional[str] = Form(None),
    temperature: Optional[str] = Form(None), # Change to str
    treatment_medicine: Optional[str] = Form(None),
    treatment_dosage: Optional[str] = Form(None),
    treatment_method: Optional[str] = Form(None),
    reference_object_confirmed: Optional[int] = Form(0),
    db: Session = Depends(get_db)
):
    try:
        # Safe conversion of numeric fields
        dist_val = None
        if estimated_distance and estimated_distance.strip():
            try:
                dist_val = float(estimated_distance)
            except ValueError:
                pass
                
        temp_val = None
        if temperature and temperature.strip():
            try:
                temp_val = float(temperature)
            except ValueError:
                pass

        # 1. Save uploaded file
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(settings.UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        # 2. Run ML Model for Disease Prediction
        prediction = ml_service.predict(file_path)
        
        # 3. Estimate Height using OpenCV
        height = ImageProcessingService.estimate_height(file_path)
        
        # 4. Analyze Health (Color Analysis)
        health_score = ImageProcessingService.analyze_leaf_color(file_path)

        # 5. Create/Find Plant and Save Scan
        target_plant = None
        if plant_name:
            target_plant = db.query(PlantModel).filter(PlantModel.name == plant_name).first()
            if not target_plant:
                target_plant = PlantModel(name=plant_name, species=plant_type or "Unknown")
                db.add(target_plant)
                db.commit()
                db.refresh(target_plant)

        if target_plant:
            db_scan = ScanModel(
                plant_id=target_plant.id,
                height=height,
                disease=prediction["disease"],
                confidence=prediction["confidence"],
                health_score=health_score,
                image_path=file_name,
                estimated_distance=dist_val,
                device_info=device_info,
                gps_location=gps_location,
                growth_stage=growth_stage,
                location_type=location_type,
                symptoms=symptoms,
                sunlight=sunlight,
                watering=watering,
                soil_type=soil_type,
                temp=temp_val,  # Corrected from 'temperature' to 'temp'
                treatment_medicine=treatment_medicine,
                treatment_dosage=treatment_dosage,
                treatment_method=treatment_method,
                treatment_start_date=None, # Explicitly safe for now
                treatment_stop_date=None,
                reference_object_confirmed=reference_object_confirmed,
                created_at=datetime.utcnow()
            )
            db.add(db_scan)
            db.commit()

        return {
            "height": height,
            "disease": prediction["disease"],
            "confidence": prediction["confidence"],
            "health_score": health_score,
            "image_path": file_name,
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        import traceback
        traceback.print_exc() # Log to console
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/plants/", response_model=Plant)
def create_plant(plant: PlantCreate, db: Session = Depends(get_db)):
    db_plant = PlantModel(**plant.dict())
    db.add(db_plant)
    db.commit()
    db.refresh(db_plant)
    return db_plant

@router.get("/plants/", response_model=List[Plant])
def read_plants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(PlantModel).offset(skip).limit(limit).all()

@router.get("/plants/{plant_id}", response_model=Plant)
def read_plant(plant_id: int, db: Session = Depends(get_db)):
    plant = db.query(PlantModel).filter(PlantModel.id == plant_id).first()
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant

@router.get("/growth-history/{plant_id}", response_model=List[ScanSchema])
def get_growth_history(plant_id: int, db: Session = Depends(get_db)):
    scans = db.query(ScanModel).filter(ScanModel.plant_id == plant_id).order_by(ScanModel.created_at.asc()).all()
    return scans

@router.post("/add-record", response_model=ScanSchema)
def add_scan_record(scan_data: ScanSchema, db: Session = Depends(get_db)):
    # This might be called after /analyze-image to commit the result to a specific plant
    db_scan = ScanModel(**scan_data.dict())
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    return db_scan
