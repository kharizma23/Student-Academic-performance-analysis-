import sqlite3
import requests

def test_login():
    conn = sqlite3.connect('student_platform.db')
    c = conn.cursor()
    c.execute("SELECT email, institutional_email, plain_password FROM users WHERE email LIKE '%arjun%' OR institutional_email LIKE '%arjun%' LIMIT 1")
    row = c.fetchone()
    conn.close()

    if not row:
        print("User not found.")
        return

    email, inst_email, password = row
    print(f"Found user. Email: {email}, Inst Email: {inst_email}, Password: {password}")

    # Test with primary email
    r1 = requests.post('http://127.0.0.1:8000/auth/token', data={'username': email, 'password': password})
    print(f"Login with primary email status: {r1.status_code}")

    # Test with institutional email
    r2 = requests.post('http://127.0.0.1:8000/auth/token', data={'username': inst_email, 'password': password})
    print(f"Login with institutional email status: {r2.status_code}")

if __name__ == '__main__':
    test_login()
