import sqlite3

db_path = "student_platform.db"
try:
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT email, hashed_password FROM users WHERE role='student'")
    for row in c.fetchall():
        print(f"User: {row[0]}, Hash: {row[1]}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
