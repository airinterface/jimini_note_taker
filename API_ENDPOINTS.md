# Clinical Notes API - Endpoint Reference

Base URL: `http://localhost:8000`

API Version: `v1`

All API endpoints are prefixed with `/api/v1`

## System Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy"
}
```

### API Information
```http
GET /
```

**Response:**
```json
{
  "message": "Clinical Notes API",
  "status": "running",
  "version": "1.0.0"
}
```

---

## Patient Endpoints

### List All Patients
```http
GET /api/v1/patients
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "firstName": "Jon",
    "lastName": "Dore",
    "createdAt": "2026-02-13T10:00:00",
    "updatedAt": "2026-02-13T10:00:00"
  }
]
```

### Get Patient's Notes
```http
GET /api/v1/patients/{patient_id}/notes
```

**Parameters:**
- `patient_id` (path) - UUID of the patient

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "sessionDate": "2026-02-13",
    "sessionType": "initial",
    "notes": "Patient presented with...",
    "createdAt": "2026-02-13T10:00:00",
    "updatedAt": "2026-02-13T10:00:00",
    "syncStatus": "pending",
    "is_deleted": false
  }
]
```

**Notes:**
- Returns only non-deleted notes (`is_deleted = false`)
- Returns empty array if patient doesn't exist or has no notes

---

## Clinical Notes Endpoints

### List All Notes
```http
GET /api/v1/notes
```

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "sessionDate": "2026-02-13",
    "sessionType": "initial",
    "notes": "Patient presented with...",
    "createdAt": "2026-02-13T10:00:00",
    "updatedAt": "2026-02-13T10:00:00",
    "syncStatus": "pending",
    "is_deleted": false
  }
]
```

**Notes:**
- Returns only non-deleted notes (`is_deleted = false`)

### Get Note by ID
```http
GET /api/v1/notes/{note_id}
```

**Parameters:**
- `note_id` (path) - UUID of the note

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "sessionDate": "2026-02-13",
  "sessionType": "initial",
  "notes": "Patient presented with...",
  "createdAt": "2026-02-13T10:00:00",
  "updatedAt": "2026-02-13T10:00:00",
  "syncStatus": "pending",
  "is_deleted": false
}
```

**Error Responses:**
- `404 Not Found` - Note doesn't exist

### Create Note
```http
POST /api/v1/notes
Content-Type: application/json
```

**Request Body:**
```json
{
  "patient_id": "uuid",
  "sessionDate": "2026-02-13",
  "sessionType": "initial",
  "notes": "Patient presented with...",
  "syncStatus": "pending"
}
```

**Field Validations:**
- `patient_id` (required) - Must be a valid patient UUID
- `sessionDate` (required) - Valid date in YYYY-MM-DD format
- `sessionType` (required) - One of: `initial`, `follow_up`, `crisis`, `assessment`
- `notes` (required) - String, 1-10000 characters
- `syncStatus` (optional) - One of: `synced`, `pending`, `failed` (default: `pending`)

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "sessionDate": "2026-02-13",
  "sessionType": "initial",
  "notes": "Patient presented with...",
  "createdAt": "2026-02-13T10:00:00",
  "updatedAt": "2026-02-13T10:00:00",
  "syncStatus": "pending",
  "is_deleted": false
}
```

**Error Responses:**
- `400 Bad Request` - Patient not found
- `422 Unprocessable Entity` - Validation error

### Delete Note (Soft Delete)
```http
DELETE /api/v1/notes/{note_id}
```

**Parameters:**
- `note_id` (path) - UUID of the note

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "sessionDate": "2026-02-13",
  "sessionType": "initial",
  "notes": "Patient presented with...",
  "createdAt": "2026-02-13T10:00:00",
  "updatedAt": "2026-02-13T10:05:00",
  "syncStatus": "pending",
  "is_deleted": true
}
```

**Notes:**
- This is a soft delete - the note is marked as deleted but not removed from database
- `is_deleted` is set to `true`
- `updatedAt` timestamp is updated

