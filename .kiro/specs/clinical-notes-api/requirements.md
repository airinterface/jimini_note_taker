# Requirements Document

## Introduction

This document specifies the requirements for a FastAPI backend API that manages clinical notes and patients. The system provides RESTful endpoints for creating, retrieving, and soft-deleting clinical notes, as well as managing patient records. The API is designed to support a mobile application that synchronizes clinical notes with the backend.

## Glossary

- **API**: The FastAPI backend application
- **Clinical_Note**: A record documenting a clinical session with a patient
- **Patient**: A person receiving clinical care
- **Mobile_App**: The client application that synchronizes data with the API
- **Soft_Delete**: Marking a record as deleted without removing it from the database
- **Sync_Status**: The synchronization state of a clinical note (synced, pending, or failed)

## Requirements

### Requirement 1: Patient Management

**User Story:** As a clinician, I want to retrieve patient information, so that I can view patient details and their associated clinical notes.

#### Acceptance Criteria

1. WHEN a request is made to list patients, THE API SHALL return all patients with their id, firstName, lastName, createdAt, and updatedAt fields
2. THE API SHALL automatically set createdAt timestamp when a Patient is created
3. THE API SHALL automatically update updatedAt timestamp when a Patient is modified

### Requirement 2: Clinical Note Retrieval

**User Story:** As a clinician, I want to retrieve clinical notes for a specific patient, so that I can review the patient's clinical history.

#### Acceptance Criteria

1. WHEN a request is made with a valid patient_id, THE API SHALL return all non-deleted Clinical_Notes for that patient
2. WHEN a request is made with an invalid patient_id, THE API SHALL return an empty list
3. THE API SHALL exclude Clinical_Notes where is_deleted is true from retrieval results
4. THE API SHALL return Clinical_Notes with all fields: id, patient_id, sessionDate, sessionType, notes, createdAt, updatedAt, syncStatus, and is_deleted

### Requirement 3: Clinical Note Creation

**User Story:** As a clinician, I want to create new clinical notes, so that I can document patient sessions.

#### Acceptance Criteria

1. WHEN a valid Clinical_Note is submitted, THE API SHALL create the note and return the created record
2. WHEN creating a Clinical_Note, THE API SHALL validate that patient_id references an existing Patient
3. WHEN creating a Clinical_Note, THE API SHALL validate that sessionType is one of: 'initial', 'follow_up', 'crisis', or 'assessment'
4. WHEN creating a Clinical_Note, THE API SHALL validate that syncStatus is one of: 'synced', 'pending', or 'failed'
5. THE API SHALL automatically set createdAt timestamp when a Clinical_Note is created
6. THE API SHALL automatically set updatedAt timestamp when a Clinical_Note is created
7. THE API SHALL set is_deleted to false by default when a Clinical_Note is created
8. WHEN a Clinical_Note is submitted with invalid data, THE API SHALL return a validation error with details

### Requirement 4: Clinical Note Soft Deletion

**User Story:** As a clinician, I want to delete clinical notes, so that I can remove notes that were created in error while maintaining data integrity.

#### Acceptance Criteria

1. WHEN a delete request is made with a valid note id, THE API SHALL set the is_deleted flag to true
2. WHEN a delete request is made with a valid note id, THE API SHALL update the updatedAt timestamp
3. WHEN a delete request is made with an invalid note id, THE API SHALL return an error
4. THE API SHALL NOT physically remove Clinical_Note records from the database

### Requirement 5: Data Validation and Integrity

**User Story:** As a system administrator, I want the API to enforce data validation rules, so that the database maintains consistent and valid data.

#### Acceptance Criteria

1. THE API SHALL validate that all required fields are present in create requests
2. THE API SHALL validate that date fields contain valid date values
3. THE API SHALL validate that string fields do not exceed reasonable length limits
4. THE API SHALL validate that foreign key relationships are maintained
5. WHEN validation fails, THE API SHALL return descriptive error messages

### Requirement 6: API Response Format

**User Story:** As a mobile app developer, I want consistent API response formats, so that I can reliably parse and handle responses.

#### Acceptance Criteria

1. WHEN an API request succeeds, THE API SHALL return appropriate HTTP status codes (200, 201)
2. WHEN an API request fails due to client error, THE API SHALL return 4xx status codes
3. WHEN an API request fails due to server error, THE API SHALL return 5xx status codes
4. THE API SHALL return responses in JSON format
5. WHEN validation errors occur, THE API SHALL return error details in a structured format

### Requirement 7: Database Schema

**User Story:** As a developer, I want a well-defined database schema using SQLAlchemy ORM, so that data is stored consistently and relationships are maintained.

#### Acceptance Criteria

1. THE API SHALL use SQLAlchemy to define Patient and Clinical_Note models
2. THE API SHALL define a foreign key relationship from Clinical_Note.patient_id to Patient.id
3. THE API SHALL use appropriate column types for each field (String, Date, Boolean, Enum)
4. THE API SHALL configure cascade behavior for the Patient-Clinical_Note relationship
5. THE API SHALL use Pydantic models for request/response validation

### Requirement 8: Synchronization Support

**User Story:** As a mobile app developer, I want to track synchronization status of clinical notes, so that I can manage offline-first functionality.

#### Acceptance Criteria

1. THE API SHALL store syncStatus for each Clinical_Note
2. THE API SHALL allow Mobile_App to set syncStatus when creating or updating notes
3. THE API SHALL preserve syncStatus values: 'synced', 'pending', or 'failed'
