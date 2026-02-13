"""
Database initialization script

Creates all tables and seeds initial data if needed.
"""

import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from database import engine, SessionLocal, Base
from models import Patient
import uuid


def init_database():
    """Initialize database tables and seed data"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
    
    # Seed initial data
    db = SessionLocal()
    try:
        # Check if patients table is empty
        patient_count = db.query(Patient).count()
        
        if patient_count == 0:
            print("Seeding initial patient data...")
            seed_patient = Patient(
                id=str(uuid.uuid4()),
                firstName="Jon",
                lastName="Dore"
            )
            db.add(seed_patient)
            db.commit()
            print(f"Added patient: {seed_patient.firstName} {seed_patient.lastName}")
        else:
            print(f"Database already has {patient_count} patient(s). Skipping seed.")
    
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()
    
    print("Database initialization complete!")


if __name__ == "__main__":
    init_database()
