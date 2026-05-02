#!/usr/bin/env python3
import requests
import sys

PB_URL = "http://192.168.31.10:8091"
ADMIN_EMAIL = "wjhandel@163.com"
ADMIN_PASSWORD = "Baby0903"

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

def create_tasks(token, child_id):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    tasks = [
        {"title": "早起打卡", "description": "早晨7:30前起床并整理床铺", "pointValue": 10, "limitType": "daily", "active": True},
        {"title": "跳绳500个", "description": "增强体质", "pointValue": 25, "limitType": "daily", "active": True},
        {"title": "Anki单词复习", "description": "高效复习英语生词", "pointValue": 30, "limitType": "daily", "active": True},
        {"title": "多邻国完成1单元", "description": "保持连胜", "pointValue": 15, "limitType": "weekly", "active": True},
        {"title": "整理书桌", "description": "保持学习环境整洁", "pointValue": 5, "limitType": "daily", "active": True},
    ]

    print("Creating tasks...")
    for task in tasks:
        task["childId"] = child_id
        response = requests.post(
            f"{PB_URL}/api/collections/tasks/records",
            headers=headers,
            json=task
        )
        if response.status_code == 200:
            print(f"  ✓ Task created: {task['title']}")
        else:
            print(f"  ✗ Failed: {task['title']} - {response.text}")

def create_badges(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    badges = [
        {"name": "早起鸟", "description": "连续7天早起打卡", "icon": "🐦"},
        {"name": "运动达人", "description": "完成10次运动任务", "icon": "🏃"},
        {"name": "学习标兵", "description": "连续7天完成学习任务", "icon": "📚"},
    ]

    print("Creating badges...")
    for badge in badges:
        response = requests.post(
            f"{PB_URL}/api/collections/badges/records",
            headers=headers,
            json=badge
        )
        if response.status_code == 200:
            print(f"  ✓ Badge created: {badge['name']}")
        else:
            print(f"  ✗ Failed: {badge['name']} - {response.text}")

def create_rewards(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    rewards = [
        {"name": "30分钟游戏时间", "description": "兑换30分钟游戏时间", "pointsCost": 50, "active": True},
        {"name": "冰淇淋", "description": "美味的冰淇淋一个", "pointsCost": 30, "active": True},
        {"name": "周末电影", "description": "周末看一部电影", "pointsCost": 100, "active": True},
    ]

    print("Creating rewards...")
    for reward in rewards:
        response = requests.post(
            f"{PB_URL}/api/collections/rewards/records",
            headers=headers,
            json=reward
        )
        if response.status_code == 200:
            print(f"  ✓ Reward created: {reward['name']}")
        else:
            print(f"  ✗ Failed: {reward['name']} - {response.text}")

def main():
    print("Authenticating with PocketBase...")
    token = authenticate()
    print("Authentication successful!\n")

    child_id = create_child_profile(token)
    if child_id:
        create_tasks(token, child_id)

    create_badges(token)
    create_rewards(token)

    print("\nDone! All test data created successfully.")

if __name__ == "__main__":
    main()
