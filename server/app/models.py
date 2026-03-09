from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy import func
from .database import Base
import uuid
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    full_name = Column(String, nullable=True)
    institutional_email = Column(String, unique=True, index=True, nullable=True)
    plain_password = Column(String, nullable=True) # For admin visibility as requested
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student_profile = relationship("Student", back_populates="user", uselist=False)
    staff_profile = relationship("Staff", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    roll_number = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    dob = Column(String, nullable=True)  # Format: YYYY-MM-DD
    blood_group = Column(String, nullable=True)
    parent_phone = Column(String, nullable=True)
    personal_phone = Column(String, nullable=True)
    personal_email = Column(String, nullable=True)
    previous_school = Column(String, nullable=True)
    
    current_cgpa = Column(Float, default=0.0)
    academic_dna_score = Column(Float, default=0.0)
    growth_index = Column(Float, default=0.0)
    risk_level = Column(String, default="Low") # Low, Medium, High
    career_readiness_score = Column(Float, default=0.0)
    
    # Gamification & Progress
    xp_points = Column(Integer, default=0)
    streak_count = Column(Integer, default=0)
    last_completion_date = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="student_profile")
    academic_records = relationship("AcademicRecord", back_populates="student")
    ai_scores = relationship("AIScore", back_populates="student", uselist=False)
    skills = relationship("Skill", back_populates="student")
    feedback = relationship("Feedback", back_populates="student")

    @property
    def name(self):
        return self.user.full_name if self.user else None

class AcademicRecord(Base):
    __tablename__ = "academic_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject = Column(String, nullable=False)
    internal_marks = Column(Float, default=0.0)
    external_marks = Column(Float, default=0.0)
    grade = Column(String, nullable=True)
    attendance_percentage = Column(Float, default=0.0)

    student = relationship("Student", back_populates="academic_records")

class Staff(Base):
    __tablename__ = "staff"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    staff_id = Column(String, unique=True, index=True, nullable=True)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    
    # Education
    be_degree = Column(String, nullable=True)
    be_college = Column(String, nullable=True)
    me_degree = Column(String, nullable=True)
    me_college = Column(String, nullable=True)
    
    # Professional Metrics
    primary_skill = Column(String, nullable=True)
    projects_completed = Column(Integer, default=0)
    publications_count = Column(Integer, default=0)
    consistency_score = Column(Float, default=0.0)
    student_feedback_rating = Column(Float, default=0.0) # 1-5 scale
    
    personal_email = Column(String, nullable=True)
    personal_phone = Column(String, nullable=True)

    user = relationship("User", back_populates="staff_profile")

    @property
    def name(self):
        return self.user.full_name if self.user else None

class AIScore(Base):
    __tablename__ = "ai_scores"

    student_id = Column(String, ForeignKey("students.id"), primary_key=True)
    consistency_index = Column(Float, default=0.0)
    performance_volatility = Column(Float, default=0.0)
    cgpa_prediction = Column(Float, default=0.0)
    risk_probability = Column(Float, default=0.0)
    skill_gap_score = Column(Float, default=0.0)
    
    # AI Suggestions (Stored as JSON for flexibility)
    career_suggestions = Column(String, nullable=True) # JSON string
    recommended_courses = Column(String, nullable=True) # JSON string

    student = relationship("Student", back_populates="ai_scores")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    proficiency_level = Column(Integer, default=1) # 1-5
    category = Column(String, default="technical") # technical / soft

    student = relationship("Student", back_populates="skills")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    faculty_id = Column(String, ForeignKey("users.id"), nullable=False)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    
    # 25+ Evaluation Metrics (0-10 scale)
    q1_technical_clarity = Column(Float, default=0.0)
    q2_problem_solving = Column(Float, default=0.0)
    q3_code_efficiency = Column(Float, default=0.0)
    q4_algorithm_knowledge = Column(Float, default=0.0)
    q5_debugging_skills = Column(Float, default=0.0)
    q6_concept_application = Column(Float, default=0.0)
    q7_mathematical_aptitude = Column(Float, default=0.0)
    q8_system_design = Column(Float, default=0.0)
    q9_documentation_quality = Column(Float, default=0.0)
    q10_test_coverage_awareness = Column(Float, default=0.0)
    q11_presentation_skills = Column(Float, default=0.0)
    q12_collaborative_spirit = Column(Float, default=0.0)
    q13_adaptability = Column(Float, default=0.0)
    q14_curiosity_level = Column(Float, default=0.0)
    q15_deadline_discipline = Column(Float, default=0.0)
    q16_resourcefulness = Column(Float, default=0.0)
    q17_critical_thinking = Column(Float, default=0.0)
    q18_puncuality = Column(Float, default=0.0)
    q19_peer_mentoring = Column(Float, default=0.0)
    q20_leadership_potential = Column(Float, default=0.0)
    q21_ethical_awareness = Column(Float, default=0.0)
    q22_feedback_receptivity = Column(Float, default=0.0)
    q23_passion_for_field = Column(Float, default=0.0)
    q24_originality_of_ideas = Column(Float, default=0.0)
    q25_consistency_index = Column(Float, default=0.0)
    
    overall_rating = Column(Float, default=0.0)
    detailed_remarks = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="feedback")
    faculty = relationship("User")

    @property
    def faculty_name(self):
        return self.faculty.full_name if self.faculty else "Unknown Faculty"

class Todo(Base):
    __tablename__ = "todos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    task_name = Column(String, nullable=False)
    due_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    status = Column(String, default="Not Started") # Not Started, In Progress, Completed
    priority = Column(String, default="Medium") # Low, Medium, High
    difficulty = Column(String, default="Medium") # Low, Medium, High
    start_time = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    time_spent = Column(Integer, default=0) # in minutes
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    day_number = Column(Integer, nullable=False) # 1-60 for 60-day plan
    topic = Column(String, nullable=False)
    sub_tasks = Column(String, nullable=True) # JSON string
    is_completed = Column(Boolean, default=False)
    actual_date = Column(DateTime, nullable=True)

class RemedialAssessment(Base):
    __tablename__ = "remedial_assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    subject = Column(String, nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="Assigned")
    admin_id = Column(String, ForeignKey("users.id"), nullable=False)

    student = relationship("Student")
    admin = relationship("User")
