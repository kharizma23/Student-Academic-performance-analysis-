from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
import random
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from typing import List, Optional
from app import database, models, schemas, auth

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

# --- Helper: AI Insight Generator ---
import json
def _generate_ai_insights(student, db: Session):
    # Deterministic randomness based on student ID
    seed = int(student.id.encode().hex(), 16) % 10000
    random.seed(seed)
    
    # 1. Career Compass Logic
    dept_careers = {
        "CSE": ["Software Architect", "Data Scientist", "Full Stack Developer", "AI Engineer", "Cybersecurity Analyst"],
        "ECE": ["Embedded Systems Engineer", "VLSI Design Engineer", "IoT Specialist", "Network Engineer"],
        "MECH": ["Robotics Engineer", "Automotive Designer", "Supply Chain Analyst", "Thermal Engineer"],
        "EEE": ["Power Systems Engineer", "Control Systems Lead", "Renewable Energy Consultant"],
        "CIVIL": ["Structural Engineer", "Urban Planner", "Construction Manager"]
    }
    
    possible_roles = dept_careers.get(student.department, dept_careers.get("CSE")) or []
    if not possible_roles: possible_roles = ["Software Engineer"] # Fallback
    selected_roles = random.sample(possible_roles, min(3, len(possible_roles)))
    
    career_compass = []
    base_match = int(student.current_cgpa * 8) + 10 # Base match % based on CGPA
    
    for role in selected_roles:
        match = min(98, base_match + random.randint(-5, 10))
        career_compass.append({
            "role": role,
            "fit": f"{match}% Match",
            "icon": random.choice(["🚀", "📊", "🧠", "🔧", "⚡", "🏗️"])
        })
        
    # 2. Learning Analytics Logic
    dept_subjects = {
        "CSE": ["Data Structures", "Algorithms", "OS", "DBMS", "Networks", "AI", "Compiler Design"],
        "ECE": ["Circuits", "Digital Electronics", "Signals & Systems", "Microprocessors", "Communication"],
        "MECH": ["Thermodynamics", "Fluid Mechanics", "Kinematics", "Manufacturing", "CAD/CAM"],
        "EEE": ["Circuit Theory", "Machines", "Power Systems", "Control Systems", "Analog Electronics"],
        "CIVIL": ["Mechanics", "Structures", "Surveying", "Geotech", "Hydraulics"]
    }
    
    subjects = dept_subjects.get(student.department, dept_subjects.get("CSE")) or []
    random.shuffle(subjects)
    
    strong = subjects[:3]
    weak = subjects[3:5]
    
    ai_data = {
        "career_suggestions": json.dumps(career_compass),
        "recommended_courses": json.dumps({"strong": strong, "weak": weak})
    }

    if not student.ai_scores:
        student.ai_scores = models.AIScore(
            student_id=student.id,
            consistency_index=round(float(random.uniform(0.6, 0.95)), 2),
            skill_gap_score=round(float(random.uniform(10, 40)), 1),
            career_suggestions=ai_data["career_suggestions"],
            recommended_courses=ai_data["recommended_courses"]
        )
        db.add(student.ai_scores)
    else:
        # Populate missing data for existing records
        if not student.ai_scores.career_suggestions:
            student.ai_scores.career_suggestions = ai_data["career_suggestions"]
        if not student.ai_scores.recommended_courses:
            student.ai_scores.recommended_courses = ai_data["recommended_courses"]
    
    db.commit()
    
    return student

