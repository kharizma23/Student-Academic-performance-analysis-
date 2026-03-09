import sqlite3
import requests
from app import models, auth
from app.database import SessionLocal
import datetime

db = SessionLocal()
# Let's test with Ananya
user = db.query(models.User).filter(models.User.email == "ananya.aiml25@gmail.com").first()

if user:
    access_token_expires = datetime.timedelta(minutes=30)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, 
        expires_delta=access_token_expires
    )
    
    headers = {"Authorization": f"Bearer {access_token}"}
    r = requests.get("http://localhost:8000/student/profile", headers=headers)
    print(f"Status: {r.status_code}")
    data = r.json()
    print("Keys in response:", list(data.keys()))
    if "user" in data:
        print("User object:", data["user"])
    else:
        print("User object MISSING")
else:
    print("Ananya not found")
