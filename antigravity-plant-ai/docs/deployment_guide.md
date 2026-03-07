# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local dev)
- Python 3.11+ (for local dev)

## Quick Start (Docker)

1. **Build and Run**:
   ```bash
   docker-compose up --build
   ```
2. **Access**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`

## Manual Deployment

### Backend
1. Navigate to `/backend`
2. Create virtual env: `python -m venv .venv`
3. Activate:
   - Windows: `.\.venv\Scripts\activate`
   - Linux/Mac: `source .venv/bin/activate`
4. Install: `pip install -r requirements.txt`
5. Run: `uvicorn app.main:app --reload`

### Frontend
1. Navigate to `/frontend`
2. Install: `npm install`
3. Run: `npm run dev`

## Environment Variables
Create a `.env` file in the root:
```ini
PROJECT_NAME="Antigravity Plant AI"
DATABASE_URL="sqlite:///./sql_app.db"
```
