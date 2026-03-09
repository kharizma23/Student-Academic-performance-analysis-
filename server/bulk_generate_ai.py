from app.database import SessionLocal
from app import models
from app.routers.admin import _generate_ai_insights
import logging

logging.basicConfig(level=logging.INFO)
db = SessionLocal()
try:
    students = db.query(models.Student).all()
    logging.info(f"Generating insights for {len(students)} students...")
    for s in students:
        _generate_ai_insights(s, db)
    logging.info("Bulk AI insight generation complete.")
finally:
    db.close()
