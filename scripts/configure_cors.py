import os
import json
import urllib.request
from google.cloud import storage
import google.auth
from google.oauth2 import service_account
import google.auth.transport.requests

script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
sa_path = os.path.join(project_dir, 'serviceAccountKey.json')
cors_path = os.path.join(project_dir, 'cors.json')

print(f"Loading service account from {sa_path}")
print(f"Loading CORS config from {cors_path}")

with open(cors_path, 'r') as f:
    cors_config = json.load(f)

client = storage.Client.from_service_account_json(sa_path)

# Potential Firebase Storage bucket names for project college-erp-system-df02d
candidate_buckets = [
    'college-erp-system-df02d.firebasestorage.app',
    'college-erp-system-df02d.appspot.com',
    'college-erp-system-df02d'
]

configured = False

for bucket_name in candidate_buckets:
    print(f"\nChecking bucket: {bucket_name}")
    try:
        bucket = client.bucket(bucket_name)
        if not bucket.exists():
            print(f"Bucket {bucket_name} does not exist, attempting creation...")
            try:
                bucket = client.create_bucket(bucket_name, location='us')
                print(f"Bucket {bucket_name} created successfully!")
            except Exception as ce:
                print(f"Bucket creation error for {bucket_name}: {ce}")
                continue

        print(f"Bucket {bucket_name} exists! Applying CORS configuration...")
        bucket.cors = cors_config
        bucket.patch()
        print(f"SUCCESS: CORS applied to {bucket_name}!")
        print(f"Current CORS rules on {bucket_name}: {bucket.cors}")
        configured = True
    except Exception as e:
        print(f"Error configuring CORS for {bucket_name}: {e}")

if not configured:
    print("\nWarning: Could not configure CORS on candidate buckets. Will attempt creating standard bucket.")
    try:
        b_name = 'college-erp-system-df02d.appspot.com'
        bucket = client.create_bucket(b_name, location='us')
        bucket.cors = cors_config
        bucket.patch()
        print(f"Successfully created and configured CORS on {b_name}")
    except Exception as e:
        print(f"Final bucket attempt error: {e}")
