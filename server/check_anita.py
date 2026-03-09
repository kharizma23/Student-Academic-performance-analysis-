from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    user = db.query(models.User).filter(models.User.email == "anita.aiml25@gmail.com").first()
    if user:
        print(f"User ID: {user.id}")
        student = db.query(models.Student).filter(models.Student.user_id == user.id).first()
        if student:
            print(f"Student ID: {student.id}")
        else:
            print("NO STUDENT RECORD FOUND")
    else:
        print("NO USER RECORD FOUND")
finally:
    db.close()
