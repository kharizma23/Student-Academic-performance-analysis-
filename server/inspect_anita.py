from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    user = db.query(models.User).filter(models.User.email == "anita.aiml25@gmail.com").first()
    student = db.query(models.Student).filter(models.Student.user_id == user.id).first()
    print(f"ANITA STUDENT ID: {student.id}")
    
    todos = db.query(models.Todo).filter(models.Todo.student_id == student.id).all()
    print(f"ANITA TODOS COUNT: {len(todos)}")
    for t in todos:
        print(f"ID: {t.id}, Name: {t.task_name}, Due: {t.due_date}, Status: {t.status}")
except Exception as e:
    print(f"ERROR: {e}")
finally:
    db.close()
