from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, projects, documents

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["Authentication"])
app.include_router(projects.router, prefix=settings.API_V1_STR, tags=["Projects"])
app.include_router(documents.router, prefix=settings.API_V1_STR, tags=["Documents"])

@app.get("/")
async def root():
    return {"message": "Welcome to Project Management Dashboard API"}
