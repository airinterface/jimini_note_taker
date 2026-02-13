"""
Property-based tests for Clinical Notes API

Feature: clinical-notes-api
"""

import pytest
from hypothesis import given, strategies as st, settings
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date, timedelta
import uuid

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from database import Base, get_db
from main import app
from models import Patient, ClinicalNote, SessionTypeEnum, SyncStatusEnum


# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_database():
    """Create fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


# Hypothesis strategies
session_types = st.sampled_from(['initial', 'follow_up', 'crisis', 'assessment'])
sync_statuses = st.sampled_from(['synced', 'pending', 'failed'])


@given(
    num_deleted=st.integers(min_value=1, max_value=5),
    num_not_deleted=st.integers(min_value=1, max_value=5)
)
@settings(max_examples=100)
def test_property_4_non_deleted_notes_retrieval(num_deleted, num_not_deleted):
    """
    Property 4: Non-deleted notes retrieval
    
    For any patient with a mix of deleted and non-deleted clinical notes,
    retrieving notes for that patient should return only notes where is_deleted is false.
    
    Validates: Requirements 2.1, 2.3
    """
    # Setup: Create a test database session
    db = TestingSessionLocal()
    
    try:
        # Create a patient
        patient = Patient(
            id=str(uuid.uuid4()),
            firstName="Test",
            lastName="Patient"
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)
        
        # Create non-deleted notes
        non_deleted_note_ids = []
        for i in range(num_not_deleted):
            note = ClinicalNote(
                id=str(uuid.uuid4()),
                patient_id=patient.id,
                sessionDate=date.today() - timedelta(days=i),
                sessionType=SessionTypeEnum.initial,
                notes=f"Non-deleted note {i}",
                syncStatus=SyncStatusEnum.pending,
                is_deleted=False
            )
            db.add(note)
            non_deleted_note_ids.append(note.id)
        
        # Create deleted notes
        deleted_note_ids = []
        for i in range(num_deleted):
            note = ClinicalNote(
                id=str(uuid.uuid4()),
                patient_id=patient.id,
                sessionDate=date.today() - timedelta(days=i + 10),
                sessionType=SessionTypeEnum.follow_up,
                notes=f"Deleted note {i}",
                syncStatus=SyncStatusEnum.synced,
                is_deleted=True
            )
            db.add(note)
            deleted_note_ids.append(note.id)
        
        db.commit()
        
        # Act: Retrieve notes via API
        response = client.get(f"/patients/{patient.id}/notes")
        
        # Assert: Response is successful
        assert response.status_code == 200
        
        # Assert: Only non-deleted notes are returned
        returned_notes = response.json()
        returned_note_ids = [note['id'] for note in returned_notes]
        
        # Verify all non-deleted notes are present
        for note_id in non_deleted_note_ids:
            assert note_id in returned_note_ids, f"Non-deleted note {note_id} should be in response"
        
        # Verify no deleted notes are present
        for note_id in deleted_note_ids:
            assert note_id not in returned_note_ids, f"Deleted note {note_id} should not be in response"
        
        # Verify the count matches
        assert len(returned_notes) == num_not_deleted, \
            f"Expected {num_not_deleted} notes, got {len(returned_notes)}"
        
        # Verify all returned notes have is_deleted = false
        for note in returned_notes:
            assert note['is_deleted'] is False, \
                f"Note {note['id']} should have is_deleted=False"
    
    finally:
        db.close()
