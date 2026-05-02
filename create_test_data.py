#!/usr/bin/env python3
import requests
import sys
import json

PB_URL = "http://192.168.31.10:8091"
ADMIN_EMAIL = "wjhandel@163.com"
ADMIN_PASSWORD = "50394289"

def authenticate():
    response = requests.post(
        f"{PB_URL}/api/collections/_superusers/auth-with-password",
        json={"identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["token"]
    else:
        print(f"Authentication failed: {response.status_code} - {response.text}")
        sys.exit(1)

def get_user_id(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # List users to find our user
    response = requests.get(
        f"{PB_URL}/api/collections/users/records",
        headers=headers,
        timeout=10
    )
    if response.status_code == 200:
        data = response.json()
        items = data.get("items", [])
        for user in items:
            if user.get("email") == ADMIN_EMAIL:
                return user["id"]
    print(f"Could not find user ID")
    return None

def create_child_profile(token, parent_id):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    data = {
        "parent": parent_id,
        "nickname": "小明",
        "birthDate": "2018-01-01",
        "gender": "boy",
        "points": 100
    }

    print("Creating child profile...")
    response = requests.post(
        f"{PB_URL}/api/collections/child_profiles/records",
        headers=headers,
        json=data,
        timeout=10
    )
    if response.status_code == 200:
        print(f"  ✓ Child profile created: {response.json()['id']}")
        return response.json()['id']
    else:
        print(f"  ✗ Failed: {response.status_code} - {response.text}")
        return None

def create_tasks(token, child_id):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # First check what fields tasks collection has
    print("Checking tasks collection structure...")
    resp = requests.get(f"{PB_URL}/api/collections/tasks", headers=headers, timeout=10)
    if resp.status_code == 200:
        fields = resp.json().get("fields", [])
        field_names = [f["name"] for f in fields]
        print(f"  Tasks fields: {field_names}")

    tasks = [
        {"title": "早起打卡", "description": "早晨7:30前起床并整理床铺", "pointValue": 10, "limitType": "daily"},
        {"title": "跳绳500个", "description": "增强体质", "pointValue": 25, "limitType": "daily"},
        {"title": "Anki单词复习", "description": "高效复习英语生词", "pointValue": 30, "limitType": "daily"},
        {"title": "多邻国完成1单元", "description": "保持连胜", "pointValue": 15, "limitType": "weekly"},
        {"title": "整理书桌", "description": "保持学习环境整洁", "pointValue": 5, "limitType": "daily"},
    ]

    print("Creating tasks...")
    for task in tasks:
        task["childId"] = child_id
        response = requests.post(
            f"{PB_URL}/api/collections/tasks/records",
            headers=headers,
            json=task,
            timeout=10
        )
        if response.status_code == 200:
            print(f"  ✓ Task created: {task['title']}")
        else:
            print(f"  ✗ Failed: {task['title']} - {response.text}")

def check_and_create_collections(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Check badges collection
    print("\nChecking badges collection...")
    resp = requests.get(f"{PB_URL}/api/collections/badges", headers=headers, timeout=10)
    if resp.status_code == 200:
        fields = resp.json().get("fields", [])
        field_names = [f["name"] for f in fields]
        print(f"  Badges fields: {field_names}")

    # Check rewards collection
    print("\nChecking rewards collection...")
    resp = requests.get(f"{PB_URL}/api/collections/rewards", headers=headers, timeout=10)
    if resp.status_code == 200:
        fields = resp.json().get("fields", [])
        field_names = [f["name"] for f in fields]
        print(f"  Rewards fields: {field_names}")

def main():
    print(f"Connecting to PocketBase at {PB_URL}...")
    token = authenticate()
    print("Authentication successful!\n")

    # Get user ID
    print("Getting user ID...")
    user_id = get_user_id(token)
    if not user_id:
        print("Failed to get user ID")
        return
    print(f"  User ID: {user_id}")

    # Check collections structure
    check_and_create_collections(token)

    # Create child profile
    child_id = create_child_profile(token, user_id)
    if child_id:
        create_tasks(token, child_id)

    print("\nDone!")

if __name__ == "__main__":
    main()
