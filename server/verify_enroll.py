import requests

def verify():
    import random
    uid = random.randint(1000, 9999)
    base_url = "http://localhost:8000"
    try:
        # 1. Login
        print("Logging in...")
        login = requests.post(f"{base_url}/auth/token", data={
            "username": "admin@gmail.com",
            "password": "admin23"
        })
        login.raise_for_status()
        token = login.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Add Student
        print("Adding student...")
        student_data = {
            "full_name": "Verify Student",
            "department": "AIML",
            "year": 1,
            "dob": "2005-01-01",
            "blood_group": "O+",
            "parent_phone": "9876543210",
            "personal_phone": "9876543210",
            "personal_email": f"verify_enroll_{uid}@gmail.com",
            "previous_school": "Verify High"
        }
        s_resp = requests.post(f"{base_url}/admin/students", json=student_data, headers=headers)
        print(f"Student Status: {s_resp.status_code}")
        if s_resp.status_code != 200:
            print(f"Student Error: {s_resp.text}")
        else:
            print("Student added successfully!")

        # 3. Add Staff
        print("Adding staff...")
        staff_data = {
            "full_name": "Verify Staff",
            "department": "AIML",
            "designation": "Professor",
            "personal_email": f"verify_staff_enroll_{uid}@gmail.com",
            "personal_phone": "9876543210",
            "be_degree": "B.E. AIML",
            "be_college": "IIT M",
            "me_degree": "M.E. AI",
            "me_college": "Stanford",
            "primary_skill": "Deep Learning"
        }
        f_resp = requests.post(f"{base_url}/admin/staff", json=staff_data, headers=headers)
        print(f"Staff Status: {f_resp.status_code}")
        if f_resp.status_code != 200:
            print(f"Staff Error: {f_resp.text}")
        else:
            print("Staff added successfully!")

    except Exception as e:
        print(f"Verification Failed: {e}")

if __name__ == "__main__":
    verify()
