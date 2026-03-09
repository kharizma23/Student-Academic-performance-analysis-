import requests

token_res = requests.post("http://127.0.0.1:8000/auth/token", data={"username": "anita.aiml25@gmail.com", "password": "Anita#1001!"})
if token_res.status_code != 200:
    print(f"Login failed: {token_res.text}")
    exit(1)
token = token_res.json()["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# Generate 100-day roadmap
print("Generating roadmap...")
gen_res = requests.post("http://127.0.0.1:8000/student/generate-roadmap", headers=headers, json={"goal": "Master Programming"})
todos = gen_res.json()

# Get study plan
print("Fetching study plan...")
plan_res = requests.get("http://127.0.0.1:8000/student/study-plan", headers=headers)
plan = plan_res.json()

print(f"Total Study Days Generated: {len(plan)}")
print(f"Total Tasks Generated: {len(todos)}")

dsa_tasks = [t for t in todos if "[DSA]" in t["task_name"]]
print(f"DSA tasks: {len(dsa_tasks)}")

# Print first 5 days
print("\nFirst 5 Days of Study Plan:")
for day in plan[:5]:
    print(f"Day {day['day_number']}: {day['topic']}")

# Complete a task to see if Day 1 turns green
first_dsa_task = dsa_tasks[0]
print(f"\nCompleting task: {first_dsa_task['task_name']}")

complete_res = requests.post(f"http://127.0.0.1:8000/student/todos/{first_dsa_task['id']}/complete", headers=headers, json={"time_spent": 30})
res_data = complete_res.json()
print("Completion Response:", res_data)

# Fetch plan again to see if it's completed
plan_res = requests.get("http://127.0.0.1:8000/student/study-plan", headers=headers)
plan2 = plan_res.json()

completed_days = [d for d in plan2 if d["is_completed"]]
print(f"Total Completed Days: {len(completed_days)}")
if completed_days:
    print(f"Completed Day Details: Day {completed_days[0]['day_number']} - {completed_days[0]['topic']}")
