from app.database import SessionLocal
from app import models
import json

db = SessionLocal()
try:
    student_id = "a2ff88fc-aa62-4b17-b02b-2e58728020d5"
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student:
        print(f"Student: {student.roll_number}")
        if student.ai_scores:
            print(f"  AI Scores Object Exists")
            print(f"    consistency_index: {student.ai_scores.consistency_index}")
            print(f"    career_suggestions (type: {type(student.ai_scores.career_suggestions)}): {student.ai_scores.career_suggestions}")
            print(f"    recommended_courses (type: {type(student.ai_scores.recommended_courses)}): {student.ai_scores.recommended_courses}")
        else:
            print(f"  AI Scores Object is NONE")
    else:
        print("Student not found")
finally:
    db.close()
