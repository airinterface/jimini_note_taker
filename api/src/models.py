from sqlalchemy import Column, String, DateTime, Date, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
import uuid


class SessionTypeEnum(enum.Enum):
    initial = "initial"
    follow_up = "follow_up"
    crisis = "crisis"
    assessment = "assessment"


class SyncStatusEnum(enum.Enum):
    synced = "synced"
    pending = "pending"
    failed = "failed"


class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    firstName = Column(String(100), nullable=False)
    lastName = Column(String(100), nullable=False)
    createdAt = Column(DateTime, nullable=False, default=func.now())
    updatedAt = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    
    # Relationship
    notes = relationship("ClinicalNote", back_populates="patient", cascade="all, delete-orphan")


class ClinicalNote(Base):
    __tablename__ = "clinical_notes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    sessionDate = Column(Date, nullable=False)
    sessionType = Column(Enum(SessionTypeEnum), nullable=False)
    notes = Column(String(10000), nullable=False)
    createdAt = Column(DateTime, nullable=False, default=func.now())
    updatedAt = Column(DateTime, nullable=False, default=func.now(), onupdate=func.now())
    syncStatus = Column(Enum(SyncStatusEnum), nullable=False, default=SyncStatusEnum.pending)
    is_deleted = Column(Boolean, nullable=False, default=False)
    
    # Relationship
    patient = relationship("Patient", back_populates="notes")
