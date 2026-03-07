
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from app.api import routes as api_router
from app.api import auth as auth_router
from app.core.config import settings
from app.database.db import engine, Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title="HomoeoPlant AI",
    description="AI-Powered Identification and Analysis for Homoeopathic Medicine Plants",
    version="2.1.0"
)

# CORS setup — NOTE: cannot use "*" with allow_credentials=True (browsers block it)
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploaded images
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routes
app.include_router(api_router.router, prefix=settings.API_V1_STR, tags=["Plants"])
app.include_router(auth_router.router, prefix=settings.API_V1_STR + "/auth", tags=["Authentication"])

@app.get("/")
def read_root():
    return {
        "message": "Welcome to AgriRakshak API",
        "status": "online",
        "version": "2.0.0"
    }
