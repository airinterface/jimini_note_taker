# Design Document: Clinical Notes API

## Overview

This design specifies a FastAPI backend API for managing clinical notes and patients. The API provides RESTful endpoints for CRUD operations on patient records and clinical notes, with support for soft deletion and synchronization status tracking. The system uses SQLAlchemy for ORM, Pydantic for data validation, and follows REST best practices.

The API is designed to support a mobile application with offline-first capabilities, allowing clinicians to create and sync clinical notes. The soft delete pattern ensures data integrity and audit trails while allowing logical deletion of notes.

## Architecture

### Technology Stack

- **Framework**: FastAPI (Python web framework with automatic OpenAPI documentation)
- **ORM**: SQLAlchemy (database abstraction and object-relational mapping)
- **Validation**: Pydantic (data validation using Python type annotations)
- **Database**: SQLite/PostgreSQL (configurable via SQLAlchemy)

### Application Structure

```
api/
├── main.py              # FastAPI application entry point
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic validation schemas
├── database.py          # Database connection and session management
└── routers/
    ├── patients.py      # Patient endpoints
    └── notes.py         # Clinical notes endpoints
```

### Architectural Patterns

- **Layered Architecture**: Separation between API routes, business logic, and data access
- **Dependency Injection**: FastAPI's dependency system for database sessions
- **Schema Validation**: Pydantic models for request/response validation
- **Soft Delete Pattern**: Logical deletion using is_deleted flag

## Components and Interfaces

### Database Models (SQLAlchemy)

#### Patient Model

```python
class Patient(Base):
    __tablename__ = "patients"
    
    id: str (primary key, UUID)
    firstName: str (not null)
    lastName: str (not null)
    createdAt: datetime (not null, default=now)
    updatedAt: datetime (not null, default=now, onupdate=now)
    
    # Relationship
    notes: relationship to ClinicalNote (cascade delete)
```

#### ClinicalNote Model

```python
class ClinicalNote(Base):
    __tablename__ = "clinical_notes"
    
    id: str (primary key, UUID)
    patient_id: str (foreign key to patients.id, not null)
    sessionDate: date (not null)
    sessionType: enum ('initial', 'follow_up', 'crisis', 'assessment') (not null)
    notes: str (not null)
    createdAt: datetime (not null, default=now)
    updatedAt: datetime (not null, default=now, onupdate=now)
    syncStatus: enum ('synced', 'pending', 'failed') (not null, default='pending')
    is_deleted: bool (not null, default=False)
    
    # Relationship
    patient: relationship to Patient
```

### Pydantic Schemas

#### Request Schemas

```python
class PatientBase(BaseModel):
    firstName: str (min_length=1, max_length=100)
    lastName: str (min_length=1, max_length=100)

class ClinicalNoteCreate(BaseModel):
    patient_id: str (UUID format)
    sessionDate: date
    sessionType: Literal['initial', 'follow_up', 'crisis', 'assessment']
    notes: str (min_length=1, max_length=10000)
    syncStatus: Literal['synced', 'pending', 'failed'] = 'pending'
```

#### Response Schemas

```python
class PatientResponse(PatientBase):
    id: str
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True

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
    
    class Config:
        from_attributes = True
```

### API Endpoints

#### 1. List Patients

```
GET /patients
Response: 200 OK
Body: List[PatientResponse]
```

Returns all patients in the system.

#### 2. List Notes by Patient ID

```
GET /patients/{patient_id}/notes
Path Parameters:
  - patient_id: str (UUID)
Response: 200 OK
Body: List[ClinicalNoteResponse]
```

Returns all non-deleted clinical notes for the specified patient. Filters out notes where `is_deleted = true`.

#### 3. Add Note

```
POST /notes
Request Body: ClinicalNoteCreate
Response: 201 Created
Body: ClinicalNoteResponse
Error Responses:
  - 400 Bad Request: Invalid data or patient_id doesn't exist
  - 422 Unprocessable Entity: Validation error
```

Creates a new clinical note. Validates that the patient exists before creating the note.

#### 4. Delete Note

```
DELETE /notes/{note_id}
Path Parameters:
  - note_id: str (UUID)
Response: 200 OK
Body: ClinicalNoteResponse (with is_deleted=true)
Error Responses:
  - 404 Not Found: Note doesn't exist
```

Soft deletes a clinical note by setting `is_deleted = true` and updating `updatedAt`.

### Database Session Management

