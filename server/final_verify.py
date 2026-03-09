from app.database import SessionLocal
from app import models
import logging

db = SessionLocal()
try:
    total_users = db.query(models.User).count()
    students = db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).count()
    admins = db.query(models.User).filter(models.User.role == models.UserRole.ADMIN).count()
    staff = db.query(models.User).filter(models.User.role == models.UserRole.STAFF).count()
    
    sample = db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).first()
    
    print(f"Total Users: {total_users}")
    print(f"Students: {students}")
    print(f"Admins: {admins}")
    print(f"Staff: {staff}")
    
    if sample:
        print(f"\nSample student:")
        print(f"Name: {sample.full_name}")
        print(f"Login Email: {sample.email}")
        print(f"Unique Pass: {sample.plain_password}")
        
finally:
    db.close()
