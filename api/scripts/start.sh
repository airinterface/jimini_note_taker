#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! pg_isready -h db -U clinical_user -d clinical_notes > /dev/null 2>&1; do
    sleep 1
done
echo "Database is ready!"

# Initialize database
echo "Initializing database..."
python scripts/init_db.py

# Start the API server
echo "Starting API server..."
exec uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
