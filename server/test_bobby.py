import sqlite3
import requests

from app import models, auth
from app.database import SessionLocal
import datetime
from jose import jwt

db = SessionLocal()
other_student = db.query(models.User).filter(models.User.email == "sanjay.s.ft25@gmail.com").first()

if other_student:
    access_token_expires = datetime.timedelta(minutes=30)
    access_token = auth.create_access_token(
        data={"sub": other_student.email, "role": other_student.role}, 
        expires_delta=access_token_expires
    )
    
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get("http://localhost:8000/student/profile", headers=headers)
    print(f"Status from Bobby: {r.status_code}")
    print(r.text)
else:
    print("Bobby not found")
