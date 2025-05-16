import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def add_medical_record(cid: str, file_url: str, user_id: str):
    data = {
        "cid": cid,
        "file_url": file_url,
        "patient_id": user_id
    }
    result = supabase.table("medical_records").insert(data).execute()
    if not result.data:
        print("Supabase insert failed:", result)
    return result.data

def get_medical_records(user_id: str):
    result = supabase.table("medical_records").select("*").eq("patient_id", user_id).execute()
    return result.data
