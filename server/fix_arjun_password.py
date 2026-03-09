import sqlite3
from app import auth

def fix_staff_password(staff_email_keyword="arjun"):
    conn = sqlite3.connect('student_platform.db')
    c = conn.cursor()
    
    # Find the user
    c.execute("SELECT id, email, institutional_email, plain_password FROM users wHERE email LIKE ? OR institutional_email LIKE ?", (f'%{staff_email_keyword}%', f'%{staff_email_keyword}%'))
    user = c.fetchone()
    
    if not user:
        print(f"User with keyword '{staff_email_keyword}' not found.")
        conn.close()
        return
        
    user_id, email, inst_email, plain_pw = user
    print(f"Fixing password for: {email} / {inst_email}")
    print(f"Current plain password in DB: {plain_pw}")
    
    # Generate new hash based on the plain password
    new_hashed_pw = auth.get_password_hash(plain_pw)
    
    # Update the database
    c.execute("UPDATE users SET hashed_password = ? WHERE id = ?", (new_hashed_pw, user_id))
    conn.commit()
    print("Password hash synchronized successfully.")
    
    # Verify the fix
    c.execute("SELECT hashed_password FROM users WHERE id = ?", (user_id,))
    final_hash = c.fetchone()[0]
    is_valid = auth.verify_password(plain_pw, final_hash)
    print(f"Verification check: {'PASSED' if is_valid else 'FAILED'}")
    
    conn.close()

if __name__ == '__main__':
    fix_staff_password()
