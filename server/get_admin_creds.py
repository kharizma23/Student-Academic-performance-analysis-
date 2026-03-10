from app.database import SessionLocal
from app.models import User, UserRole

def get_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if admin:
        print(f"Admin Email: {admin.email}")
        print(f"Admin Password: {admin.plain_password}")
    else:
        print("No admin found.")
    db.close()

if __name__ == "__main__":
    get_admin()
