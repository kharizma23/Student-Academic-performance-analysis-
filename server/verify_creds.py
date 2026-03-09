
import requests
import random
import string

def test_gen():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Login as Admin
    passwords = ["adminpassword", "password", "admin", "12345678"]
    login_res = None
    for pwd in passwords:
        login_data = {"username": "admin@gmail.com", "password": pwd}
        login_res = requests.post(f"{base_url}/auth/token", data=login_data)
        if login_res.status_code == 200:
            break
        
    if not login_res or login_res.status_code != 200:
        print(f"Admin login failed: {login_res.text if login_res else 'No response'}")
        return
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Test Student Creation (Omit Password)
    student_data = {
        "full_name": "Test Student Gen",
        "personal_email": f"test.student.{random.randint(100, 999)}@example.com",
        "department": "CSE",
        "year": 1,
        "dob": "2005-01-01",
        "blood_group": "B+",
        "parent_phone": "9876543210",
        "personal_phone": "9876543210",
        "previous_school": "Test School",
        "current_cgpa": 8.5
    }
    
    print("\nAttempting to create student without password...")
    res = requests.post(f"{base_url}/admin/students", json=student_data, headers=headers)
    if res.status_code == 200:
        data = res.json()
        print(f"SUCCESS: Student created.")
        print(f"Roll Number: {data['roll_number']}")
        # We need to check the user record to see the generated email/password
        # StudentDetail schema includes user
        detail_res = requests.get(f"{base_url}/admin/students/{data['id']}", headers=headers)
        user_data = detail_res.json()["user"]
        print(f"Generated Email: {user_data['email']}")
        print(f"Generated Plain Password: {user_data['plain_password']}")
    else:
        print(f"FAILED: {res.status_code} - {res.text}")

    # 3. Test Staff Creation (Omit Password)
    staff_data = {
        "full_name": "Test Staff Gen",
        "personal_email": f"test.staff.{random.randint(100, 999)}@example.com",
        "department": "IT",
        "designation": "Assistant Professor",
        "personal_phone": "9876543210",
        "primary_skill": "Python"
    }

    print("\nAttempting to create staff without password...")
    res = requests.post(f"{base_url}/admin/staff", json=staff_data, headers=headers)
    if res.status_code == 200:
        data = res.json()
        print(f"SUCCESS: Staff created.")
        print(f"Staff ID: {data['staff_id']}")
        # Check user record
        detail_res = requests.get(f"{base_url}/admin/staff/{data['id']}", headers=headers)
        user_data = detail_res.json()["user"]
        print(f"Generated Email: {user_data['email']}")
        print(f"Generated Plain Password: {user_data['plain_password']}")
    else:
        print(f"FAILED: {res.status_code} - {res.text}")

if __name__ == "__main__":
    test_gen()