```python
# Dependency for database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

All endpoints use FastAPI's dependency injection to get database sessions.

### Database Migration and Initial Data

The system includes an `init_db.py` script in the `scripts/` folder that:
1. Creates all tables (patients, clinical_notes) if they don't exist
2. Seeds initial data with a default patient if no patients exist

**Initial Data Logic**:
```python
# In scripts/init_db.py
# Only add Jon Dore if no patients exist in the database
if db.query(Patient).count() == 0:
    seed_patient = Patient(
        id: UUID (generated)
        firstName: "Jon"
        lastName: "Dore"
        createdAt: current timestamp
        updatedAt: current timestamp
    )
    db.add(seed_patient)
    db.commit()
```

This ensures the database has at least one patient for testing and demonstration purposes, but won't duplicate data on subsequent runs.

## Data Models

### Entity Relationship Diagram

```
Patient (1) ----< (N) ClinicalNote

Patient:
  - id (PK)
  - firstName
  - lastName
  - createdAt
  - updatedAt

ClinicalNote:
  - id (PK)
  - patient_id (FK -> Patient.id)
  - sessionDate
  - sessionType
  - notes
  - createdAt
  - updatedAt
  - syncStatus
  - is_deleted
```

### Field Constraints

**Patient:**
- `id`: UUID v4, generated on creation
- `firstName`, `lastName`: 1-100 characters
- `createdAt`, `updatedAt`: Automatically managed by database

**ClinicalNote:**
- `id`: UUID v4, generated on creation
- `patient_id`: Must reference existing Patient
- `sessionDate`: Valid date (not future date)
- `sessionType`: Must be one of the four enum values
- `notes`: 1-10000 characters
- `syncStatus`: Must be one of the three enum values
- `is_deleted`: Boolean, defaults to false
- `createdAt`, `updatedAt`: Automatically managed by database

### Soft Delete Implementation

The soft delete pattern is implemented as follows:
1. `DELETE /notes/{note_id}` sets `is_deleted = true`
2. `GET /patients/{patient_id}/notes` filters `WHERE is_deleted = false`
3. Physical records remain in database for audit purposes
4. `updatedAt` is updated on soft delete to track when deletion occurred



## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Patient list completeness

*For any* set of patients in the database, calling the list patients endpoint should return all patients with id, firstName, lastName, createdAt, and updatedAt fields present.

**Validates: Requirements 1.1**

### Property 2: Timestamp auto-generation on creation

*For any* Patient or ClinicalNote created, the createdAt and updatedAt fields should be automatically set to valid timestamps at creation time.

**Validates: Requirements 1.2, 3.5, 3.6**

### Property 3: Timestamp update on modification

*For any* Patient that is modified, the updatedAt timestamp should be changed to a value greater than the original updatedAt.

**Validates: Requirements 1.3**

### Property 4: Non-deleted notes retrieval

*For any* patient with a mix of deleted and non-deleted clinical notes, retrieving notes for that patient should return only notes where is_deleted is false.

**Validates: Requirements 2.1, 2.3**

### Property 5: All note fields present in response

*For any* clinical note retrieved from the API, the response should contain all required fields: id, patient_id, sessionDate, sessionType, notes, createdAt, updatedAt, syncStatus, and is_deleted.

**Validates: Requirements 2.4**

### Property 6: Note creation round trip

*For any* valid clinical note data, creating the note via the API should return a response containing the same data with generated id and timestamps.

**Validates: Requirements 3.1**

### Property 7: Foreign key validation

*For any* clinical note creation request with a non-existent patient_id, the API should reject the request with a validation error.

**Validates: Requirements 3.2, 5.4**

### Property 8: SessionType enum validation

*For any* clinical note creation request with a sessionType value not in ['initial', 'follow_up', 'crisis', 'assessment'], the API should reject the request with a validation error.

**Validates: Requirements 3.3**

### Property 9: SyncStatus enum validation

*For any* clinical note creation request with a syncStatus value not in ['synced', 'pending', 'failed'], the API should reject the request with a validation error.

**Validates: Requirements 3.4, 8.3**

### Property 10: Default is_deleted value

*For any* clinical note created without specifying is_deleted, the created note should have is_deleted set to false.

**Validates: Requirements 3.7**

### Property 11: Validation error responses

*For any* invalid clinical note creation request (missing required fields, invalid types, etc.), the API should return a 4xx status code with error details.

**Validates: Requirements 3.8, 5.5**

### Property 12: Soft delete persistence

*For any* clinical note that is soft deleted, the note should still exist in the database with is_deleted set to true and should not be physically removed.

**Validates: Requirements 4.1, 4.4**

### Property 13: Soft delete timestamp update

*For any* clinical note that is soft deleted, the updatedAt timestamp should be changed to a value greater than the original updatedAt.

**Validates: Requirements 4.2**

### Property 14: Required field validation

*For any* clinical note creation request missing required fields (patient_id, sessionDate, sessionType, or notes), the API should reject the request with a validation error.

**Validates: Requirements 5.1**

### Property 15: Date field validation

*For any* clinical note creation request with an invalid date value for sessionDate, the API should reject the request with a validation error.

**Validates: Requirements 5.2**

### Property 16: String length validation

*For any* clinical note creation request with string fields exceeding maximum length limits (firstName/lastName > 100 chars, notes > 10000 chars), the API should reject the request with a validation error.

**Validates: Requirements 5.3**

### Property 17: Success status codes

*For any* successful API request, the response should have an appropriate 2xx status code (200 for GET/DELETE, 201 for POST).

**Validates: Requirements 6.1**

### Property 18: Client error status codes

*For any* API request with invalid data or parameters, the response should have a 4xx status code.

**Validates: Requirements 6.2**

### Property 19: JSON response format

*For any* API request, the response should be valid JSON that can be parsed.

**Validates: Requirements 6.4**

### Property 20: Structured validation errors

*For any* validation error response, the error details should include information about which fields failed validation.

**Validates: Requirements 6.5**

### Property 21: SyncStatus persistence

*For any* clinical note created with a specific syncStatus value, retrieving that note should return the same syncStatus value.

**Validates: Requirements 8.1, 8.2**



## Error Handling

### Error Response Format

All error responses follow a consistent JSON structure:

```python
{
    "detail": "Error message" | [
        {
            "loc": ["body", "field_name"],
            "msg": "Error description",
            "type": "error_type"
        }
    ]
}
```

### Error Categories

#### 1. Validation Errors (422 Unprocessable Entity)

Returned when request data fails Pydantic validation:
- Missing required fields
- Invalid data types
- Enum value violations
- String length violations
- Invalid date formats

FastAPI automatically generates these errors from Pydantic schemas.

#### 2. Not Found Errors (404 Not Found)

Returned when:
- Deleting a non-existent note
- Accessing a resource that doesn't exist

#### 3. Bad Request Errors (400 Bad Request)

Returned when:
- Creating a note with non-existent patient_id
- Invalid UUID format in path parameters

#### 4. Server Errors (500 Internal Server Error)

Returned when:
- Database connection failures
- Unexpected exceptions

### Error Handling Implementation

```python
# Custom exception for patient not found
class PatientNotFoundError(Exception):
    pass