def _generate_dynamic_action_plan(stats: schemas.InstitutionalStats, df: pd.DataFrame):
    # Logic to vary the plan based on stats
    high_risk_ratio = stats.risk_ratio > 15
    low_dna = stats.dna_score < 75
    
    strategies = []
    if high_risk_ratio:
        strategies.append(schemas.ActionPlanStrategy(label="Intensive Care Unit (ICU)", detail="Daily 1:1 check-ins for students in the 'Critical Zone' cluster."))
    else:
        strategies.append(schemas.ActionPlanStrategy(label="Proactive Mentorship", detail="Bi-weekly peer-led workshops for underperforming students."))
        
    if low_dna:
        strategies.append(schemas.ActionPlanStrategy(label="Skill DNA Reconstruction", detail="Revised curriculum focus on fundamental engineering principles."))
    else:
        strategies.append(schemas.ActionPlanStrategy(label="Advanced Honors Track", detail="Integrate industry-level certifications for 'High Achiever' clusters."))

    strategies.append(schemas.ActionPlanStrategy(label="Digital Lab Expansion", detail="Upgrade 30% of existing labs with specialized AI/ML server nodes."))

    # Roadmap
    roadmap = [
        schemas.ActionPlanStep(title="Phase 1: Target", detail=f"Identify the top {min(50, stats.total_students)} at-risk students for immediate counseling."),
        schemas.ActionPlanStep(title="Phase 2: Deploy", detail="Launch the new dynamic learning portal for autonomous progress tracking."),
        schemas.ActionPlanStep(title="Phase 3: Verify", detail="Assess improvement index after the mid-semester evaluation cycle.")
    ]

    # Quote depends on something
    quote = f"With a Growth Index of {stats.avg_growth_index}, we have a strong foundation to increase institutional ROI by targeting the current {stats.risk_ratio}% risk gap."

    return schemas.DynamicActionPlan(
        executive_summary="Closing the Skill Gap & Improving DNA Score",
        roi_efficiency=f"+{int(25 - stats.risk_ratio/2)}%",
        strategies=strategies,
        resource_label="Digital Infrastructure",
        resource_value=f"₹ {round(float(stats.total_students * 0.15), 1)}L",
        roadmap=roadmap,
        insight_quote=quote
    )

