import requests
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

def get_token():
    # Attempt to login as Anita
    login_data = {
        "username": "anita.aiml25@gmail.com",
        "password": "Anita#1001!"
    }
    response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.status_code}")
        print(response.text)
        return None

def test_enhanced_features():
    token = get_token()
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}

    print("1. Testing Generate Roadmap (should create 20 tasks)...")
    roadmap_data = {"goal": "DSA"}
    gen_res = requests.post(f"{BASE_URL}/student/generate-roadmap", headers=headers, json=roadmap_data)
    if gen_res.status_code == 200:
        tasks = gen_res.json()
        print(f"SUCCESS: Generated {len(tasks)} tasks.")
        if len(tasks) != 20:
            print(f"FAILED: Expected 20 tasks, got {len(tasks)}")
        else:
            # Check for diversity
            task_names = [t["task_name"] for t in tasks]
            unique_tasks = len(set(task_names))
            print(f"Unique tasks: {unique_tasks}/20")
    else:
        print(f"Roadmap generation failed: {gen_res.status_code}")
        return

    # 2. Test Get Todos (should only show uncompleted)
    print("\n2. Testing Get Todos (should filter out completed)...")
    fetch_res = requests.get(f"{BASE_URL}/student/todos", headers=headers)
    active_tasks = fetch_res.json()
    print(f"Active tasks count: {len(active_tasks)}")

    # 3. Start and Complete a task
    if active_tasks:
        task = active_tasks[0]
        print(f"\n3. Starting and Completing task: {task['task_name']}...")
        start_res = requests.post(f"{BASE_URL}/student/todos/{task['id']}/start", headers=headers)
        print(f"Start Response: {start_res.status_code}")
        
        complete_res = requests.post(f"{BASE_URL}/student/todos/{task['id']}/complete", headers=headers)
        print(f"Complete Response: {complete_res.status_code}")
        
        # 4. Check if it vanished from active list
        fetch_res_after = requests.get(f"{BASE_URL}/student/todos", headers=headers)
        active_tasks_after = fetch_res_after.json()
        print(f"Active tasks after completion: {len(active_tasks_after)}")
        if len(active_tasks_after) == len(active_tasks) - 1:
            print("SUCCESS: Task disappeared from active list.")
        else:
            print("FAILED: Task count did not decrease correctly.")

    # 5. Check Study Plan (should have completed_tasks populated)
    print("\n4. Checking Study Plan for completed task details...")
    plan_res = requests.get(f"{BASE_URL}/student/study-plan", headers=headers)
    if plan_res.status_code == 200:
        plan = plan_res.json()
        completed_with_tasks = [day for day in plan if day["completed_tasks"]]
        print(f"Days with completed tasks: {len(completed_with_tasks)}")
        if completed_with_tasks:
            for day in completed_with_tasks:
                print(f"Day {day['day_number']} has {len(day['completed_tasks'])} completed tasks.")
                for ct in day["completed_tasks"]:
                    print(f" - {ct['task_name']} (Completed at: {ct['completed_at']})")
        else:
            print("FAILED: No completed tasks found in study plan.")
    else:
        print(f"Study plan fetch failed: {plan_res.status_code}")

if __name__ == "__main__":
    test_enhanced_features()
