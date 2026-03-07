
import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AgriRakshak - Smart Plant Monitoring"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    MODEL_PATH: str = os.path.join(BASE_DIR, "ai-model", "models", "plant_disease_model.h5")
    
    # ML Config
    ALLOWED_EXTENSIONS: List[str] = ["jpg", "jpeg", "png"]
    IMAGE_SIZE: int = 224 # VGG16/MobileNet default
    
    # Security
    SECRET_KEY: str = "YOUR_SUPER_SECRET_KEY_HERE" # In prod, use .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
