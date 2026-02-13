# Clinical Notes API

FastAPI backend for managing clinical notes and patients.

## Docker Setup

### Prerequisites
- Docker
- Docker Compose

### Quick Start

1. Build and start the services:
```bash
docker-compose up --build
```

2. The API will be available at: http://localhost:8000
3. API documentation: http://localhost:8000/docs
4. PostgreSQL database runs on: localhost:5432

### Development

The API supports hot-reload - any changes to files in `api/src/` will automatically restart the server.

### Stopping the Services

```bash
docker-compose down
```

To remove volumes (database data):
```bash
docker-compose down -v
```

### Database Access

Connect to PostgreSQL:
```bash
docker exec -it clinical_notes_db psql -U clinical_user -d clinical_notes
```

### Running Tests

```bash
docker-compose exec api python -m pytest tests/ -v
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# Database only
docker-compose logs -f db
```

## Local Development (without Docker)

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the API (uses SQLite):
```bash
uvicorn src.main:app --reload
```

3. Initialize database:
```bash
python scripts/init_db.py
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (set automatically in Docker)
  - Default: `sqlite:///./clinical_notes.db` (for local development)
  - Docker: `postgresql://clinical_user:clinical_pass@db:5432/clinical_notes`

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Patients
- `GET /api/v1/patients` - List all patients
- `GET /api/v1/patients/{patient_id}/notes` - List notes for a patient

### Clinical Notes
- `GET /api/v1/notes` - List all non-deleted notes
- `GET /api/v1/notes/{note_id}` - Get a specific note
- `POST /api/v1/notes` - Create a new clinical note
- `PUT /api/v1/notes/{note_id}` - Update a clinical note (full update)
- `PATCH /api/v1/notes/{note_id}` - Update a clinical note (partial update)
- `DELETE /api/v1/notes/{note_id}` - Soft delete a note

### System
- `GET /health` - Health check endpoint
- `GET /` - API information

See http://localhost:8000/docs for interactive API documentation.
