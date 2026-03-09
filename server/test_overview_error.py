import httpx
import json

def test_overview():
    # 1. Login to get token
    login_url = "http://127.0.0.1:8000/auth/token"
    login_data = {"username": "admin@gmail.com", "password": "admin23"}
    
    try:
        with httpx.Client() as client:
            resp = client.post(login_url, data=login_data)
            if resp.status_code != 200:
                print(f"Login failed: {resp.status_code} - {resp.text}")
                return
            
            token = resp.json().get("access_token")
            print(f"Token obtained: {token[:10]}...")
            
            # 2. Call overview endpoint
            headers = {"Authorization": f"Bearer {token}"}
            overview_url = "http://127.0.0.1:8000/admin/overview"
            resp = client.get(overview_url, headers=headers)
            
            print(f"Overview Status: {resp.status_code}")
            if resp.status_code != 200:
                print(f"Error Response: {resp.text}")
            else:
                print("Success!")
                
    except Exception as e:
        print(f"Exception: {str(e)}")

if __name__ == "__main__":
    test_overview()