@router.get("/overview", response_model=schemas.DashboardOverview)
def get_dashboard_overview(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    # 1. Fetch Basic Data
    students = db.query(models.Student).all()
    total_students = len(students)
    
    # 2. Institutional Stats & DNA Score Initialization
    if total_students == 0:
        # Return zeros/placeholders to satisfy schema if no students
        inst_stats = schemas.InstitutionalStats(
            total_students=0,
            active_students=0,
            placement_readiness_avg=0.0,
            dna_score=0.0,
            risk_ratio=0.0,
            avg_growth_index=0.0
        )
        early_warning = schemas.EarlyWarningStats(
            high_risk_count=0,
            medium_risk_count=0,
            low_risk_percent=100.0,
            dropout_probability_next_6m=0.0
        )
        forecast = schemas.PlacementForecast(
            forecast_placement_percent=0.0,
            core_vs_it_ratio="0:0",
            avg_career_readiness=0.0,
            skill_gap_avg=0.0
        )
        resource_opt = schemas.ResourceOptimization(
            faculty_load_percent=0.0,
            lab_utilization_percent=0.0,
            remedial_need_percent=0.0,
            coaching_demand="No data"
        )
        action_plan = schemas.DynamicActionPlan(
            executive_summary="No data",
            roi_efficiency="0%",
            strategies=[],
            resource_label="N/A",
            resource_value="0",
            roadmap=[],
            insight_quote="System ready for data."
        )
        
        return schemas.DashboardOverview(
            institutional=inst_stats,
            early_warning=early_warning,
            performance_clusters=[],
            department_ranking=[],
            placement_forecast=forecast,
            faculty_impact=[],
            resource_opt=resource_opt,
            weekly_insight="Add students to generate insights.",
            action_plan=action_plan
        )
        
    df = pd.DataFrame([
        {
            "id": s.id,
            "cgpa": s.current_cgpa,
            "growth": s.growth_index,
            "skill": s.academic_dna_score, # Using dna score as skill depth for formula
            "readiness": s.career_readiness_score,
            "risk": 1 if s.risk_level == "High" else (0.5 if s.risk_level == "Medium" else 0.1),
            "dept": s.department
        } for s in students
    ])

    # 2. Institutional Stats & DNA Score
    avg_cgpa = df['cgpa'].mean()
    avg_growth = df['growth'].mean()
    avg_skill = df['skill'].mean()
    avg_readiness = df['readiness'].mean()
    avg_risk_stability = 1 - df['risk'].mean()

    # Formula: (0.30 * CGPA/10 * 100) + (0.20 * Growth/5 * 100) + (0.20 * Skill) + (0.15 * Readiness) + (0.15 * Risk Stability * 100)
    # Mapping to 0-100 scale
    dna_score = (
        (0.30 * (avg_cgpa / 10) * 100) +
        (0.20 * (avg_growth / 5) * 100) +
        (0.20 * avg_skill) +
        (0.15 * avg_readiness) +
        (0.15 * avg_risk_stability * 100)
    )

    inst_stats = schemas.InstitutionalStats(
        total_students=total_students,
        active_students=total_students, # Logic for "active" can be refined later
        placement_readiness_avg=round(float(avg_readiness), 2),
        dna_score=round(float(dna_score), 2),
        risk_ratio=round(float(df['risk'].mean() * 100), 2),
        avg_growth_index=round(float(avg_growth), 2)
    )

    # 3. Early Warning Stats
    high_risk = len(df[df['risk'] == 1])
    med_risk = len(df[df['risk'] == 0.5])
    
    early_warning = schemas.EarlyWarningStats(
        high_risk_count=high_risk,
        medium_risk_count=med_risk,
        low_risk_percent=round(float((total_students - high_risk - med_risk) / total_students * 100), 2),
        dropout_probability_next_6m=round(float((high_risk / total_students * 0.8 + med_risk / total_students * 0.3) * 100), 2)
    )

    # 4. KMeans Clustering
    perf_clusters = []
    if total_students >= 4:
        X = df[['cgpa', 'growth', 'skill']].values
        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10).fit(X)
        df['cluster'] = kmeans.labels_
        
        cluster_names = ["High Achievers", "Stable Performers", "Improving Students", "Critical Zone"]
        # Sort cluster names based on avg CGPA of cluster to ensure mapping is somewhat consistent
        cluster_centers = kmeans.cluster_centers_
        # Simple heuristic: Higher sum of centers = better cluster
        rank_idx = np.argsort(np.sum(cluster_centers, axis=1))[::-1]
        
        for i, real_idx in enumerate(rank_idx):
            count = len(df[df['cluster'] == real_idx])
            perf_clusters.append(schemas.PerformanceCluster(
                name=cluster_names[i],
                count=count,
                percentage=round(float(count / total_students * 100), 2),
                description=f"Group with average CGPA of {round(float(cluster_centers[real_idx][0]),2)}"
            ))
    else:
        # Placeholder clusters if too few for clustering
        perf_clusters = [
            schemas.PerformanceCluster(name="Small Data Sample", count=total_students, percentage=100.0, description="Need at least 4 students for clustering analysis.")
        ]

    # 5. Department Ranking
    dept_stats = df.groupby('dept').agg({
        'cgpa': 'mean',
        'growth': 'mean',
        'readiness': 'mean',
        'skill': 'mean',
        'risk': lambda x: (x == 1).astype(int).sum() / len(x) * 100
    }).reset_index()
    
    # Calculate a composite score for ranking
    dept_stats['composite'] = (dept_stats['cgpa'] * 2 + dept_stats['growth'] * 10 + dept_stats['readiness']).rank(ascending=False)
    
    dept_ranking = [
        schemas.DeptPerformanceRank(
            department=row['dept'],
            avg_cgpa=round(float(row['cgpa']), 2),
            avg_growth=round(float(row['growth']), 2),
            placement_readiness=round(float(row['readiness']), 2),
            skill_score=round(float(row['skill']), 2),
            risk_percent=round(float(row['risk']), 2),
            overall_rank=int(row['composite'])
        ) for _, row in dept_stats.sort_values('composite').iterrows()
    ]

    # 6. Placement Forecast
    forecast = schemas.PlacementForecast(
        forecast_placement_percent=round(float(avg_readiness * 0.9 + 5), 2), # Simple heuristic
        core_vs_it_ratio="45:55",
        avg_career_readiness=round(float(avg_readiness), 2),
        skill_gap_avg=round(float(100 - avg_skill), 2)
    )

    # 7. Faculty Impact & Resource Opt
    staff = db.query(models.Staff).limit(5).all()
    faculty_impact = [
        schemas.FacultyImpactRank(
            name=s.user.full_name if s.user else "Faculty",
            dept=s.department,
            feedback_consistency=round(float(s.consistency_score * 100), 2),
            improvement_impact=round(float(random.uniform(70, 95)), 2),
            impact_score=round(float(s.consistency_score * 40 + s.student_feedback_rating * 12), 2)
        ) for s in staff
    ]

    resource_opt = schemas.ResourceOptimization(
        faculty_load_percent=round(float(random.uniform(65, 85)), 2),
        lab_utilization_percent=round(float(random.uniform(70, 90)), 2),
        remedial_need_percent=round(float(early_warning.dropout_probability_next_6m * 1.5), 2),
        coaching_demand="High for Mathematics and ML"
    )

    # 8. Weekly Insight
    best_dept = dept_ranking[0].department if dept_ranking else "N/A"
    worst_dept = dept_ranking[-1].department if dept_ranking else "N/A"
    weekly_insight = f"{best_dept} department shows strong placement readiness but {worst_dept} requires focused remedial intervention in Core Engineering subjects."

    # 9. Dynamic Action Plan
    action_plan = _generate_dynamic_action_plan(inst_stats, df)

    return schemas.DashboardOverview(
        institutional=inst_stats,
        early_warning=early_warning,
        performance_clusters=perf_clusters,
        department_ranking=dept_ranking,
        placement_forecast=forecast,
        faculty_impact=faculty_impact,
        resource_opt=resource_opt,
        weekly_insight=weekly_insight,
        action_plan=action_plan
    )

