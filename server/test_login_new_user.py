import requests

def test_login_new_user():
    url = "http://localhost:8000/auth/token"
    # test@gmail.com / testpassword (from previous test_register_api.py)
    data = {
        "username": "test@gmail.com",
        "password": "testpassword"
    }
    try:
        response = requests.post(url, data=data, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_login_new_user()
