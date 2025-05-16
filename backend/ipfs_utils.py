import requests
import os
from dotenv import load_dotenv

load_dotenv()

PINATA_JWT = os.getenv("PINATA_JWT")

def upload_to_ipfs(file_path: str) -> str:
    url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "Authorization": f"Bearer {PINATA_JWT}"
    }
    with open(file_path, "rb") as fp:
        files = {"file": (os.path.basename(file_path), fp)}
        response = requests.post(url, files=files, headers=headers)
    if response.status_code == 200:
        return response.json()["IpfsHash"]
    else:
        raise Exception(f"Failed to upload to IPFS: {response.text}")

def download_from_ipfs(cid: str) -> str:
    url = f"https://ipfs.io/ipfs/{cid}"
    response = requests.get(url)
    if response.status_code == 200:
        file_path = f"/tmp/{cid}"
        with open(file_path, 'wb') as f:
            f.write(response.content)
        return file_path
    else:
        raise Exception("Failed to download from IPFS")
