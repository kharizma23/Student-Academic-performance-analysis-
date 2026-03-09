from typing import List, Dict, Any
import numpy as np

class AIModel:
    def parse_input(self, data: Any) -> np.ndarray:
        raise NotImplementedError

    def predict(self, data: Any) -> Any:
        raise NotImplementedError
