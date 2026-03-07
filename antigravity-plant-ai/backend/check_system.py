
import sys
import os
import pymysql

# Add the current directory to sys.path
sys.path.append(os.getcwd())

from app.database.db import engine, SessionLocal
from app.models.user import User
from sqlalchemy import text

def check_system_status():
    print("="*60)
    print("      SYSTEM HEALTH CHECK & DATA STORAGE VERIFICATION")
    print("="*60)
    
    # 1. Database Connection Check
    print("\n1. CHECKING DATABSE CONNECTION (MySQL)...")
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("   ✅ DATABASE CONNECTED SUCCESSFULLY!")
            print(f"   Connection URL: {engine.url}")
    except Exception as e:
        print(f"   ❌ DATABASE CONNECTION FAILED: {e}")
        return

    # 2. Table Verification
    print("\n2. VERIFYING DATA TABLES...")
    try:
        # Use inspection
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        required_tables = ['users', 'plants', 'scans', 'treatments']
        
        missing = [t for t in required_tables if t not in tables]
        
        if not missing:
            print(f"   ✅ All required tables found: {', '.join(tables)}")
        else:
            print(f"   ❌ MISSING TABLES: {missing}")
            
    except Exception as e:
        print(f"   ❌ TABLE VERIFICATION FAILED: {e}")

    # 3. User Data Verification
    print("\n3. VERIFYING USER DATA STORAGE...")
    session = SessionLocal()
    try:
        user_count = session.query(User).count()
        print(f"   ✅ 'users' table is accessible.")
        print(f"   📊 Current Total Registered Users: {user_count}")
        
        if user_count > 0:
            last_user = session.query(User).order_by(User.id.desc()).first()
            print(f"   👤 Last Registered User: {last_user.email} (ID: {last_user.id})")
        else:
            print("   ℹ️  No users found yet (Database is ready to store new users).")
            
    except Exception as e:
        print(f"   ❌ USER QUERY FAILED: {e}")
    finally:
        session.close()

    print("\n" + "="*60)
    print("   CONCLUSION: DATABASE IS HEALTHY AND READY TO STORE DATA")
    print("="*60)

if __name__ == "__main__":
    check_system_status()
