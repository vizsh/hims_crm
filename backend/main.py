"""
MedRetain CRM - Main FastAPI Application
Hospital Patient Retention CRM System
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from .database import init_db, SessionLocal
from .models import Patient
from .data_loader import initialize_data
from .routers import patients, batches, messages, analytics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("\n" + "="*60)
    print("MedRetain CRM - Starting Application")
    print("="*60)

    # Initialize database tables
    print("\nInitializing database...")
    init_db()

    # Check if data needs to be loaded
    db = SessionLocal()
    try:
        patient_count = db.query(Patient).count()
        if patient_count == 0:
            print("\nNo patient data found. Loading from CSV...")
            initialize_data()
        else:
            print(f"\nDatabase already contains {patient_count} patients")
    finally:
        db.close()

    print("\n" + "="*60)
    print("MedRetain CRM - Application Ready")
    print("="*60)
    print("\nAPI Documentation available at:")
    print("  - Swagger UI: http://localhost:8000/docs")
    print("  - ReDoc: http://localhost:8000/redoc")
    print("\n")

    yield

    # Shutdown
    print("\nShutting down MedRetain CRM...")


# Create FastAPI app
app = FastAPI(
    title="MedRetain CRM API",
    description="Hospital Patient Retention CRM System with Churn Prediction",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(patients.router)
app.include_router(batches.router)
app.include_router(messages.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    """
    Root endpoint - API health check.
    """
    return {
        "message": "MedRetain CRM API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    db = SessionLocal()
    try:
        # Check database connection
        patient_count = db.query(Patient).count()

        return {
            "status": "healthy",
            "database": "connected",
            "patient_count": patient_count,
            "timestamp": os.popen("date").read().strip()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e)
        }
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
