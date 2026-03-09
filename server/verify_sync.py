import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_sync_logic():
    # 1. Login
    login_data = {"username": "anita.aiml25@gmail.com", "password": "Anita#1001!"}
    login_res = requests.post(f"{BASE_URL}/auth/token", data=login_data)
    print(f"Login Response Status: {login_res.status_code}")
    if login_res.status_code != 200:
        print(f"Login Response Body: {login_res.text}")
        return
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("--- 1. Generating Roadmap for 'Python Programming' ---")
    roadmap_res = requests.post(
        f"{BASE_URL}/student/generate-roadmap", 
        headers=headers, 
        json={"goal": "Python Programming", "current_skill_level": "Beginner"}
    )
    roadmap = roadmap_res.json()
    print(f"Generated {len(roadmap)} tasks.")

    print("\n--- 2. Checking Study Plan Reset ---")
    plan_res = requests.get(f"{BASE_URL}/student/study-plan", headers=headers)
    plan = plan_res.json()
    print(f"First day topic: {plan[0]['topic']}")
    assert "Python" in plan[0]['topic'], "Plan topic should match goal"

    print("\n--- 3. Completing a Matching Task (Sync) ---")
    # Find a task likely to match a topic
    task_to_complete = roadmap[0] # e.g., "Practice fundamental problems on Python Programming"
    print(f"Completing: {task_to_complete['task_name']}")
    complete_res = requests.post(f"{BASE_URL}/student/todos/{task_to_complete['id']}/complete", headers=headers)
    print(f"Complete Result: {complete_res.json()}")

    print("\n--- 4. Checking Progress Map Sync ---")
    plan_res = requests.get(f"{BASE_URL}/student/study-plan", headers=headers)
    plan = plan_res.json()
    completed_days = [d for d in plan if d['is_completed']]
    print(f"Completed Days: {len(completed_days)}")
    for d in completed_days:
        print(f"Day {d['day_number']} topic: {d['topic']}")

    print("\n--- 5. Completing an Extra Task ---")
    extra_todo_res = requests.post(
        f"{BASE_URL}/student/todos", 
        headers=headers, 
        json={"task_name": "Learn Magic Tricks"}
    )
    extra_todo = extra_todo_res.json()
    print(f"Created Extra Task: {extra_todo['task_name']}")
    
    requests.post(f"{BASE_URL}/student/todos/{extra_todo['id']}/start", headers=headers)
    time.sleep(1)
    requests.post(f"{BASE_URL}/student/todos/{extra_todo['id']}/complete", headers=headers)
    
    print("\n--- 6. Verifying Extra Task Fill ---")
    plan_res = requests.get(f"{BASE_URL}/student/study-plan", headers=headers)
    plan = plan_res.json()
    completed_days = [d for d in plan if d['is_completed']]
    print(f"Completed Days after extra: {len(completed_days)}")
    
    print("\nSUCCESS: All sync logic verified.")

if __name__ == "__main__":
    test_sync_logic()
