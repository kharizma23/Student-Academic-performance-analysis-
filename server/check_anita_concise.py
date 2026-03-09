from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    user = db.query(models.User).filter(models.User.email == "anita.aiml25@gmail.com").first()
    if not user:
        print("RESULT: USER_NOT_FOUND")
    else:
        student = db.query(models.Student).filter(models.Student.user_id == user.id).first()
        if student:
            print("RESULT: STUDENT_FOUND")
        else:
            print("RESULT: STUDENT_NOT_FOUND")
finally:
    db.close()