**Error Responses:**
- `404 Not Found` - Note doesn't exist

### Update Note
```http
PUT /api/v1/notes/{note_id}
PATCH /api/v1/notes/{note_id}
Content-Type: application/json
```

**Parameters:**
- `note_id` (path) - UUID of the note

**Request Body (all fields optional for PATCH):**
```json
{
  "sessionDate": "2026-02-14",
  "sessionType": "follow_up",
  "notes": "Updated notes content...",
  "syncStatus": "synced"
}
```

**Field Validations:**
- `sessionDate` (optional) - Valid date in YYYY-MM-DD format
- `sessionType` (optional) - One of: `initial`, `follow_up`, `crisis`, `assessment`
- `notes` (optional) - String, 1-10000 characters
- `syncStatus` (optional) - One of: `synced`, `pending`, `failed`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "sessionDate": "2026-02-14",
  "sessionType": "follow_up",
  "notes": "Updated notes content...",
  "createdAt": "2026-02-13T10:00:00",
  "updatedAt": "2026-02-13T10:10:00",
  "syncStatus": "synced",
  "is_deleted": false
}
```

**Notes:**
- Both PUT and PATCH work the same way - only provided fields are updated
- `updatedAt` timestamp is automatically updated
- `patient_id` cannot be changed
- Use PATCH for partial updates (recommended)
- Use PUT for full updates

**Error Responses:**
- `404 Not Found` - Note doesn't exist
- `422 Unprocessable Entity` - Validation error

---

## Data Types

### SessionType Enum
- `initial` - Initial consultation
- `follow_up` - Follow-up session
- `crisis` - Crisis intervention
- `assessment` - Assessment session

### SyncStatus Enum
- `synced` - Successfully synced with server
- `pending` - Waiting to be synced
- `failed` - Sync failed

---

## Error Response Format

All error responses follow this structure:

```json
{
  "detail": "Error message"
}
```

Or for validation errors:

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error description",
      "type": "error_type"
    }
  ]
}
```

---

## Testing

### Using cURL

```bash
# List patients
curl http://localhost:8000/api/v1/patients

# Create a note
curl -X POST http://localhost:8000/api/v1/notes \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "your-patient-uuid",
    "sessionDate": "2026-02-13",
    "sessionType": "initial",
    "notes": "Test note",
    "syncStatus": "pending"
  }'

# Get a note
curl http://localhost:8000/api/v1/notes/{note-uuid}

# Delete a note
curl -X DELETE http://localhost:8000/api/v1/notes/{note-uuid}
```

### Using the Test Script

```bash
chmod +x test-api.sh
./test-api.sh
```

### Using Postman

Import the collection file: `api/clinical-notes-api.postman_collection.json`

### Interactive Documentation

Visit: http://localhost:8000/docs

---

## Quick Start Examples

### Complete Workflow

```bash
# 1. Get list of patients
PATIENT_ID=$(curl -s http://localhost:8000/api/v1/patients | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")

# 2. Create a note for the patient
NOTE_ID=$(curl -s -X POST http://localhost:8000/api/v1/notes \
  -H "Content-Type: application/json" \
  -d "{
    \"patient_id\": \"$PATIENT_ID\",
    \"sessionDate\": \"2026-02-13\",
    \"sessionType\": \"initial\",
    \"notes\": \"First session with patient\",
    \"syncStatus\": \"pending\"
  }" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# 3. Get the note
curl http://localhost:8000/api/v1/notes/$NOTE_ID

# 4. Update the note (partial update)
curl -X PATCH http://localhost:8000/api/v1/notes/$NOTE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Updated session notes with additional details",
    "syncStatus": "synced"
  }'

# 5. Get all notes for the patient
curl http://localhost:8000/api/v1/patients/$PATIENT_ID/notes

# 6. Delete the note
curl -X DELETE http://localhost:8000/api/v1/notes/$NOTE_ID

# 7. Verify note is deleted (should return empty array)
curl http://localhost:8000/api/v1/patients/$PATIENT_ID/notes
```
