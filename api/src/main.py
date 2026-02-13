from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.patients import router as patients_router
from routers.notes import router as notes_router

app = FastAPI(
    title="Clinical Notes API",
    description="API for managing clinical notes and patients",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Clinical Notes API", "status": "running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Register routers with /api/v1 prefix
app.include_router(patients_router, prefix="/api/v1")
app.include_router(notes_router, prefix="/api/v1")