@router.get("/stats")
def get_admin_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    total_students = db.query(models.Student).count()
    # Assuming total strength is the same or some fixed number for now, or just total users
    total_strength = db.query(models.User).count()
    
    return {
        "total_strength": total_strength,
        "total_students": total_students
    }

@router.get("/students", response_model=List[schemas.Student])
def get_students(
    department: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    query = db.query(models.Student).join(models.User)
    
    if department:
        query = query.filter(models.Student.department == department)
    if year:
        query = query.filter(models.Student.year == year)
    if risk_level and risk_level != "ALL":
        if risk_level == "AT_RISK":
            query = query.filter(models.Student.risk_level.in_(["High", "Medium"]))
        else:
            query = query.filter(models.Student.risk_level == risk_level)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.User.full_name.ilike(search_term)) | 
            (models.Student.roll_number.ilike(search_term)) |
            (models.User.email.ilike(search_term))
        )
    
    students = query.all()
    
    # Enrich with weakness if available
    for s in students:
        if not s.ai_scores or not s.ai_scores.recommended_courses:
            _generate_ai_insights(s, db)
            
        if s.ai_scores and s.ai_scores.recommended_courses:
            try:
                courses = json.loads(s.ai_scores.recommended_courses)
                s.weakness = ", ".join(courses.get("weak", []))
            except:
                s.weakness = "N/A"
        else:
            s.weakness = "Analyzing..."
            
    return students

