import sqlite3
from app import auth

def fix_all_staff_passwords():
    conn = sqlite3.connect('student_platform.db')
    c = conn.cursor()
    
    # Get all users with a plain_password that are staff
    c.execute("SELECT id, email, plain_password FROM users WHERE role = 'FACULTY' AND plain_password IS NOT NULL")
    faculty = c.fetchall()
    
    if not faculty:
        print("No faculty records found to update.")
        conn.close()
        return
        
    print(f"Found {len(faculty)} faculty records to synchronize.")
    
    for count, (user_id, email, plain_pw) in enumerate(faculty, 1):
        new_hashed_pw = auth.get_password_hash(plain_pw)
        c.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (new_hashed_pw, user_id))
        
        if count % 20 == 0:
            print(f"Processed {count}/{len(faculty)} records...")
            conn.commit()
            
    conn.commit()
    print(f"Successfully synchronized password hashes for all {len(faculty)} faculty members.")
    conn.close()

if __name__ == '__main__':
    fix_all_staff_passwords()
