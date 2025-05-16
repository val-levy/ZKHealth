
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Add a new user (PAT or PRO)
def add_user(wallet: str, role: str) -> dict:
    assert role in ["PAT", "PRO"], "Invalid role"
    result = supabase.table("app_users").insert({
        "wallet": wallet,
        "role": role
    }).execute()
    return result.data[0] if result.data else {"error": result.error}

# Create a relationship between patient and provider
def add_relationship(patient_wallet: str, provider_wallet: str) -> dict:
    # Get user IDs
    pat = supabase.table("app_users").select("id").eq("wallet", patient_wallet).execute()
    pro = supabase.table("app_users").select("id").eq("wallet", provider_wallet).execute()

    if not pat.data or not pro.data:
        return {"error": "Patient or Provider not found"}

    result = supabase.table("relationships").insert({
        "patient_id": pat.data[0]["id"],
        "provider_id": pro.data[0]["id"]
    }).execute()
    return result.data[0] if result.data else {"error": result.error}

# Link an IPFS file to a patient (and optionally a provider)
def add_medical_record(cid: str, file_url: str, patient_wallet: str, provider_wallet: str = None) -> dict:
    # Get user IDs
    pat = supabase.table("app_users").select("id").eq("wallet", patient_wallet).execute()
    if not pat.data:
        return {"error": "Patient not found"}
    patient_id = pat.data[0]["id"]

    provider_id = None
    if provider_wallet:
        pro = supabase.table("app_users").select("id").eq("wallet", provider_wallet).execute()
        if not pro.data:
            return {"error": "Provider not found"}
        provider_id = pro.data[0]["id"]

    record = {
        "cid": cid,
        "file_url": file_url,
        "patient_id": patient_id,
        "provider_id": provider_id
    }

    result = supabase.table("medical_records").insert(record).execute()
    return result.data[0] if result.data else {"error": result.error}
