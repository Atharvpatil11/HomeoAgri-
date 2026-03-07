import sys
import os
from sqlalchemy import inspect, text

# Add the current directory to sys.path to ensure 'app' can be imported
sys.path.append(os.getcwd())

try:
    from app.database.db import engine, SessionLocal, Base
    try:
        from app.models.user import User
    except ImportError:
        User = None
        print("Warning: Could not import User model.")
except ImportError as e:
    print(f"Error importing app modules: {e}")
    sys.exit(1)

def test_connection():
    print("Testing connection to database...")
    try:
        # Check connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful!")
            
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Existing tables: {tables}")
        
        db = SessionLocal()
        
        if 'users' in tables and User:
            try:
                user_count = db.query(User).count()
                print(f"Total Users: {user_count}")
            except Exception as e:
                print(f"Error querying users: {e}")
        else:
             print("Users table not found or model not imported.")

        db.close()
        
    except Exception as e:
        print(f"DATABASE CONNECTION FAILED: {e}")

if __name__ == "__main__":
    test_connection()