# Exception handler
@app.exception_handler(PatientNotFoundError)
async def patient_not_found_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": "Patient not found"}
    )
```

### Database Transaction Handling

- All write operations wrapped in try-except blocks
- Database sessions rolled back on error
- Proper session cleanup in finally blocks
- FastAPI dependency system ensures session cleanup

## Testing Strategy

### Overview

The testing strategy employs a dual approach combining unit tests for specific scenarios and property-based tests for comprehensive validation of universal properties. This ensures both concrete correctness and general behavioral guarantees.

### Property-Based Testing

**Framework**: Hypothesis (Python property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `# Feature: clinical-notes-api, Property N: [property description]`

**Property Test Coverage**:

Each correctness property defined in this document will be implemented as a property-based test. Property tests will:
- Generate random valid and invalid inputs
- Verify universal properties hold across all generated inputs
- Test boundary conditions automatically through randomization
- Validate API behavior comprehensively

**Example Property Test Structure**:

```python
from hypothesis import given, strategies as st
import hypothesis

@given(
    first_name=st.text(min_size=1, max_size=100),
    last_name=st.text(min_size=1, max_size=100)
)
@hypothesis.settings(max_examples=100)
def test_patient_creation_timestamps():
    # Feature: clinical-notes-api, Property 2: Timestamp auto-generation on creation
    # Test that createdAt and updatedAt are automatically set
    ...
```

### Unit Testing

**Framework**: pytest

**Unit Test Focus**:
- Specific example scenarios
- Edge cases (empty lists, boundary values)
- Integration between components
- Error conditions with specific inputs

**Unit Test Coverage**:

1. **Endpoint Tests**:
   - Test each endpoint with valid inputs
   - Test each endpoint with invalid inputs
   - Test error responses

2. **Edge Cases**:
   - Empty patient list
   - Patient with no notes
   - Invalid patient_id returns empty list (Requirement 2.2)
   - Delete non-existent note returns error (Requirement 4.3)

3. **Integration Tests**:
   - Create patient, then create note for that patient
   - Create note, soft delete it, verify it's excluded from list
   - Create multiple notes, verify all returned

### Test Database

- Use SQLite in-memory database for tests
- Fresh database for each test (isolation)
- Test fixtures for common data setup

### Testing Balance

- Property tests handle comprehensive input coverage (100+ random inputs per property)
- Unit tests focus on specific examples and edge cases
- Together they provide complete coverage: unit tests catch concrete bugs, property tests verify general correctness

### Continuous Integration

- All tests run on every commit
- Property tests run with full iteration count in CI
- Test coverage reporting
- Fail build on test failures

