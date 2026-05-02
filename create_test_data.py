#!/usr/bin/env python3
import requests
import sys

PB_URL = "http://192.168.31.10:8091"
ADMIN_EMAIL = "wjhandel@163.com"
ADMIN_PASSWORD = "50394289"

# Parent user ID (test2@test.com)
PARENT_USER_ID = "t7at49lq14x7r52"

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

def create_child_profile(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    data = {
        "parent": PARENT_USER_ID,
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

def get_tasks_fields(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{PB_URL}/api/collections/tasks", headers=headers, timeout=10)
    if resp.status_code == 200:
        fields = resp.json().get("fields", [])
        field_names = [f["name"] for f in fields]
        print(f"Tasks fields: {field_names}")
        return field_names
    return []

def create_tasks(token, child_id):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    # Get actual fields
    field_names = get_tasks_fields(token)

    # Build task with actual field names
    task_data = {}
    if "title" in field_names:
        task_data["title"] = "早起打卡"
    if "description" in field_names:
        task_data["description"] = "早晨7:30前起床并整理床铺"
    if "pointValue" in field_names:
        task_data["pointValue"] = 10
    if "limitType" in field_names:
        task_data["limitType"] = "daily"
    if "childId" in field_names:
        task_data["childId"] = child_id

    print(f"Creating tasks with data: {task_data}")
    response = requests.post(
        f"{PB_URL}/api/collections/tasks/records",
        headers=headers,
        json=task_data,
        timeout=10
    )
    if response.status_code == 200:
        print(f"  ✓ Task created")
    else:
        print(f"  ✗ Failed: {response.status_code} - {response.text}")

def get_badges_fields(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{PB_URL}/api/collections/badges", headers=headers, timeout=10)
    if resp.status_code == 200:
        fields = resp.json().get("fields", [])
        field_names = [f["name"] for f in fields]
        print(f"Badges fields: {field_names}")
        return field_names
    return []

def get_rewards_fields(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{PB_URL}/api/collections/rewards", headers=headers, timeout=10)
    if resp.status_code == 200:
        fields = resp.json().get("fields", [])
        field_names = [f["name"] for f in fields]
        print(f"Rewards fields: {field_names}")
        return field_names
    return []

def main():
    print(f"Connecting to PocketBase at {PB_URL}...")
    token = authenticate()
    print("Authentication successful!\n")

    # Create child profile
    child_id = create_child_profile(token)
    if child_id:
        create_tasks(token, child_id)

    # Show fields for other collections
    get_badges_fields(token)
    get_rewards_fields(token)

    print("\nDone!")

if __name__ == "__main__":
    main()
