from typing import Dict, Any, List
import numpy as np
from .base import AIModel

class CGPAModel(AIModel):
    def predict_next_semester(self, history: List[float]) -> float:
        """
        Predict next semester CGPA based on history.
        Uses a simple weighted average or linear trend for now.
        """
        if not history:
            return 0.0
        
        if len(history) == 1:
            return history[0]
        
        # Simple trend analysis
        x = np.arange(len(history))
        y = np.array(history)
        
        # Linear regression: y = mx + c
        A = np.vstack([x, np.ones(len(x))]).T
        m, c = np.linalg.lstsq(A, y, rcond=None)[0]
        
        next_val = m * len(history) + c
        return round(min(max(next_val, 0.0), 10.0), 2)

    def analyze_growth(self, current: float, previous: float) -> Dict[str, Any]:
        if previous == 0:
            return {"growth_rate": 0.0, "status": "Stable"}
        
        growth_rate = ((current - previous) / previous) * 100
        
        status = "Stable"
        if growth_rate > 5.0:
            status = "Strong Growth"
        elif growth_rate < -5.0:
            status = "Declining"
            
        return {
            "growth_rate": round(growth_rate, 2),
            "status": status
        }
