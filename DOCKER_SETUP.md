# Docker Setup Guide

This guide explains how to run the Clinical Notes API with PostgreSQL using Docker.

## Architecture

```
┌─────────────────────────────────────────┐
│  Docker Compose Environment             │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   API        │    │  PostgreSQL  │  │
│  │  (FastAPI)   │───▶│   Database   │  │
│  │  Port 8000   │    │  Port 5432   │  │
│  └──────────────┘    └──────────────┘  │
│         │                               │
│    Hot Reload                           │
│    (./api/src)                          │
└─────────────────────────────────────────┘
```

## Features

✅ PostgreSQL database with persistent storage
✅ FastAPI with hot-reload for development
✅ Automatic database initialization and seeding
✅ Health checks for both services
✅ Volume mounts for live code updates
✅ Easy commands via Makefile

## Quick Start

### 1. Start the services

```bash
make up
# or
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Wait for database to be ready
- Initialize database tables
- Seed initial patient data (Jon Dore)
- Start FastAPI server with hot-reload

### 2. Access the API

- API Base URL: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 3. Test the API

```bash
# Health check
curl http://localhost:8000/health

# List patients
curl http://localhost:8000/api/v1/patients

# List all notes
curl http://localhost:8000/api/v1/notes

# Or use the test script
chmod +x test-api.sh
./test-api.sh
```

## Development Workflow

### Making Code Changes

Any changes to files in `api/src/` will automatically reload the API server. No need to restart containers!

Example:
1. Edit `api/src/routers/patients.py`
2. Save the file
3. API automatically reloads
4. Test your changes immediately

### Viewing Logs

```bash
# All services
make logs
# or
docker-compose logs -f

# API only
docker-compose logs -f api

# Database only
docker-compose logs -f db
```

### Running Tests

```bash
make test
# or
docker-compose exec api python -m pytest tests/ -v
```

### Database Access

```bash
# Connect to PostgreSQL
make db
# or
docker exec -it clinical_notes_db psql -U clinical_user -d clinical_notes

# Inside psql:
\dt              # List tables
\d patients      # Describe patients table
SELECT * FROM patients;
```

## Common Commands

```bash
# Build images
make build

# Start services
make up

# Stop services
make down

# Restart services
make restart

# View logs
make logs

# Run tests
make test

# Clean everything (including data)
make clean

# Connect to database
make db
```

## Configuration

### Environment Variables

The API uses these environment variables (set in docker-compose.yml):

- `DATABASE_URL`: PostgreSQL connection string
- `PYTHONUNBUFFERED`: Enable Python output buffering

### Database Credentials

Default credentials (change for production):
- User: `clinical_user`
- Password: `clinical_pass`
- Database: `clinical_notes`
- Port: `5432`

### Ports

- API: `8000` (host) → `8000` (container)
- PostgreSQL: `5432` (host) → `5432` (container)

## Troubleshooting

### Port Already in Use

If port 8000 or 5432 is already in use:

```bash
# Check what's using the port
lsof -i :8000
lsof -i :5432

# Stop the services and try again
make down
make up
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs db

# Restart services
make restart
```

### API Not Reloading

If hot-reload isn't working:

```bash
# Restart the API service
docker-compose restart api

# Or rebuild
make down
make build
make up
```

### Reset Everything

To start fresh:

```bash
# Stop and remove everything including data
make clean

# Rebuild and start
make build
make up
```

## Production Considerations

Before deploying to production:

1. **Change database credentials** in docker-compose.yml
2. **Configure CORS** properly in `api/src/main.py`
3. **Use environment files** for sensitive data
4. **Enable SSL/TLS** for database connections
5. **Set up proper logging** and monitoring
6. **Use production WSGI server** settings
7. **Implement rate limiting** and authentication

## File Structure

```
.
├── docker-compose.yml          # Docker Compose configuration
├── Makefile                    # Convenience commands
├── api/
│   ├── Dockerfile             # API container definition
│   ├── requirements.txt       # Python dependencies
│   ├── .dockerignore         # Files to exclude from build
│   ├── src/                  # Application code (hot-reload)
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routers/
│   ├── tests/                # Test files
│   └── scripts/
│       ├── start.sh          # Container startup script
│       └── init_db.py        # Database initialization
```

## Next Steps

1. Start the services: `make up`
2. Check the API docs: http://localhost:8000/docs
3. Make code changes and see them reload automatically
4. Run tests: `make test`
5. View logs: `make logs`

Happy coding! 🚀
