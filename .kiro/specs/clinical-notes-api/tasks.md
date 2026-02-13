# Implementation Plan: Clinical Notes API

## Overview

This implementation plan breaks down the FastAPI backend into discrete coding tasks. The approach follows a layered architecture: database setup → models → schemas → endpoints → testing. Each task builds incrementally, ensuring the system is functional at each checkpoint.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create `api/` directory structure with `main.py`, `models.py`, `schemas.py`, `database.py`
  - Create `api/routers/` directory for endpoint modules
  - Create `requirements.txt` with FastAPI, SQLAlchemy, Pydantic, Uvicorn, Hypothesis, pytest
  - Set up basic FastAPI application in `main.py` with CORS middleware
  - _Requirements: 7.1, 7.5_

- [x] 2. Implement database configuration and models
  - [x] 2.1 Create database connection in `database.py`
    - Configure SQLAlchemy engine and session maker
    - Create Base declarative class
    - Implement `get_db()` dependency function
    - _Requirements: 7.1_
  
  - [x] 2.2 Implement Patient model in `models.py`
    - Define Patient table with id (UUID), firstName, lastName, createdAt, updatedAt
    - Configure automatic timestamp handling with `default` and `onupdate`
    - _Requirements: 1.2, 1.3, 7.1, 7.2, 7.3_
  
  - [x] 2.3 Implement ClinicalNote model in `models.py`
    - Define ClinicalNote table with all fields including enums for sessionType and syncStatus
    - Configure foreign key relationship to Patient with appropriate cascade behavior
    - Set default values for is_deleted (False) and syncStatus ('pending')
    - _Requirements: 3.5, 3.6, 3.7, 7.1, 7.2, 7.3, 7.4, 8.1_

- [x] 3. Implement Pydantic schemas
  - [x] 3.1 Create request schemas in `schemas.py`
    - Define `PatientBase` with firstName and lastName validation (1-100 chars)
    - Define `ClinicalNoteCreate` with all required fields and validation
    - Use Literal types for sessionType and syncStatus enums
    - Add field validators for string lengths and date validation
    - _Requirements: 3.3, 3.4, 5.1, 5.2, 5.3, 7.5_
  
  - [x] 3.2 Create response schemas in `schemas.py`
    - Define `PatientResponse` with all Patient fields
    - Define `ClinicalNoteResponse` with all ClinicalNote fields
    - Configure `from_attributes = True` for ORM compatibility
    - _Requirements: 1.1, 2.4, 7.5_

- [x] 4. Implement patient endpoints
  - [x] 4.1 Create `api/routers/patients.py` with list_patients endpoint
    - Implement `GET /patients` that returns all patients
    - Use database dependency injection
    - Return 200 status with list of PatientResponse
    - _Requirements: 1.1, 6.1, 6.4_
  
  - [x] 4.2 Implement list_notes_by_patient_id endpoint in `patients.py`
    - Implement `GET /patients/{patient_id}/notes`
    - Filter notes where `is_deleted = False`
    - Return empty list for invalid patient_id
    - Return 200 status with list of ClinicalNoteResponse
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.4_
  
  - [ ] 4.3 Write property test for non-deleted notes retrieval
    - **Property 4: Non-deleted notes retrieval**
    - **Validates: Requirements 2.1, 2.3**
  
  - [ ]* 4.4 Write unit test for invalid patient_id returns empty list
    - Test that requesting notes for non-existent patient returns empty list
    - _Requirements: 2.2_

