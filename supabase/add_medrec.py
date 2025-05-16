# Assume you have these context values:
import os
from dotenv import load_dotenv


current_user_wallet = ""
current_provider_wallet = ""  
cid = input("CID: ")
supabase_file_url = f"https://your.supabase.co/storage/v1/object/public/medical-records/{input("File name: ")}"

from db import add_medical_record

add_medical_record(
    cid=cid,
    file_url=supabase_file_url,
    patient_wallet=current_user_wallet,
    provider_wallet=current_provider_wallet
)
