import requests

def test_login():
    url = "http://localhost:8000/auth/token"
    data = {
        "username": "admin@gmail.com",
        "password": "admin"
    }
    try:
        response = requests.post(url, data=data, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_login()
