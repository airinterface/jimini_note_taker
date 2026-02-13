# Clinical Notes API - Complete CRUD Operations

## Overview

The Clinical Notes API provides full CRUD (Create, Read, Update, Delete) operations for clinical notes.

All endpoints are prefixed with `/api/v1`

---

## CRUD Operations Summary

| Operation | HTTP Method | Endpoint | Description |
|-----------|-------------|----------|-------------|
| **Create** | POST | `/api/v1/notes` | Create a new clinical note |
| **Read (List)** | GET | `/api/v1/notes` | List all non-deleted notes |
| **Read (Single)** | GET | `/api/v1/notes/{id}` | Get a specific note by ID |
| **Read (By Patient)** | GET | `/api/v1/patients/{id}/notes` | Get all notes for a patient |
| **Update (Full)** | PUT | `/api/v1/notes/{id}` | Update all fields of a note |
| **Update (Partial)** | PATCH | `/api/v1/notes/{id}` | Update specific fields of a note |
| **Delete (Soft)** | DELETE | `/api/v1/notes/{id}` | Soft delete a note |

---

## 1. CREATE - Add New Note

### Request
```http
POST /api/v1/notes
Content-Type: application/json

{
  "patient_id": "patient-uuid-here",
  "sessionDate": "2026-02-13",
  "sessionType": "initial",
  "notes": "Patient presented with anxiety symptoms...",
  "syncStatus": "pending"
}
```

### Response (201 Created)
```json
{
  "id": "note-uuid-here",
  "patient_id": "patient-uuid-here",
  "sessionDate": "2026-02-13",
  "sessionType": "initial",
  "notes": "Patient presented with anxiety symptoms...",
  "createdAt": "2026-02-13T10:00:00",
  "updatedAt": "2026-02-13T10:00:00",
  "syncStatus": "pending",
  "is_deleted": false
}
```

### cURL Example
```bash
curl -X POST http://localhost:8000/api/v1/notes \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "your-patient-uuid",
    "sessionDate": "2026-02-13",
    "sessionType": "initial",
    "notes": "Patient presented with anxiety symptoms...",
    "syncStatus": "pending"
  }'
```

---

## 2. READ - Get Notes

### 2a. List All Notes
```http
GET /api/v1/notes
```

**Response (200 OK):** Array of all non-deleted notes

```bash
curl http://localhost:8000/api/v1/notes
```

### 2b. Get Specific Note
```http
GET /api/v1/notes/{note_id}
```

**Response (200 OK):** Single note object

```bash
curl http://localhost:8000/api/v1/notes/note-uuid-here
```

### 2c. Get Patient's Notes
```http
GET /api/v1/patients/{patient_id}/notes
```

**Response (200 OK):** Array of notes for the patient (non-deleted only)

```bash
curl http://localhost:8000/api/v1/patients/patient-uuid-here/notes
```

---

## 3. UPDATE - Modify Note

### 3a. Full Update (PUT)
Updates the note with all provided fields.

```http
PUT /api/v1/notes/{note_id}
Content-Type: application/json

{
  "sessionDate": "2026-02-14",
  "sessionType": "follow_up",
  "notes": "Follow-up session - patient showing improvement",
  "syncStatus": "synced"
}
```

### 3b. Partial Update (PATCH) - Recommended
Updates only the fields you provide. Other fields remain unchanged.

```http
PATCH /api/v1/notes/{note_id}
Content-Type: application/json

{
  "notes": "Added additional observations",
  "syncStatus": "synced"
}
```

### Response (200 OK)
```json
{
  "id": "note-uuid-here",
  "patient_id": "patient-uuid-here",
  "sessionDate": "2026-02-14",
  "sessionType": "follow_up",
  "notes": "Added additional observations",
  "createdAt": "2026-02-13T10:00:00",
  "updatedAt": "2026-02-13T10:15:00",
  "syncStatus": "synced",
  "is_deleted": false
}
```

### cURL Examples

**Full Update:**
```bash
curl -X PUT http://localhost:8000/api/v1/notes/note-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "sessionDate": "2026-02-14",
    "sessionType": "follow_up",
    "notes": "Follow-up session - patient showing improvement",
    "syncStatus": "synced"
  }'
```

**Partial Update:**
```bash
curl -X PATCH http://localhost:8000/api/v1/notes/note-uuid-here \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Added additional observations",
    "syncStatus": "synced"
  }'
```

---

## 4. DELETE - Remove Note (Soft Delete)

Soft delete marks the note as deleted without removing it from the database.

```http
DELETE /api/v1/notes/{note_id}
```

### Response (200 OK)
```json
{
  "id": "note-uuid-here",
  "patient_id": "patient-uuid-here",
  "sessionDate": "2026-02-13",
  "sessionType": "initial",
  "notes": "Patient presented with anxiety symptoms...",
  "createdAt": "2026-02-13T10:00:00",
  "updatedAt": "2026-02-13T10:20:00",
  "syncStatus": "pending",
  "is_deleted": true
}
```

