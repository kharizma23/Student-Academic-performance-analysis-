from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    student_user = db.query(models.User).filter(models.User.role == "student").first()
    if student_user:
        print(f"EMAIL: {student_user.email}")
        print(f"PLAIN_PASSWORD: {student_user.plain_password}")
    else:
        print("No student user found.")
finally:
    db.close()
