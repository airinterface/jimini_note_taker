from pydantic import BaseModel, Field, field_validator
from typing import Literal
from datetime import date, datetime


# Request Schemas

class PatientBase(BaseModel):
    firstName: str = Field(..., min_length=1, max_length=100)
    lastName: str = Field(..., min_length=1, max_length=100)


class ClinicalNoteCreate(BaseModel):
    patient_id: str
    sessionDate: date
    sessionType: Literal['initial', 'follow_up', 'crisis', 'assessment']
    notes: str = Field(..., min_length=1, max_length=10000)
    syncStatus: Literal['synced', 'pending', 'failed'] = 'pending'
    
    @field_validator('sessionDate')
    @classmethod
    def validate_session_date(cls, v):
        if not isinstance(v, date):
            raise ValueError('sessionDate must be a valid date')
        return v


class ClinicalNoteUpdate(BaseModel):
    sessionDate: date | None = None
    sessionType: Literal['initial', 'follow_up', 'crisis', 'assessment'] | None = None
    notes: str | None = Field(None, min_length=1, max_length=10000)
    syncStatus: Literal['synced', 'pending', 'failed'] | None = None
    
    @field_validator('sessionDate')
    @classmethod
    def validate_session_date(cls, v):
        if v is not None and not isinstance(v, date):
            raise ValueError('sessionDate must be a valid date')
        return v


# Response Schemas

class PatientResponse(PatientBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    
    model_config = {"from_attributes": True}


class ClinicalNoteResponse(BaseModel):
    id: str
    patient_id: str
    sessionDate: date
    sessionType: str
    notes: str
    createdAt: datetime
    updatedAt: datetime
    syncStatus: str
    is_deleted: bool
    
    model_config = {"from_attributes": True}
