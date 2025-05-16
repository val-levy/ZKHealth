import requests
import sys
import imghdr
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load .env credentials
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = "medical-records"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Gateways to try
GATEWAYS = [
    "https://ipfs.io/ipfs",
    "https://gateway.pinata.cloud/ipfs",
    "https://cloudflare-ipfs.com/ipfs"
]

def download_from_ipfs(cid: str):
    for gateway in GATEWAYS:
        url = f"{gateway}/{cid}"
        print(f"🔎 Trying: {url}")
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            content = response.content

            ext = imghdr.what(None, h=content) or "bin"
            filename = f"{cid}.{ext}"

            with open(filename, "wb") as f:
                f.write(content)

            print(f"✅ Downloaded as: {filename}")
            return filename
        except Exception as e:
            print(f"❌ Failed at {gateway}: {e}")
    print("🚫 All gateways failed.")
    return None

def upload_to_supabase(file_path: str):
    file_name = os.path.basename(file_path)
    with open(file_path, "rb") as f:
        file_data = f.read()
    supabase.storage.from_(BUCKET_NAME).upload(file_name, file_data)
    url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)
    print(f"📤 Uploaded to Supabase: {url}")
    return url

def main(cid):
    file_path = download_from_ipfs(cid)
    if file_path:
        upload_to_supabase(file_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python retrieve_and_store.py <CID>")
        sys.exit(1)

    cid = sys.argv[1]
    main(cid)
