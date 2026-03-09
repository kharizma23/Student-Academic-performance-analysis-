from app.database import SessionLocal
from app import models
import json

db = SessionLocal()
try:
    students = db.query(models.Student).all()
    print(f"Total students: {len(students)}")
    for s in students:
        print(f"Student: {s.roll_number} ({s.id})")
        if s.ai_scores:
            print(f"  AI Scores found:")
            print(f"    Career Suggestions: {s.ai_scores.career_suggestions}")
            print(f"    Recommended Courses: {s.ai_scores.recommended_courses}")
        else:
            print(f"  AI Scores NOT found for this student profile.")
finally:
    db.close()