- [ ] 5. Implement clinical notes endpoints
  - [ ] 5.1 Create `api/routers/notes.py` with add_note endpoint
    - Implement `POST /notes` that creates a new clinical note
    - Validate patient_id exists before creating note
    - Return 201 status with ClinicalNoteResponse on success
    - Return 400 status if patient doesn't exist
    - Return 422 status for validation errors
    - _Requirements: 3.1, 3.2, 3.8, 5.5, 6.1, 6.2, 6.4, 6.5_
  
  - [ ] 5.2 Implement delete_note endpoint in `notes.py`
    - Implement `DELETE /notes/{note_id}` that soft deletes a note
    - Set `is_deleted = True` and update `updatedAt`
    - Return 200 status with updated ClinicalNoteResponse
    - Return 404 status if note doesn't exist
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.2, 6.4_
  
  - [ ]* 5.3 Write property test for note creation round trip
    - **Property 6: Note creation round trip**
    - **Validates: Requirements 3.1**
  
  - [ ]* 5.4 Write property test for foreign key validation
    - **Property 7: Foreign key validation**
    - **Validates: Requirements 3.2, 5.4**
  
  - [ ]* 5.5 Write property test for sessionType enum validation
    - **Property 8: SessionType enum validation**
    - **Validates: Requirements 3.3**
  
  - [ ]* 5.6 Write property test for syncStatus enum validation
    - **Property 9: SyncStatus enum validation**
    - **Validates: Requirements 3.4, 8.3**
  
  - [ ]* 5.7 Write property test for soft delete persistence
    - **Property 12: Soft delete persistence**
    - **Validates: Requirements 4.1, 4.4**
  
  - [ ]* 5.8 Write unit test for delete non-existent note returns error
    - Test that deleting non-existent note returns 404
    - _Requirements: 4.3_

- [ ] 6. Register routers and configure error handling
  - [ ] 6.1 Register patient and notes routers in `main.py`
    - Include routers with appropriate prefixes and tags
    - Configure OpenAPI documentation
    - _Requirements: 6.4_
  
  - [ ] 6.2 Implement custom exception handlers
    - Create PatientNotFoundError exception class
    - Add exception handler for patient not found (400 status)
    - Ensure validation errors return structured responses
    - _Requirements: 5.5, 6.2, 6.5_

- [ ] 7. Checkpoint - Ensure all tests pass
  - Run all unit and property tests
  - Verify all endpoints return correct status codes
  - Ensure all tests pass, ask the user if questions arise

- [ ] 8. Create database initialization script
  - [ ] 8.1 Create `scripts/init_db.py`
    - Import models and create all tables
    - Check if patients table is empty
    - If empty, seed with Patient "Jon Dore"
    - Add command-line execution support
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 8.2 Write unit test for init_db script
    - Test that script creates tables
    - Test that Jon Dore is added only when no patients exist
    - Test that script is idempotent (can run multiple times)

- [ ]* 9. Write comprehensive property tests for validation
  - [ ]* 9.1 Write property test for timestamp auto-generation
    - **Property 2: Timestamp auto-generation on creation**
    - **Validates: Requirements 1.2, 3.5, 3.6**
  
  - [ ]* 9.2 Write property test for timestamp update on modification
    - **Property 3: Timestamp update on modification**
    - **Validates: Requirements 1.3**
  
  - [ ]* 9.3 Write property test for default is_deleted value
    - **Property 10: Default is_deleted value**
    - **Validates: Requirements 3.7**
  
  - [ ]* 9.4 Write property test for required field validation
    - **Property 14: Required field validation**
    - **Validates: Requirements 5.1**
  
  - [ ]* 9.5 Write property test for date field validation
    - **Property 15: Date field validation**
    - **Validates: Requirements 5.2**
  
  - [ ]* 9.6 Write property test for string length validation
    - **Property 16: String length validation**
    - **Validates: Requirements 5.3**
  
  - [ ]* 9.7 Write property test for syncStatus persistence
    - **Property 21: SyncStatus persistence**
    - **Validates: Requirements 8.1, 8.2**

- [ ]* 10. Write integration tests
  - [ ]* 10.1 Write integration test for complete patient-note workflow
    - Create patient, create note for patient, retrieve notes, soft delete note
    - Verify note is excluded from subsequent retrievals
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  
  - [ ]* 10.2 Write integration test for validation error responses
    - Test various invalid inputs return appropriate error structures
    - **Property 11: Validation error responses**
    - **Validates: Requirements 3.8, 5.5**
  
  - [ ]* 10.3 Write integration test for HTTP status codes
    - **Property 17: Success status codes**
    - **Property 18: Client error status codes**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Run complete test suite with property tests at 100 iterations
  - Verify API documentation is generated correctly
  - Test all endpoints manually if needed
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use Hypothesis library with minimum 100 iterations
- Database uses SQLite for development (can be configured for PostgreSQL in production)
- All timestamps are handled automatically by SQLAlchemy
- Soft delete pattern ensures data integrity and audit trails
