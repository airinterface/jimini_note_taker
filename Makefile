.PHONY: help build up down logs restart clean test

help:
	@echo "Clinical Notes API - Docker Commands"
	@echo ""
	@echo "  make build    - Build Docker images"
	@echo "  make up       - Start services"
	@echo "  make down     - Stop services"
	@echo "  make logs     - View logs"
	@echo "  make restart  - Restart services"
	@echo "  make clean    - Stop services and remove volumes"
	@echo "  make test     - Run tests in container"
	@echo "  make db       - Connect to database"

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "API: http://localhost:8000"
	@echo "Docs: http://localhost:8000/docs"

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

clean:
	docker-compose down -v

test:
	docker-compose exec api python -m pytest tests/ -v

db:
	docker exec -it clinical_notes_db psql -U clinical_user -d clinical_notes
