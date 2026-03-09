from app.database import SessionLocal
from app import models, auth

def verify_admin():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == "admin@gmail.com").first()
        if not user:
            print("ADMIN_NOT_FOUND")
            return
        
        is_valid = auth.verify_password("admin23", user.hashed_password)
        print(f"ADMIN_FOUND: {user.email}")
        print(f"PASSWORD_VALID: {is_valid}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_admin()
