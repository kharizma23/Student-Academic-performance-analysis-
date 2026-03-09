from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routers import users, auth_router, ai, admin, staff, student
from app import models, auth as auth_utils
import random
import string
import logging

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Academic Development Platform API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3003",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:3000",
    "http://[::1]:3000",  # IPv6 localhost
    "http://[::1]:3001",
    "http://[::1]:3002",
    "http://[::1]:3003",
]

@app.middleware("http")
async def development_safety_middleware(request, call_next):
    # 1. Log incoming request details
    origin = request.headers.get("origin")
    method = request.method
    path = request.url.path
    logging.info(f"INCOMING {method} {path} from Origin: {origin}")
    
    # 2. Handle OPTIONS (Preflight) manually for maximum reliability in dev
    if method == "OPTIONS":
        logging.info(f"Handling OPTIONS for {path}")
        response = JSONResponse(content={"message": "OK"}, status_code=200)
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "*"
        return response

    # 3. Call the next middleware/app
    try:
        response = await call_next(request)
    except Exception as e:
        logging.error(f"Error in backend: {str(e)}")
        raise e

    # 4. Attach CORS and Security Headers to the response
    if origin and ("localhost" in origin or "127.0.0.1" in origin or "[::1]" in origin):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"

    # 5. Security Headers with Relaxed CSP
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Content-Security-Policy"] = "default-src * 'unsafe-inline' 'unsafe-eval'; connect-src *; img-src * data:;"
    
    return response

# Standard Fallback (kept but super-middleware will handle most cases)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Seeding is now handled by standalone seed_db.py
    logging.info("Backend started successfully.")

app.include_router(auth_router.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(ai.router)
app.include_router(staff.router)
app.include_router(student.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Student Academic Development Platform API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
