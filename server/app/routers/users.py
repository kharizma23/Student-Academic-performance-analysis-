from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import database, models, schemas, auth

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Domain-based role logic
    role = models.UserRole.STUDENT
    if user.email.lower().endswith("@faculty.com"):
        role = models.UserRole.FACULTY
    elif user.email.lower() == "admin@gmail.com":
        role = models.UserRole.ADMIN
    
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email.lower().strip(),
        hashed_password=hashed_password,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create associated student profile if role is student
    if role == models.UserRole.STUDENT:
        db_student = models.Student(user_id=db_user.id)
        db.add(db_student)
        db.commit()
        
    return db_user

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_active_user)):
    return current_user
