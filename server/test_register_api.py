import requests

def test_registration():
    url = "http://localhost:8000/users/"
    user_data = {
        "email": "test@gmail.com",
        "password": "testpassword",
        "role": "student"
    }
    try:
        response = requests.post(url, json=user_data, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_registration()
