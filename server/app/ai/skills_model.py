from typing import List, Dict, Any
from .base import AIModel

class SkillsModel(AIModel):
    def analyze_gap(self, current_skills: List[Dict[str, Any]], required_skills: List[str]) -> Dict[str, Any]:
        """
        Analyze skill gap between current skills and required skills.
        current_skills: list of dicts with 'name' and 'level' (1-5)
        required_skills: list of skill names
        """
        current_skill_names = {s['name'].lower() for s in current_skills}
        required_skill_set = {s.lower() for s in required_skills}
        
        missing_skills = list(required_skill_set - current_skill_names)
        match_count = len(required_skill_set) - len(missing_skills)
        
        total_required = len(required_skill_set)
        gap_percentage = 0.0
        if total_required > 0:
            gap_percentage = (len(missing_skills) / total_required) * 100.0
            
        return {
            "gap_percentage": round(gap_percentage, 2),
            "missing_skills": missing_skills,
            "match_count": match_count,
            "total_required": total_required
        }