@router.get("/students/{student_id}", response_model=schemas.StudentDetail)
def get_student_detail(
    student_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    student = db.query(models.Student).filter(
        (models.Student.id == student_id) | 
        (models.Student.roll_number == student_id) |
        (models.Student.user_id == student_id)
    ).first()
    
    if not student:
        return {"error": "Student not found"}
        
    # --- Dynamic AI Insight Generation (Unique per student) ---
    _generate_ai_insights(student, db)

    return student

@router.delete("/students/{student_id}")
def delete_student(
    student_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
        
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        return {"error": "Student not found"}
        
    # Delete User accounts associated
    db.query(models.User).filter(models.User.id == student.user_id).delete()
    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully"}

@router.delete("/staff/{staff_id}")
def delete_staff(
    staff_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
        
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        return {"error": "Staff not found"}
        
    db.query(models.User).filter(models.User.id == staff.user_id).delete()
    db.delete(staff)
    db.commit()
    return {"message": "Staff deleted successfully"}

@router.get("/staff", response_model=List[schemas.Staff])
def get_staff(
    department: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    query = db.query(models.Staff).join(models.User)
    if department:
        query = query.filter(models.Staff.department == department)
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (models.User.full_name.ilike(search_term)) | 
            (models.User.email.ilike(search_term))
        )
        
    return query.all()

@router.get("/staff/{staff_id}", response_model=schemas.StaffDetail)
def get_staff_detail(
    staff_id: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    # Try lookup by UUID (internal id), human-readable staff_id, or user_id
    staff = db.query(models.Staff).filter(
        (models.Staff.id == staff_id) | 
        (models.Staff.staff_id == staff_id) |
        (models.Staff.user_id == staff_id)
    ).first()
    
    if not staff:
        return {"error": "Staff not found"}
        
    return staff

@router.post("/students", response_model=schemas.Student)
def create_student(
    student_in: schemas.StudentCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    # 1. Generate Institutional Email: firstname.deptbatch@gmail.com
    batch = {1: "25", 2: "24", 3: "23", 4: "22"}.get(student_in.year, "25")
    name_parts = student_in.full_name.strip().split()
    first_name = name_parts[0].lower()
    dept_code = student_in.department.lower()
    
    base_email = f"{first_name}.{dept_code}{batch}@gmail.com"
    
    # Collision check
    existing = db.query(models.User).filter(models.User.institutional_email == base_email).first()
    if existing and len(name_parts) > 1:
        # Try with initial: firstnameinitial.deptbatch@gmail.com
        initial = name_parts[-1][0].lower()
        base_email = f"{first_name}{initial}.{dept_code}{batch}@gmail.com"
    
    # Further collision check (fallback to random if still exists)
    existing_again = db.query(models.User).filter(models.User.institutional_email == base_email).first()
    if existing_again:
        base_email = f"{first_name}{random.randint(10, 99)}.{dept_code}{batch}@gmail.com"

    # 2. Generate Roll Number
    roll_number = f"7376{batch}{student_in.department.upper()}{student_in.year}{random.randint(100, 999)}"

    # 3. Create User
    # Use institutional email as the primary login email as requested
    generated_password = f"{name_parts[0].capitalize()}@{roll_number[-4:]}#"
    
    new_user = models.User(
        email=base_email, # This is the institutional email
        full_name=student_in.full_name,
        hashed_password=auth.get_password_hash(student_in.password if student_in.password else generated_password),
        plain_password=student_in.password if student_in.password else generated_password,
        role=models.UserRole.STUDENT,
        institutional_email=base_email
    )
    db.add(new_user)
    db.flush()

    # 4. Create Student Profile
    new_student = models.Student(
        user_id=new_user.id,
        roll_number=roll_number,
        department=student_in.department,
        year=student_in.year,
        dob=student_in.dob,
        blood_group=student_in.blood_group,
        parent_phone=student_in.parent_phone,
        personal_phone=student_in.personal_phone,
        personal_email=student_in.personal_email,
        previous_school=student_in.previous_school,
        current_cgpa=student_in.current_cgpa, # Use provided CGPA
        academic_dna_score=0.0,
        growth_index=0.0,
        risk_level="Low",
        career_readiness_score=0.0
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    # 5. Generate Initial AI Profile
    _generate_ai_insights(new_student, db)
    
    return new_student

@router.post("/staff", response_model=schemas.Staff)
def create_staff(
    staff_in: schemas.StaffCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    # 1. Generate Institutional Email
    name_parts = staff_in.full_name.strip().split()
    first_name = name_parts[0].lower()
    random_id = random.randint(100, 999)
    inst_email = f"{first_name}{staff_in.department.lower()}{random_id}@gmail.com"

    # 2. Create User
    generated_password = f"{name_parts[0].capitalize()}@{inst_email.split('@')[0][-4:]}#"
    
    new_user = models.User(
        email=inst_email,
        full_name=staff_in.full_name,
        hashed_password=auth.get_password_hash(staff_in.password if staff_in.password else generated_password),
        plain_password=staff_in.password if staff_in.password else generated_password,
        role=models.UserRole.FACULTY,
        institutional_email=inst_email
    )
    db.add(new_user)
    db.flush()

    # 3. Create Staff Profile
    new_staff = models.Staff(
        user_id=new_user.id,
        staff_id=staff_in.staff_id if staff_in.staff_id else f"STF{staff_in.department}{random_id}",
        department=staff_in.department,
        designation=staff_in.designation,
        be_degree=staff_in.be_degree,
        be_college=staff_in.be_college,
        me_degree=staff_in.me_degree,
        me_college=staff_in.me_college,
        primary_skill=staff_in.primary_skill,
        personal_email=staff_in.personal_email,
        personal_phone=staff_in.personal_phone
    )
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)
    return new_staff

@router.post("/remedial-assessments", response_model=List[schemas.RemedialAssessment])
def assign_remedial_assessment(
    assessment_in: schemas.RemedialAssessmentCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
    
    assignments = []
    for student_id in assessment_in.student_ids:
        new_assessment = models.RemedialAssessment(
            student_id=student_id,
            subject=assessment_in.subject,
            admin_id=current_user.id
        )
        db.add(new_assessment)
        assignments.append(new_assessment)
    
    db.commit()
    for a in assignments:
        db.refresh(a)
        # Convert date to string for schema compatibility
        a.assigned_at = a.assigned_at.isoformat()
        
    return assignments

@router.get("/department-insights", response_model=schemas.DepartmentOverview)
def get_department_insights(
    department: str = Query(..., description="The department to get insights for"),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.ADMIN:
        return {"error": "Unauthorized"}
        
    # 1. Fetch Department Data
    if department == "ALL":
        students = db.query(models.Student).all()
        staff = db.query(models.Staff).all()
        display_dept = "Institution-Wide"
    else:
        students = db.query(models.Student).filter(models.Student.department == department).all()
        staff = db.query(models.Staff).filter(models.Staff.department == department).all()
        display_dept = department
    
    total_students = len(students)
    if total_students == 0:
        # Return empty/default data if no students
        return _generate_empty_dept_overview(department)
        
    # Calculate Overview Metrics
    avg_cgpa = sum([s.current_cgpa for s in students]) / total_students
    avg_readiness = sum([s.career_readiness_score for s in students]) / total_students
    
    high_risk = len([s for s in students if s.risk_level == "High"])
    risk_index = (high_risk / total_students) * 100 if total_students > 0 else 0
    
    # New: Placement readiness breakdown
    coding_score = round(avg_readiness * 8.5 + random.uniform(-5, 5), 1)
    comm_score = round(avg_readiness * 7.5 + random.uniform(-5, 5), 1)
    core_skill_score = round(avg_readiness * 9.0 + random.uniform(-5, 5), 1)
    
    metrics = schemas.DeptOverviewMetrics(
        total_students=total_students,
        avg_cgpa=round(avg_cgpa, 2),
        placement_readiness=round(avg_readiness * 10, 1),
        coding_readiness=coding_score,
        communication_readiness=comm_score,
        core_skill_depth=core_skill_score,
        risk_index=round(risk_index, 1),
        core_performance=round(avg_cgpa * 8.5, 1),
        ai_health_score=min(100.0, round(100 - risk_index + (avg_cgpa * 2), 1)),
        stability_indicator="Stable" if risk_index < 15 else ("Monitoring" if risk_index < 30 else "Intervention Needed"),
        # New Fields
        dropout_probability_forecast=round(risk_index * 0.8 + random.uniform(2, 8), 1),
        placement_forecast_percent=min(100.0, round(avg_readiness * 0.95 + 5, 1)),
        skill_gap_index_core_it=round(random.uniform(15, 45), 1),
        total_faculty=len(staff),
        hod_name="Dr. Arul Prasad" if department == "AIML" else "Dr. Sathish Kumar"
    )

    # 2. Enhanced Subject Performance
    subjects = [
        schemas.SubjectPerformance(
            subject_name="Data Structures & Algorithms", 
            pass_percentage=78.5, 
            failure_density=21.5, 
            is_most_difficult=True, 
            skill_gap_score=12.4, 
            dependency_risk_text="Critical for Placement readiness",
            is_core=True,
            backlog_rate=8.2,
            internal_external_gap=12.5
        ),
        schemas.SubjectPerformance(
            subject_name="Database Management", 
            pass_percentage=89.0, 
            failure_density=11.0, 
            is_most_difficult=False, 
            skill_gap_score=4.2, 
            dependency_risk_text="Core technical strength",
            is_core=True,
            backlog_rate=2.4,
            internal_external_gap=4.8
        ),
        schemas.SubjectPerformance(
            subject_name="Operating Systems", 
            pass_percentage=61.0, 
            failure_density=39.0, 
            is_most_difficult=True, 
            skill_gap_score=18.5, 
            dependency_risk_text="High risk cluster in Section B",
            is_core=True,
            backlog_rate=14.5,
            internal_external_gap=22.1
        ),
        schemas.SubjectPerformance(
            subject_name="System Design", 
            pass_percentage=94.5, 
            failure_density=5.5, 
            is_most_difficult=False, 
            skill_gap_score=2.1, 
            dependency_risk_text="Advanced readiness indicator",
            is_core=False,
            backlog_rate=0.5,
            internal_external_gap=1.2
        )
    ]

    # 3. Process Faculty Intelligence (Enhanced)
    faculties = []
    for s in staff[:3]: # Limit to top 3 for dashboard
        base_score = random.uniform(80, 95)
        faculties.append(schemas.FacultyIntelligence(
            faculty_name=s.user.full_name if s.user else "Faculty Member",
            teaching_impact_score=round(base_score, 1),
            student_improvement_index=round(random.uniform(5, 12), 1),
            subject_difficulty_handling=round(random.uniform(70, 98), 1),
            feedback_sentiment=random.choice(["Positive", "Positive", "Highly Positive"]),
            attendance_influence_percent=round(random.uniform(90, 99), 1),
            ai_suggestion=f"Assign {random.choice(['DSA', 'DBMS', 'OS'])} based on high pedagogical impact.",
            feedback_summary_ai=f"Strong domain expertise in {s.primary_skill or 'Core Subjects'}. Students appreciate the practical application scenarios.",
            subject_comparison_score=round(random.uniform(75, 95), 1)
        ))

    # 4. Micro Segmentation & Clusters
    clusters = {
        "High Achievers": len([s for s in students if s.current_cgpa >= 8.5]),
        "Stable": len([s for s in students if 7.0 <= s.current_cgpa < 8.5]),
        "Improving": len([s for s in students if s.growth_index > 50 and s.current_cgpa < 7.0]),
        "At Risk": len([s for s in students if s.risk_level in ["High", "Medium"]])
    }
    
    micro_segments = [
        schemas.DeptStudentMicroSegment(
            cluster_name=name,
            count=count,
            core_weak_count=int(count * random.uniform(0.1, 0.4)),
            aptitude_weak_count=int(count * random.uniform(0.1, 0.5)),
            attendance_risk_count=int(count * random.uniform(0.05, 0.2)),
            emotional_stress_risk_count=int(count * random.uniform(0.01, 0.15)),
            trend_change=random.choice(["+2%", "+5%", "-3%", "Stable"])
        ) for name, count in clusters.items() if count > 0
    ]

    # 5. Trend Forecast (Comparing with Institutional Averages)
    current_year = 2024
    trends = schemas.DeptTrendAndForecast(
        cgpa_trend_3yr=[
            schemas.TrendForecast(year=str(current_year - 2), avg_cgpa=round(random.uniform(7.8, 8.2), 2)),
            schemas.TrendForecast(year=str(current_year - 1), avg_cgpa=round(random.uniform(7.9, 8.4), 2)),
            schemas.TrendForecast(year=str(current_year), avg_cgpa=round(avg_cgpa, 2)),
        ],
        placement_trend_forecast=round(avg_readiness * 10 + 5, 1),
        next_semester_risk_prediction=round(risk_index * 0.85, 1),
        lab_utilization_correlation="Strong Positive (+0.88)",
        ai_insight=f"Growth Trend: Department is outperforming institutional average by 12% in Core Technical Depth."
    )
    
    # 6. Action Engine & Optimizations
    intervention = schemas.DeptInterventionRecommendation(
        remedial_class_list=["Operating Systems", "DSA - Remedial Batch"],
        bootcamp_recommendation="4-Week Full Stack Intensive Bootcamp",
        faculty_reallocation_suggestion="Move Faculty A to handle OS Section B risk cluster",
        lab_hour_increase_suggestion="Increase Lab hours for DBMS by 20% for Semester 5",
        syllabus_adjustment="Add 'Prompt Engineering' module to AI/ML core subjects"
    )

    resources = schemas.DeptResourceOptimization(
        faculty_load_balance=random.uniform(85, 95),
        lab_usage_percent=random.uniform(75, 90),
        subject_allocation_efficiency=random.uniform(88, 99),
        elective_demand_forecast="High demand (84%) for Advanced ML and Cybersecurity electives."
    )

    advanced = schemas.DeptAdvancedAIFeatures(
        digital_twin_simulation_ready=True,
        skill_evolution_trend=round(random.uniform(8.0, 15.0), 1),
        ai_risk_alert_feed=[
            f"{display_dept}: OS pass % dropped below threshold in Section B",
            "High performer consistency detected in Year 3 AIML",
            "Placement eligibility for TCS increased by 14% this month"
        ],
        graduation_rate=round(random.uniform(92, 98), 1),
        avg_time_to_placement=round(random.uniform(3.5, 5.5), 1),
        higher_studies_percent=round(random.uniform(10, 25), 1),
        startup_founders_count=random.randint(2, 8),
        research_paper_count=random.randint(15, 45)
    )
    
    dropout_map = [
        schemas.DeptDropoutProbability(region_label="Skill Gap", probability_percent=18.5),
        schemas.DeptDropoutProbability(region_label="Academic Stress", probability_percent=22.0),
        schemas.DeptDropoutProbability(region_label="Financial Risk", probability_percent=5.0),
        schemas.DeptDropoutProbability(region_label="Engagement Gap", probability_percent=12.5)
    ]

    weekly_report = schemas.WeeklyIntelligenceReport(
        summary=f"{display_dept} show strong placement momentum but high DBMS risk in Sem 3.",
        recommendation="Recommend remedial sessions and mock coding drive within 2 weeks.",
        generated_at="2024-03-24"
    )

    comparative_analysis = [
        schemas.DeptVsInstitution(metric="Avg CGPA", dept_value=round(avg_cgpa, 2), inst_value=7.89),
        schemas.DeptVsInstitution(metric="Placement Index", dept_value=round(avg_readiness * 10, 1), inst_value=71.2),
        schemas.DeptVsInstitution(metric="Risk Ratio", dept_value=round(risk_index, 1), inst_value=9.4),
        schemas.DeptVsInstitution(metric="Skill Match", dept_value=round(core_skill_score, 1), inst_value=68.5),
    ]

    return schemas.DepartmentOverview(
        department_name=department,
        metrics=metrics,
        subjects=subjects,
        faculty=faculties,
        micro_segments=micro_segments,
        dropout_probability_map=dropout_map,
        trends=trends,
        intervention_engine=intervention,
        resource_opt=resources,
        advanced_ai=advanced,
        weekly_report=weekly_report,
        comparative_analysis=comparative_analysis
    )


def _generate_empty_dept_overview(department: str):
    """Helper to return empty schema structure if no students exist in dept."""
    return schemas.DepartmentOverview(
        department_name=department,
        metrics=schemas.DeptOverviewMetrics(
            total_students=0, avg_cgpa=0, placement_readiness=0, coding_readiness=0, 
            communication_readiness=0, core_skill_depth=0, risk_index=0, 
            core_performance=0, ai_health_score=0, stability_indicator="N/A",
            dropout_probability_forecast=0, placement_forecast_percent=0,
            skill_gap_index_core_it=0, total_faculty=0, hod_name="N/A"
        ),
        subjects=[], faculty=[], micro_segments=[], dropout_probability_map=[],
        trends=schemas.DeptTrendAndForecast(cgpa_trend_3yr=[], placement_trend_forecast=0, next_semester_risk_prediction=0, lab_utilization_correlation="N/A", ai_insight="Insufficient data"),
        intervention_engine=schemas.DeptInterventionRecommendation(remedial_class_list=[], bootcamp_recommendation="N/A", faculty_reallocation_suggestion="N/A", lab_hour_increase_suggestion="N/A", syllabus_adjustment="N/A"),
        resource_opt=schemas.DeptResourceOptimization(faculty_load_balance=0, lab_usage_percent=0, subject_allocation_efficiency=0, elective_demand_forecast="N/A"),
        advanced_ai=schemas.DeptAdvancedAIFeatures(
            digital_twin_simulation_ready=False, skill_evolution_trend=0, ai_risk_alert_feed=[],
            graduation_rate=0, avg_time_to_placement=0, higher_studies_percent=0,
            startup_founders_count=0, research_paper_count=0
        ),
        weekly_report=schemas.WeeklyIntelligenceReport(summary="No data", recommendation="N/A", generated_at="N/A"),
        comparative_analysis=[]
    )
