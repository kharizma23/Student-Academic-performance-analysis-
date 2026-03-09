from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app import database, models, schemas, auth

router = APIRouter(
    prefix="/staff",
    tags=["staff"]
)



@router.get("/my-profile", response_model=schemas.Staff)
def get_my_profile(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can access this")
    
    staff = db.query(models.Staff).filter(models.Staff.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff profile not found")
    return staff

@router.get("/students", response_model=List[schemas.Student])
def get_my_students(
    year: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can access this")
    
    staff = db.query(models.Staff).filter(models.Staff.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff profile not found")
    
    query = db.query(models.Student).filter(models.Student.department == staff.department)
    if year:
        query = query.filter(models.Student.year == year)
    
    return query.all()

@router.get("/evaluated-students", response_model=List[str])
def get_evaluated_students(
    year: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can access this")
    
    query = db.query(models.Feedback.student_id).filter(models.Feedback.faculty_id == current_user.id)
    if year:
        query = query.join(models.Student, models.Feedback.student_id == models.Student.id).filter(models.Student.year == year)
    
    return [r[0] for r in query.all()]

@router.post("/feedback")
def submit_feedback(
    feedback_in: schemas.FeedbackCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.FACULTY:
        raise HTTPException(status_code=403, detail="Only faculty can submit feedback")
    
    # Calculate overall rating (average of Q1-Q25)
    metrics = [
        feedback_in.q1_technical_clarity, feedback_in.q2_problem_solving, feedback_in.q3_code_efficiency,
        feedback_in.q4_algorithm_knowledge, feedback_in.q5_debugging_skills, feedback_in.q6_concept_application,
        feedback_in.q7_mathematical_aptitude, feedback_in.q8_system_design, feedback_in.q9_documentation_quality,
        feedback_in.q10_test_coverage_awareness, feedback_in.q11_presentation_skills, feedback_in.q12_collaborative_spirit,
        feedback_in.q13_adaptability, feedback_in.q14_curiosity_level, feedback_in.q15_deadline_discipline,
        feedback_in.q16_resourcefulness, feedback_in.q17_critical_thinking, feedback_in.q18_puncuality,
        feedback_in.q19_peer_mentoring, feedback_in.q20_leadership_potential, feedback_in.q21_ethical_awareness,
        feedback_in.q22_feedback_receptivity, feedback_in.q23_passion_for_field, feedback_in.q24_originality_of_ideas,
        feedback_in.q25_consistency_index
    ]
    overall = sum(metrics) / len(metrics)
    
    new_feedback = models.Feedback(
        faculty_id=current_user.id,
        student_id=feedback_in.student_id,
        overall_rating=overall,
        detailed_remarks=feedback_in.detailed_remarks,
        **{f"q{i}_{name}": getattr(feedback_in, f"q{i}_{name}") for i, name in enumerate([
            "technical_clarity", "problem_solving", "code_efficiency", "algorithm_knowledge", "debugging_skills",
            "concept_application", "mathematical_aptitude", "system_design", "documentation_quality", "test_coverage_awareness",
            "presentation_skills", "collaborative_spirit", "adaptability", "curiosity_level", "deadline_discipline",
            "resourcefulness", "critical_thinking", "puncuality", "peer_mentoring", "leadership_potential",
            "ethical_awareness", "feedback_receptivity", "passion_for_field", "originality_of_ideas", "consistency_index"
        ], 1)}
    )
    
    db.add(new_feedback)
    
    # Trigger AI Suggestion Update (Mock Logic for now)
    ai_score = db.query(models.AIScore).filter(models.AIScore.student_id == feedback_in.student_id).first()
    if not ai_score:
        ai_score = models.AIScore(student_id=feedback_in.student_id)
        db.add(ai_score)
    
    # Update suggestions based on metrics
    low_metrics = [i for i, v in enumerate(metrics, 1) if v < 5]
    if low_metrics:
        ai_score.recommended_courses = "Basis on faculty feedback, focus on: Advanced Algorithms, System Design Fundamentals."
    else:
        ai_score.recommended_courses = "Performance is excellent. Consider: Cloud Native Architecture, Research in GenAI."
    
    ai_score.career_suggestions = "Potential roles: Full Stack Developer, Data Engineer." if overall > 7 else "Potential roles: Technical Support, QA Engineer."

    db.commit()
    return {"message": "Feedback submitted successfully", "overall_rating": overall}
