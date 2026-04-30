#!/usr/bin/env python3
import json
import requests
import sys

PB_URL = "http://192.168.31.10:8091"
ADMIN_EMAIL = "admin@yourdomain.com"
ADMIN_PASSWORD = "yourpassword123"

def authenticate():
    response = requests.post(
        f"{PB_URL}/api/admins/auth-with-password",
        json={"identity": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["token"]
    else:
        print(f"Authentication failed: {response.text}")
        sys.exit(1)

def import_collections(token, collections):
    headers = {
        "Authorization": f"Admin {token}",
        "Content-Type": "application/json"
    }

    for col in collections:
        print(f"Creating collection: {col['name']}...")
        response = requests.post(
            f"{PB_URL}/api/collections",
            headers=headers,
            json=col
        )
        if response.status_code == 200:
            print(f"  ✓ {col['name']} created successfully")
        else:
            print(f"  ✗ Failed to create {col['name']}: {response.text}")

def main():
    with open("pb_collections_import.json", "r") as f:
        collections = json.load(f)

    print("Authenticating with PocketBase...")
    token = authenticate()
    print("Authentication successful!\n")

    print("Importing collections...")
    import_collections(token, collections)

    print("\nDone!")

if __name__ == "__main__":
    main()
