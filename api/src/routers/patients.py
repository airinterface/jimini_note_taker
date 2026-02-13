from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Patient, ClinicalNote
from schemas import PatientResponse, ClinicalNoteResponse

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=List[PatientResponse])
def list_patients(db: Session = Depends(get_db)):
    """
    List all patients in the system.
    
    Returns:
        List[PatientResponse]: All patients with their details
    """
    patients = db.query(Patient).all()
    return patients


@router.get("/{patient_id}/notes", response_model=List[ClinicalNoteResponse])
def list_notes_by_patient_id(patient_id: str, db: Session = Depends(get_db)):
    """
    List all non-deleted clinical notes for a specific patient.
    
    Args:
        patient_id: UUID of the patient
        
    Returns:
        List[ClinicalNoteResponse]: All non-deleted notes for the patient.
        Returns empty list if patient doesn't exist.
    """
    notes = db.query(ClinicalNote).filter(
        ClinicalNote.patient_id == patient_id,
        ClinicalNote.is_deleted == False
    ).all()
    return notes
