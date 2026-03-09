from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timedelta
from app import database, models, schemas, auth

router = APIRouter(
    prefix="/student",
    tags=["student"]
)

@router.get("/profile", response_model=schemas.StudentDetail)
def get_my_profile(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    student = db.query(models.Student).options(
        joinedload(models.Student.feedback).joinedload(models.Feedback.faculty)
    ).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

@router.get("/feedback", response_model=List[schemas.Feedback])
def get_my_feedback(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can access this")
    
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    return db.query(models.Feedback).options(joinedload(models.Feedback.faculty)).filter(models.Feedback.student_id == student.id).all()

# Todo CRUD
@router.get("/todos", response_model=List[schemas.Todo])
def get_todos(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        return []
    
    return db.query(models.Todo).filter(models.Todo.student_id == student.id).all()

@router.post("/todos", response_model=schemas.Todo)
def add_todo(
    todo_in: schemas.TodoCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    new_todo = models.Todo(
        student_id=student.id,
        task_name=todo_in.task_name,
        priority=todo_in.priority,
        difficulty=todo_in.difficulty,
        due_date=todo_in.due_date # Already datetime or None
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@router.post("/todos/{todo_id}/start")
def start_todo(
    todo_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    todo.status = "In Progress"
    todo.start_time = datetime.now()
    db.commit()
    return {"message": "Started", "start_time": todo.start_time}

@router.post("/todos/{todo_id}/complete")
def complete_todo(
    todo_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    student = db.query(models.Student).filter(models.Student.id == todo.student_id).first()
    
    todo.is_completed = True
    todo.status = "Completed"
    todo.completed_at = datetime.now()
    
    if todo.start_time:
        duration = datetime.now() - todo.start_time
        todo.time_spent = int(duration.total_seconds() / 60)
    
    # Gamification
    xp_gain = 10
    if todo.difficulty == "High": xp_gain = 20
    student.xp_points += xp_gain
    
    # Streak logic
    today = datetime.now().date()
    if student.last_completion_date:
        last_date = student.last_completion_date.date()
        if last_date == today - timedelta(days=1):
            student.streak_count += 1
        elif last_date < today - timedelta(days=1):
            student.streak_count = 1
    else:
        student.streak_count = 1
    
    student.last_completion_date = datetime.now()

    db.commit()

    # Update 60-Day Progress Map with Smart Sync
    # 1. Try to find a direct topic match (e.g., "Practice Python" matches "Study: Fundamentals of Python")
    search_term = todo.task_name.lower().replace("practice", "").replace("review", "").replace("solve", "").strip()
    
    study_day = db.query(models.StudyPlan).filter(
        models.StudyPlan.student_id == student.id,
        models.StudyPlan.is_completed == False,
        models.StudyPlan.topic.ilike(f"%{search_term}%")
    ).order_by(models.StudyPlan.day_number.asc()).first()
    
    if not study_day:
        # 2. If no match (Extra Task), DO NOT overwrite the first available uncompleted day.
        # It should just remain an extra task and track in the DB.
        pass
    
    if study_day:
        study_day.is_completed = True
        study_day.actual_date = datetime.now()

    db.commit()
    return {
        "message": "Completed", 
        "xp_gain": xp_gain, 
        "streak": student.streak_count,
        "time_spent": todo.time_spent,
        "marked_day": study_day.day_number if study_day else None
    }

@router.patch("/todos/{todo_id}")
def toggle_todo(
    todo_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    todo.is_completed = not todo.is_completed
    todo.status = "Completed" if todo.is_completed else "Pending"
    db.commit()
    return {"message": "Toggled", "is_completed": todo.is_completed}

@router.patch("/todos/{todo_id}/reschedule")
def reschedule_todo(
    todo_id: str,
    todo_update: schemas.TodoUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    # Ensure the current user owns this todo
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student or todo.student_id != student.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this todo")

    if todo_update.due_date:
        todo.due_date = todo_update.due_date # Already datetime
    
    if todo_update.status:
        todo.status = todo_update.status
    
    if todo_update.is_completed is not None:
        todo.is_completed = todo_update.is_completed
    
    db.commit()
    db.refresh(todo) # Refresh to get updated values
    return {"message": "Todo updated", "todo": schemas.Todo.from_orm(todo)}

@router.post("/generate-roadmap", response_model=List[schemas.Todo])
def generate_roadmap(
    roadmap_in: schemas.RoadmapCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # 1. Clear uncompleted tasks and existing study plan
    db.query(models.Todo).filter(
        models.Todo.student_id == student.id,
        models.Todo.is_completed == False
    ).delete(synchronize_session=False)

    db.query(models.StudyPlan).filter(
        models.StudyPlan.student_id == student.id
    ).delete(synchronize_session=False)
    
    # 2. Structured Subject Implementation for 100 Days
    subjects = ["DSA", "Java", "Python", "System Design", "Web Tech"]
    
    courses_config = {
        "DSA": [
            ("Architecture and Foundations", 4, 14),
            ("Advanced Data Structures", 4, 18),
            ("Algorithmic Problem Solving", 6, 20),
            ("Graph Theory and DP", 6, 22)
        ],
        "Java": [
            ("Core Syntax & JVM Internals", 4, 14),
            ("Collections & Generics", 6, 18),
            ("Concurrency & Multithreading", 5, 20),
            ("Spring Boot and Microservices", 5, 25)
        ],
        "Python": [
            ("Core Logic and Scripts", 5, 12),
            ("Data Science & Pandas", 5, 18),
            ("Django REST Framework", 5, 22),
            ("AI/ML Fundamentals", 5, 26)
        ],
        "System Design": [
            ("Scalability and Microservices", 5, 15),
            ("Database Sharding & Caching", 5, 16),
            ("Message Queues and Event Driven", 5, 18),
            ("Mock System Design Interviews", 5, 20)
        ],
        "Web Tech": [
            ("Modern HTML/CSS & Tailwind", 5, 15),
            ("React.js and State Management", 5, 20),
            ("Node.js Backend & APIs", 5, 18),
            ("Fullstack Capstone Project", 5, 30)
        ]
    }
    
    # 3. Generate 100 Study Plan Targets (20 days per subject, spanning days)
    base_topics_only = []
    day_counter = 1
    
    for subj in subjects:
        for course_name, days_span, total_hrs in courses_config[subj]:
            base_topic_name = f"[{subj}] {course_name}"
            base_topics_only.append(base_topic_name)
            
            hours_per_day = total_hrs // days_span
            for day_in_course in range(1, days_span + 1):
                topic_str = f"{base_topic_name} (Day {day_in_course}/{days_span}) - {hours_per_day} Hrs"
                new_plan = models.StudyPlan(
                    student_id=student.id,
                    day_number=day_counter,
                    topic=topic_str,
                    is_completed=False
                )
                db.add(new_plan)
                day_counter += 1

    # 4. Targeted Task Generation (20 tasks per subject)
    # 4 base topics per subject * 5 prefixes = 20 tasks
    roadmap_prefixes_map = {
        "DSA": ["Master", "Deep Dive into", "Practice Algorithm:", "Optimize", "Review"],
        "Java": ["Master", "Build Project in", "Advanced Concept:", "Review", "Scale"],
        "Python": ["Master", "Scripting with", "Data Science using", "Build API in", "Review"],
        "System Design": ["Master", "Scale Architecture:", "Design Patterns:", "Case Study:", "Optimize"],
        "Web Tech": ["Master", "Frontend Task:", "Backend Task:", "Build Fullstack:", "Optimize"]
    }
    
    for subj in subjects:
        subj_base_topics = [t for t in base_topics_only if f"[{subj}]" in t]
        prefixes = roadmap_prefixes_map.get(subj, ["Master", "Review", "Practice", "Deep Dive", "Scale"])
        
        for base_top in subj_base_topics:
            for prefix in prefixes:
                task_name = f"{prefix} {base_top}"
                
                diff = "Medium"
                if "Master" in prefix or "Optimize" in prefix or "Scale" in prefix: diff = "High"
                if "Review" in prefix: diff = "Low"
    
                new_todo = models.Todo(
                    student_id=student.id,
                    task_name=task_name,
                    difficulty=diff,
                    priority="Medium",
                    status="Not Started"
                )
                db.add(new_todo)
    
    db.commit()
    return db.query(models.Todo).filter(models.Todo.student_id == student.id).all()

# Study Plan
@router.get("/study-plan", response_model=List[schemas.StudyPlan])
def get_study_plan(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    student = db.query(models.Student).filter(models.Student.user_id == current_user.id).first()
    if not student:
        return []
        
    plan = db.query(models.StudyPlan).filter(models.StudyPlan.student_id == student.id).order_by(models.StudyPlan.day_number.asc()).all()
    
    # Attach completed tasks to each day
    all_completed_todos = db.query(models.Todo).filter(
        models.Todo.student_id == student.id,
        models.Todo.is_completed == True
    ).all()
    
    # Get all uncompleted rescheduled tasks
    rescheduled_todos = db.query(models.Todo).filter(
        models.Todo.student_id == student.id,
        models.Todo.is_completed == False,
        models.Todo.due_date != None
    ).all()
    
    rescheduled_names = {t.task_name for t in rescheduled_todos}

    for day in plan:
        day.completed_tasks = []
        if day.actual_date:
            day_date = day.actual_date.date()
            day.completed_tasks = [t for t in all_completed_todos if t.completed_at and t.completed_at.date() == day_date]
            
        # Check if this day's topic is in the rescheduled uncompleted tasks
        day.is_rescheduled = False
        if not day.is_completed:
            if day.topic in rescheduled_names:
                day.is_rescheduled = True

    return plan
