from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"

class UserBase(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.STUDENT

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    full_name: Optional[str] = None
    institutional_email: Optional[str] = None
    plain_password: Optional[str] = None

    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    department: Optional[str] = None
    year: Optional[int] = None
    previous_school: Optional[str] = None

class StudentCreate(StudentBase):
    full_name: str
    personal_email: EmailStr
    dob: str
    blood_group: str
    parent_phone: str = Field(..., pattern=r"^\+?1?\d{9,15}$")
    personal_phone: str = Field(..., pattern=r"^\+?1?\d{9,15}$")
    password: Optional[str] = None
    current_cgpa: Optional[float] = 0.0 # Added to support immediate AI generation

class Student(StudentBase):
    id: str
    user_id: str
    name: Optional[str] = None
    roll_number: Optional[str] = None
    dob: Optional[str] = None
    blood_group: Optional[str] = None
    parent_phone: Optional[str] = None
    personal_phone: Optional[str] = None
    personal_email: Optional[str] = None
    previous_school: Optional[str] = None
    current_cgpa: float
    academic_dna_score: float
    growth_index: float
    risk_level: str
    career_readiness_score: float
    weakness: Optional[str] = None # Added for Targeted Assessments

    class Config:
        from_attributes = True

class AcademicRecordBase(BaseModel):
    semester: int
    subject: str
    internal_marks: float
    external_marks: float
    attendance_percentage: float

class AcademicRecordCreate(AcademicRecordBase):
    pass

class AcademicRecord(AcademicRecordBase):
    id: str
    student_id: str
    grade: Optional[str] = None

    class Config:
        from_attributes = True

class AIScoreBase(BaseModel):
    consistency_index: float
    performance_volatility: float
    cgpa_prediction: float
    risk_probability: float
    skill_gap_score: float
    career_suggestions: Optional[str] = None
    recommended_courses: Optional[str] = None

class AIScore(AIScoreBase):
    student_id: str

    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    student_id: str
    q1_technical_clarity: float = 0.0
    q2_problem_solving: float = 0.0
    q3_code_efficiency: float = 0.0
    q4_algorithm_knowledge: float = 0.0
    q5_debugging_skills: float = 0.0
    q6_concept_application: float = 0.0
    q7_mathematical_aptitude: float = 0.0
    q8_system_design: float = 0.0
    q9_documentation_quality: float = 0.0
    q10_test_coverage_awareness: float = 0.0
    q11_presentation_skills: float = 0.0
    q12_collaborative_spirit: float = 0.0
    q13_adaptability: float = 0.0
    q14_curiosity_level: float = 0.0
    q15_deadline_discipline: float = 0.0
    q16_resourcefulness: float = 0.0
    q17_critical_thinking: float = 0.0
    q18_puncuality: float = 0.0
    q19_peer_mentoring: float = 0.0
    q20_leadership_potential: float = 0.0
    q21_ethical_awareness: float = 0.0
    q22_feedback_receptivity: float = 0.0
    q23_passion_for_field: float = 0.0
    q24_originality_of_ideas: float = 0.0
    q25_consistency_index: float = 0.0
    detailed_remarks: Optional[str] = None

class FeedbackCreate(FeedbackBase):
    pass

class Feedback(FeedbackBase):
    id: str
    faculty_id: str
    faculty_name: Optional[str] = None
    overall_rating: float
    created_at: str # will be converted from datetime

    class Config:
        from_attributes = True

class TodoBase(BaseModel):
    task_name: str
    priority: str = "Medium"
    status: str = "Not Started"
    difficulty: str = "Medium"
    due_date: Optional[datetime] = None # Support both datetime objects and ISO strings

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None

class Todo(TodoBase):
    id: str
    is_completed: bool
    start_time: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    time_spent: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudyPlanBase(BaseModel):
    day_number: int
    topic: str
    sub_tasks: Optional[str] = None

class StudyPlan(StudyPlanBase):
    id: str
    is_completed: bool
    is_rescheduled: bool = False
    actual_date: Optional[datetime] = None
    completed_tasks: List[Todo] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Assuming UserDetail and Skill are new schemas that need to be defined for StudentDetail to be valid.
# Adding placeholder definitions for UserDetail and Skill to ensure syntactic correctness.
class UserDetail(User):
    class Config:
        from_attributes = True

class Skill(BaseModel):
    id: str
    skill_name: str
    proficiency_level: int
    category: Optional[str] = None

    class Config:
        from_attributes = True

class StudentDetail(Student):
    id: str
    user: UserDetail
    academic_records: List[AcademicRecord] = []
    ai_scores: Optional[AIScore] = None
    skills: List[Skill] = []
    feedback: List[Feedback] = []
    xp_points: int = 0
    streak_count: int = 0

    class Config:
        from_attributes = True

class StaffBase(BaseModel):
    department: Optional[str] = None
    designation: Optional[str] = None
    be_degree: Optional[str] = None
    be_college: Optional[str] = None
    me_degree: Optional[str] = None
    me_college: Optional[str] = None
    primary_skill: Optional[str] = None
    projects_completed: int = 0
    publications_count: int = 0
    consistency_score: float = 0.0
    student_feedback_rating: float = 0.0
    personal_email: Optional[str] = None
    personal_phone: Optional[str] = None

class StaffCreate(StaffBase):
    full_name: str
    personal_email: EmailStr
    password: Optional[str] = None
    staff_id: Optional[str] = None # Allow manual override

class Staff(StaffBase):
    id: str
    user_id: str
    staff_id: Optional[str] = None
    name: Optional[str] = None

    class Config:
        from_attributes = True


class StaffDetail(Staff):
    user: User

# --- Advanced Dashboard Analytics ---

class InstitutionalStats(BaseModel):
    total_students: int
    active_students: int
    placement_readiness_avg: float
    dna_score: float
    risk_ratio: float
    avg_growth_index: float

class EarlyWarningStats(BaseModel):
    high_risk_count: int
    medium_risk_count: int
    low_risk_percent: float
    dropout_probability_next_6m: float

class PerformanceCluster(BaseModel):
    name: str # High Achievers, Stable Performers, etc.
    count: int
    percentage: float
    description: str

class DeptPerformanceRank(BaseModel):
    department: str
    avg_cgpa: float
    avg_growth: float
    placement_readiness: float
    skill_score: float
    risk_percent: float
    overall_rank: int

class PlacementForecast(BaseModel):
    forecast_placement_percent: float
    core_vs_it_ratio: str
    avg_career_readiness: float
    skill_gap_avg: float

class FacultyImpactRank(BaseModel):
    name: str
    dept: str
    feedback_consistency: float
    improvement_impact: float
    impact_score: float

class ResourceOptimization(BaseModel):
    faculty_load_percent: float
    lab_utilization_percent: float
    remedial_need_percent: float
    coaching_demand: str

class ActionPlanStrategy(BaseModel):
    label: str
    detail: str

class ActionPlanStep(BaseModel):
    title: str
    detail: str

class DynamicActionPlan(BaseModel):
    executive_summary: str
    roi_efficiency: str
    strategies: List[ActionPlanStrategy]
    resource_label: str
    resource_value: str
    roadmap: List[ActionPlanStep]
    insight_quote: str

class DashboardOverview(BaseModel):
    institutional: InstitutionalStats
    early_warning: EarlyWarningStats
    performance_clusters: List[PerformanceCluster]
    department_ranking: List[DeptPerformanceRank]
    placement_forecast: PlacementForecast
    faculty_impact: List[FacultyImpactRank]
    resource_opt: ResourceOptimization
    weekly_insight: str
    action_plan: DynamicActionPlan

class RemedialAssessmentBase(BaseModel):
    subject: str

class RemedialAssessmentCreate(RemedialAssessmentBase):
    student_ids: List[str]

class RemedialAssessment(RemedialAssessmentBase):
    id: str
    student_id: str
    assigned_at: str
    status: str
    admin_id: str

    class Config:
        from_attributes = True

# --- NEW: Departmental Intelligence Schemas ---

class DeptOverviewMetrics(BaseModel):
    total_students: int
    avg_cgpa: float
    placement_readiness: float # Overall
    coding_readiness: float
    communication_readiness: float
    core_skill_depth: float
    risk_index: float
    core_performance: float
    ai_health_score: float
    stability_indicator: str # "Stable", "Monitoring", "Intervention Needed"
    # New Fields
    dropout_probability_forecast: float
    placement_forecast_percent: float
    skill_gap_index_core_it: float
    total_faculty: int
    hod_name: str

class SubjectPerformance(BaseModel):
    subject_name: str
    pass_percentage: float
    failure_density: float # For graph
    is_most_difficult: bool
    skill_gap_score: float # For heatmap
    dependency_risk_text: Optional[str] = None # e.g. "Math weak -> ML Impact"
    # New Fields
    is_core: bool
    backlog_rate: float
    internal_external_gap: float

class FacultyIntelligence(BaseModel):
    faculty_name: str
    teaching_impact_score: float
    student_improvement_index: float
    subject_difficulty_handling: float
    feedback_sentiment: str # Positive/Neutral/Negative
    attendance_influence_percent: float
    ai_suggestion: Optional[str] = None # e.g. "Assign DBMS next semester"
    # New Fields
    feedback_summary_ai: str
    subject_comparison_score: float

class DeptStudentMicroSegment(BaseModel):
    cluster_name: str # High Achievers, Stable, Improving, Critical Zone
    count: int
    core_weak_count: int
    aptitude_weak_count: int
    attendance_risk_count: int
    emotional_stress_risk_count: int
    trend_change: str # e.g. "+5% from last sem"

class DeptDropoutProbability(BaseModel):
    region_label: str # Semantic label representing a group/subject
    probability_percent: float

class TrendForecast(BaseModel):
    year: str
    avg_cgpa: float

class DeptTrendAndForecast(BaseModel):
    cgpa_trend_3yr: List[TrendForecast]
    placement_trend_forecast: float
    next_semester_risk_prediction: float
    lab_utilization_correlation: str # e.g. "High positive correlation"
    ai_insight: str # e.g. "If internal marks increase by 5%..."

class DeptInterventionRecommendation(BaseModel):
    remedial_class_list: List[str] # Subjects
    bootcamp_recommendation: str
    faculty_reallocation_suggestion: str
    lab_hour_increase_suggestion: str
    syllabus_adjustment: str

class DeptResourceOptimization(BaseModel):
    faculty_load_balance: float # Percentage
    lab_usage_percent: float
    subject_allocation_efficiency: float
    elective_demand_forecast: str

class DeptAdvancedAIFeatures(BaseModel):
    digital_twin_simulation_ready: bool
    skill_evolution_trend: float # % improvement over time
    ai_risk_alert_feed: List[str]
    # New Fields
    graduation_rate: float
    avg_time_to_placement: float
    higher_studies_percent: float
    startup_founders_count: int
    research_paper_count: int

class DeptVsInstitution(BaseModel):
    metric: str
    dept_value: float
    inst_value: float

class WeeklyIntelligenceReport(BaseModel):
    summary: str
    recommendation: str
    generated_at: str

class RoadmapCreate(BaseModel):
    goal: str

class DepartmentOverview(BaseModel):
    department_name: str
    metrics: DeptOverviewMetrics
    subjects: List[SubjectPerformance]
    faculty: List[FacultyIntelligence]
    micro_segments: List[DeptStudentMicroSegment]
    dropout_probability_map: List[DeptDropoutProbability]
    trends: DeptTrendAndForecast
    intervention_engine: DeptInterventionRecommendation
    resource_opt: DeptResourceOptimization
    advanced_ai: DeptAdvancedAIFeatures
    # New: Sections 8 & 9
    weekly_report: WeeklyIntelligenceReport
    comparative_analysis: List[DeptVsInstitution]
