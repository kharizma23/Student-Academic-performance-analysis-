from app.database import SessionLocal
from app import models

db = SessionLocal()
student = db.query(models.User).filter(models.User.role == models.UserRole.STUDENT).first()
if student:
    with open("creds.txt", "w") as f:
        f.write(f"EMAIL:{student.email}\n")
        f.write(f"PASS:{student.plain_password}\n")
else:
    print("No student found")
db.close()
