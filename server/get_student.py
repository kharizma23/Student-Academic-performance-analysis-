from app.database import SessionLocal
from app import models

db = SessionLocal()
student = db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).first()
if student:
    print(f"Email: {student.email}")
    print(f"Password: {student.plain_password}")
else:
    print("No student found")
db.close()