### cURL Example
```bash
curl -X DELETE http://localhost:8000/api/v1/notes/note-uuid-here
```

**Important Notes:**
- The note is NOT physically removed from the database
- `is_deleted` is set to `true`
- `updatedAt` timestamp is updated
- Deleted notes are excluded from list/get operations
- Maintains audit trail and data integrity

---

## Complete Workflow Example

```bash
#!/bin/bash

API_URL="http://localhost:8000/api/v1"

# 1. Get a patient ID
PATIENT_ID=$(curl -s $API_URL/patients | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['id'])")
echo "Patient ID: $PATIENT_ID"

# 2. CREATE - Add a new note
echo -e "\n=== CREATE Note ==="
NOTE_ID=$(curl -s -X POST $API_URL/notes \
  -H "Content-Type: application/json" \
  -d "{
    \"patient_id\": \"$PATIENT_ID\",
    \"sessionDate\": \"2026-02-13\",
    \"sessionType\": \"initial\",
    \"notes\": \"Initial consultation\",
    \"syncStatus\": \"pending\"
  }" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "Created Note ID: $NOTE_ID"

# 3. READ - Get the note
echo -e "\n=== READ Note ==="
curl -s $API_URL/notes/$NOTE_ID | python3 -m json.tool

# 4. UPDATE - Modify the note
echo -e "\n=== UPDATE Note ==="
curl -s -X PATCH $API_URL/notes/$NOTE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Initial consultation - updated with additional details",
    "syncStatus": "synced"
  }' | python3 -m json.tool

# 5. READ - Get patient's notes
echo -e "\n=== READ Patient Notes ==="
curl -s $API_URL/patients/$PATIENT_ID/notes | python3 -m json.tool

# 6. DELETE - Soft delete the note
echo -e "\n=== DELETE Note ==="
curl -s -X DELETE $API_URL/notes/$NOTE_ID | python3 -m json.tool

# 7. VERIFY - Check patient's notes (should be empty)
echo -e "\n=== VERIFY Deletion ==="
curl -s $API_URL/patients/$PATIENT_ID/notes | python3 -m json.tool
```

---

## Field Validations

### Required Fields (CREATE)
- `patient_id` - Must be a valid patient UUID
- `sessionDate` - Valid date (YYYY-MM-DD)
- `sessionType` - One of: `initial`, `follow_up`, `crisis`, `assessment`
- `notes` - String (1-10000 characters)

### Optional Fields (CREATE)
- `syncStatus` - One of: `synced`, `pending`, `failed` (default: `pending`)

### Updatable Fields (UPDATE)
- `sessionDate` - Valid date
- `sessionType` - One of the enum values
- `notes` - String (1-10000 characters)
- `syncStatus` - One of the enum values

### Non-Updatable Fields
- `id` - Auto-generated, cannot be changed
- `patient_id` - Cannot be changed after creation
- `createdAt` - Auto-generated, cannot be changed
- `updatedAt` - Auto-updated on modifications
- `is_deleted` - Only changed via DELETE endpoint

---

## Error Responses

### 400 Bad Request
Patient not found when creating a note
```json
{
  "detail": "Patient not found"
}
```

### 404 Not Found
Note doesn't exist
```json
{
  "detail": "Note not found"
}
```

### 422 Unprocessable Entity
Validation error
```json
{
  "detail": [
    {
      "loc": ["body", "sessionType"],
      "msg": "Input should be 'initial', 'follow_up', 'crisis' or 'assessment'",
      "type": "literal_error"
    }
  ]
}
```

---

## Best Practices

### Creating Notes
- Always validate patient exists before creating notes
- Use appropriate `sessionType` for the consultation
- Set `syncStatus` to `pending` for offline-created notes

### Updating Notes
- Use **PATCH** for partial updates (recommended)
- Use **PUT** only when updating multiple fields
- Update `syncStatus` to `synced` after successful sync

### Deleting Notes
- Use soft delete to maintain audit trail
- Deleted notes remain in database but are excluded from queries
- Consider implementing a "restore" feature if needed

### Querying Notes
- Use `/api/v1/patients/{id}/notes` to get notes for a specific patient
- Use `/api/v1/notes` to get all notes across all patients
- Both endpoints automatically exclude deleted notes

---

## Testing

### Interactive Documentation
Visit http://localhost:8000/docs to test all endpoints interactively

### Automated Test Script
```bash
chmod +x test-api.sh
./test-api.sh
```

### Postman Collection
Import `api/clinical-notes-api.postman_collection.json` into Postman

---

## Summary

✅ **CREATE** - `POST /api/v1/notes` - Add new notes
✅ **READ** - `GET /api/v1/notes` - List all notes
✅ **READ** - `GET /api/v1/notes/{id}` - Get specific note
✅ **READ** - `GET /api/v1/patients/{id}/notes` - Get patient's notes
✅ **UPDATE** - `PUT/PATCH /api/v1/notes/{id}` - Modify notes
✅ **DELETE** - `DELETE /api/v1/notes/{id}` - Soft delete notes

All CRUD operations are fully implemented and ready to use! 🎉
