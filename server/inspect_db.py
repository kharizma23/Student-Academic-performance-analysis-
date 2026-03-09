from app.database import SessionLocal
from app import models, auth
import sys

def inspect_users():
    db = SessionLocal()
    try:
        users = db.query(models.User).all()
        print(f"Total users found: {len(users)}")
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}")
            if u.role == models.UserRole.STUDENT and u.student_profile:
                print(f"  Roll: {u.student_profile.roll_number}, Dept: {u.student_profile.department}, Year: {u.student_profile.year}")
            
            # Test verification
            if u.email == "admin@gmail.com":
                is_valid = auth.verify_password("admin23", u.hashed_password)
                print(f"  Verification check for 'admin23': {is_valid}")
    finally:
        db.close()

if __name__ == "__main__":
    inspect_users()
