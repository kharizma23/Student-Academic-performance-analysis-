from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.ai.risk_model import RiskModel
from app.ai.cgpa_model import CGPAModel
from app.ai.skills_model import SkillsModel

router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)

# Initialize models
risk_model = RiskModel()
cgpa_model = CGPAModel()
skills_model = SkillsModel()

class RiskRequest(BaseModel):
    attendance_percentage: float
    cgpa_trend: float
    failed_subjects: int
    feedback_score: Optional[float] = 0.0

class CGPAPredictRequest(BaseModel):
    history: List[float]

class SkillsGapRequest(BaseModel):
    current_skills: List[Dict[str, Any]] # [{"name": "Python", "level": 3}]
    required_skills: List[str]

@router.post("/predict-risk")
def predict_risk(request: RiskRequest):
    result = risk_model.predict(request.dict())
    return result

@router.post("/predict-cgpa")
def predict_cgpa(request: CGPAPredictRequest):
    prediction = cgpa_model.predict_next_semester(request.history)
    growth = cgpa_model.analyze_growth(prediction, request.history[-1] if request.history else 0)
    return {
        "predicted_next_cgpa": prediction,
        "growth_analysis": growth
    }

@router.post("/analyze-skills")
def analyze_skills(request: SkillsGapRequest):
    result = skills_model.analyze_gap(request.current_skills, request.required_skills)
    return result
