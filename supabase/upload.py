
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import requests

# Load secrets from .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
PINATA_JWT = os.getenv("PINATA_JWT")
BUCKET_NAME = "medical-records"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_to_ipfs(file_path):
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "Authorization": f"Bearer {PINATA_JWT}"
    }
    with open(file_path, "rb") as fp:
        files = {"file": (os.path.basename(file_path), fp)}
        response = requests.post(url, files=files, headers=headers)
        response.raise_for_status()
        return response.json()["IpfsHash"]

def upload_to_supabase(file_path):
    file_name = os.path.basename(upload_to_ipfs(file_path))
    with open(file_path, "rb") as f:
        file_data = f.read()
    supabase.storage.from_(BUCKET_NAME).upload(file_name, file_data)
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)
    return public_url

def main(file_path):
    print("📤 Uploading to IPFS...")
    cid = upload_to_ipfs(file_path)
    print("✅ IPFS CID:", cid)

    print("📤 Uploading to Supabase...")
    supabase_url = upload_to_supabase(file_path)
    print("✅ Supabase URL:", supabase_url)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python upload_with_ipfs.py <file_path>")
        sys.exit(1)

    main(sys.argv[1])
