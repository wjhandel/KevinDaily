#!/usr/bin/env python3
import requests
import sys

PB_URL = "http://192.168.31.10:8091"
ADMIN_EMAIL = "wjhandel@163.com"
ADMIN_PASSWORD = "Baby09030913"

def authenticate():
    response = requests.post(
        f"{PB_URL}/api/admins/auth-with-password",
        json={"identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["token"]
    else:
        print(f"Authentication failed: {response.status_code} - {response.text}")
        sys.exit(1)

def create_child_profile(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    data = {
        "name": "小明",
        "nickname": "Kevin",
        "points": 100,
        "level": 1,
        "birthDate": "2018-01-01",
        "gender": "boy"
    }

    print("Creating child profile...")
    response = requests.post(
        f"{PB_URL}/api/collections/child_profiles/records",
        headers=headers,
        json=data
    )
    if response.status_code == 200:
        print(f"  ✓ Child profile created: {response.json()['id']}")
        return response.json()['id']
    else:
        print(f"  ✗ Failed: {response.status_code} - {response.text}")
        return None

def create_parent_user(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    data = {
        "name": "家长",
        "email": "parent@test.com",
        "password": "password123",
        "passwordConfirm": "password123",
        "role": "parent",
        "account": "parent@test.com",
        "isAdmin": False
    }

    print("Creating parent user...")
    response = requests.post(
        f"{PB_URL}/api/collections/users/records",
        headers=headers,
        json=data
    )
    if response.status_code == 200:
        print(f"  ✓ Parent user created: {response.json()['id']}")
        return response.json()['id']
    else:
        print(f"  ✗ Failed: {response.status_code} - {response.text}")
        return None

def main():
    print("Authenticating with PocketBase...")
    token = authenticate()
    print("Authentication successful!\n")

    child_id = create_child_profile(token)
    parent_id = create_parent_user(token)

    print("\nDone!")
    if child_id:
        print(f"Child ID: {child_id}")
    if parent_id:
        print(f"Parent login: parent@test.com / password123")

if __name__ == "__main__":
    main()
