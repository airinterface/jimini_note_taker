#!/bin/bash

# Simple script to test the Clinical Notes API

API_URL="http://localhost:8000"
API_V1="$API_URL/api/v1"

echo "Testing Clinical Notes API..."
echo "=============================="
echo ""

# Test 1: Health check
echo "1. Health Check"
curl -s "$API_URL/health" | python3 -m json.tool
echo ""
echo ""

# Test 2: Root endpoint
echo "2. Root Endpoint"
curl -s "$API_URL/" | python3 -m json.tool
echo ""
echo ""

# Test 3: List patients
echo "3. List Patients (GET /api/v1/patients)"
curl -s "$API_V1/patients" | python3 -m json.tool
echo ""
echo ""

# Test 4: Get patient notes (using first patient ID if available)
echo "4. Get Patient Notes (GET /api/v1/patients/{id}/notes)"
PATIENT_ID=$(curl -s "$API_V1/patients" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')")

if [ -n "$PATIENT_ID" ]; then
    echo "Patient ID: $PATIENT_ID"
    curl -s "$API_V1/patients/$PATIENT_ID/notes" | python3 -m json.tool
else
    echo "No patients found"
fi
echo ""
echo ""

# Test 5: List all notes
echo "5. List All Notes (GET /api/v1/notes)"
curl -s "$API_V1/notes" | python3 -m json.tool
echo ""
echo ""

# Test 6: Create a note (if patient exists)
if [ -n "$PATIENT_ID" ]; then
    echo "6. Create Note (POST /api/v1/notes)"
    curl -s -X POST "$API_V1/notes" \
        -H "Content-Type: application/json" \
        -d "{
            \"patient_id\": \"$PATIENT_ID\",
            \"sessionDate\": \"2026-02-13\",
            \"sessionType\": \"initial\",
            \"notes\": \"Test note created via API\",
            \"syncStatus\": \"pending\"
        }" | python3 -m json.tool
    echo ""
    echo ""
fi

# Test 7: Get specific note (if note exists)
echo "7. Get Specific Note (GET /api/v1/notes/{id})"
NOTE_ID=$(curl -s "$API_V1/notes" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data[0]['id'] if data else '')")

if [ -n "$NOTE_ID" ]; then
    echo "Note ID: $NOTE_ID"
    curl -s "$API_V1/notes/$NOTE_ID" | python3 -m json.tool
else
    echo "No notes found"
fi
echo ""
echo ""

# Test 8: Update note (if note exists)
if [ -n "$NOTE_ID" ]; then
    echo "8. Update Note (PATCH /api/v1/notes/{id})"
    curl -s -X PATCH "$API_V1/notes/$NOTE_ID" \
        -H "Content-Type: application/json" \
        -d "{
            \"notes\": \"Updated note content via API test\",
            \"syncStatus\": \"synced\"
        }" | python3 -m json.tool
    echo ""
    echo ""
fi

echo "=============================="
echo "API Testing Complete!"
echo ""
echo "Available Endpoints:"
echo "  GET    /health"
echo "  GET    /api/v1/patients"
echo "  GET    /api/v1/patients/{id}/notes"
echo "  GET    /api/v1/notes"
echo "  GET    /api/v1/notes/{id}"
echo "  POST   /api/v1/notes"
echo "  PUT    /api/v1/notes/{id}"
echo "  PATCH  /api/v1/notes/{id}"
echo "  DELETE /api/v1/notes/{id}"
