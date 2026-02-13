from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import ClinicalNote, Patient, SessionTypeEnum, SyncStatusEnum
from schemas import ClinicalNoteCreate, ClinicalNoteUpdate, ClinicalNoteResponse

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("", response_model=ClinicalNoteResponse, status_code=201)
def create_note(note: ClinicalNoteCreate, db: Session = Depends(get_db)):
    """
    Create a new clinical note.
    
    Args:
        note: Clinical note data
        
    Returns:
        ClinicalNoteResponse: The created note
        
    Raises:
        400: Patient not found
        422: Validation error
    """
    # Validate patient exists
    patient = db.query(Patient).filter(Patient.id == note.patient_id).first()
    if not patient:
        raise HTTPException(status_code=400, detail="Patient not found")
    
    # Create note with enum conversion
    db_note = ClinicalNote(
        patient_id=note.patient_id,
        sessionDate=note.sessionDate,
        sessionType=SessionTypeEnum[note.sessionType],
        notes=note.notes,
        syncStatus=SyncStatusEnum[note.syncStatus]
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note


@router.get("", response_model=List[ClinicalNoteResponse])
def list_notes(db: Session = Depends(get_db)):
    """
    List all non-deleted clinical notes.
    
    Returns:
        List[ClinicalNoteResponse]: All non-deleted notes
    """
    notes = db.query(ClinicalNote).filter(ClinicalNote.is_deleted == False).all()
    return notes


@router.get("/{note_id}", response_model=ClinicalNoteResponse)
def get_note(note_id: str, db: Session = Depends(get_db)):
    """
    Get a specific clinical note by ID.
    
    Args:
        note_id: UUID of the note
        
    Returns:
        ClinicalNoteResponse: The note details
        
    Raises:
        404: Note not found
    """
    note = db.query(ClinicalNote).filter(ClinicalNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return note


@router.put("/{note_id}", response_model=ClinicalNoteResponse)
@router.patch("/{note_id}", response_model=ClinicalNoteResponse)
def update_note(note_id: str, note_update: ClinicalNoteUpdate, db: Session = Depends(get_db)):
    """
    Update a clinical note.
    
    Supports both PUT (full update) and PATCH (partial update).
    Only provided fields will be updated.
    
    Args:
        note_id: UUID of the note to update
        note_update: Fields to update
        
    Returns:
        ClinicalNoteResponse: The updated note
        
    Raises:
        404: Note not found
        422: Validation error
    """
    note = db.query(ClinicalNote).filter(ClinicalNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Update only provided fields
    update_data = note_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == 'sessionType' and value is not None:
            setattr(note, field, SessionTypeEnum[value])
        elif field == 'syncStatus' and value is not None:
            setattr(note, field, SyncStatusEnum[value])
        else:
            setattr(note, field, value)
    
    db.commit()
    db.refresh(note)
    
    return note


@router.delete("/{note_id}", response_model=ClinicalNoteResponse)
def delete_note(note_id: str, db: Session = Depends(get_db)):
    """
    Soft delete a clinical note.
    
    Sets is_deleted flag to true and updates updatedAt timestamp.
    
    Args:
        note_id: UUID of the note to delete
        
    Returns:
        ClinicalNoteResponse: The updated note with is_deleted=true
        
    Raises:
        404: Note not found
    """
    note = db.query(ClinicalNote).filter(ClinicalNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    # Soft delete
    note.is_deleted = True
    db.commit()
    db.refresh(note)
    
    return note
