from app.database import SessionLocal
from app import models

db = SessionLocal()
student = db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).first()
if student:
    # Use explicit print with no space to avoid truncation
    print(f"USER_EMAIL:{student.email}")
    print(f"USER_PASS:{student.plain_password}")
else:
    print("No student found")
db.close()
