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

def create_badges(token):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    badges = [
        {"name": "早起鸟", "description": "连续7天早起打卡", "icon": "🐦", "color": "#4CAF50", "iconColor": "#4CAF50", "condition_type": "streak", "condition_value": "7", "isActive": True},
        {"name": "运动达人", "description": "完成10次运动任务", "icon": "🏃", "color": "#2196F3", "iconColor": "#2196F3", "condition_type": "count", "condition_value": "10", "isActive": True},
        {"name": "学习标兵", "description": "连续7天完成学习任务", "icon": "📚", "color": "#9C27B0", "iconColor": "#9C27B0", "condition_type": "streak", "condition_value": "7", "isActive": True},
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
        {"title": "30分钟游戏时间", "desc": "兑换30分钟游戏时间", "cost": 50, "status": "available", "stock": 10},
        {"title": "冰淇淋", "desc": "美味的冰淇淋一个", "cost": 30, "status": "available", "stock": 5},
        {"title": "周末电影", "desc": "周末看一部电影", "cost": 100, "status": "available", "stock": 2},
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

    create_badges(token)
    create_rewards(token)

    print("\nDone! All test data created successfully.")

if __name__ == "__main__":
    main()
