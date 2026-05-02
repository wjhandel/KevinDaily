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

def create_tasks(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    tasks = [
        {"title": "早起打卡", "desc": "早晨7:30前起床并整理床铺", "reward": 10, "recurrence": "daily", "active": True},
        {"title": "跳绳500个", "desc": "增强体质", "reward": 25, "recurrence": "daily", "active": True},
        {"title": "Anki单词复习", "desc": "高效复习英语生词", "reward": 30, "recurrence": "daily", "active": True},
        {"title": "多邻国完成1单元", "desc": "保持连胜", "reward": 15, "recurrence": "weekly", "active": True},
        {"title": "整理书桌", "desc": "保持学习环境整洁", "reward": 5, "recurrence": "daily", "active": True},
    ]

    print("Creating tasks...")
    for task in tasks:
        task["parent"] = PARENT_USER_ID
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

def create_badges(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    badges = [
        {"name": "早起鸟", "description": "连续7天早起打卡", "icon": "🐦", "color": "#4CAF50", "iconColor": "#4CAF50", "isActive": True},
        {"name": "运动达人", "description": "完成10次运动任务", "icon": "🏃", "color": "#2196F3", "iconColor": "#2196F3", "isActive": True},
        {"name": "学习标兵", "description": "连续7天完成学习任务", "icon": "📚", "color": "#9C27B0", "iconColor": "#9C27B0", "isActive": True},
    ]

    print("Creating badges...")
    for badge in badges:
        response = requests.post(
            f"{PB_URL}/api/collections/badges/records",
            headers=headers,
            json=badge,
            timeout=10
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
        {"title": "30分钟游戏时间", "desc": "兑换30分钟游戏时间", "cost": 50, "status": "active", "stock": 10},
        {"title": "冰淇淋", "desc": "美味的冰淇淋一个", "cost": 30, "status": "active", "stock": 5},
        {"title": "周末电影", "desc": "周末看一部电影", "cost": 100, "status": "active", "stock": 2},
    ]

    print("Creating rewards...")
    for reward in rewards:
        reward["parent"] = PARENT_USER_ID
        response = requests.post(
            f"{PB_URL}/api/collections/rewards/records",
            headers=headers,
            json=reward,
            timeout=10
        )
        if response.status_code == 200:
            print(f"  ✓ Reward created: {reward['title']}")
        else:
            print(f"  ✗ Failed: {reward['title']} - {response.text}")

def main():
    print(f"Connecting to PocketBase at {PB_URL}...")
    token = authenticate()
    print("Authentication successful!\n")

    child_id = create_child_profile(token)
    create_tasks(token)
    create_badges(token)
    create_rewards(token)

    print("\nDone! All test data created successfully.")

if __name__ == "__main__":
    main()
