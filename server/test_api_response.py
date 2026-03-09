from app.database import SessionLocal
from app import models, schemas
import json

db = SessionLocal()
try:
    student_id = "a2ff88fc-aa62-4b17-b02b-2e58728020d5"
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student:
        # Simulate what FastAPI does
        detail = schemas.StudentDetail.from_orm(student)
        print(detail.json(indent=2))
    else:
        print("Student not found")
finally:
    db.close()
