from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from db import add_medical_record, get_medical_records
from ipfs_utils import upload_to_ipfs, download_from_ipfs
import os
import uuid

app = FastAPI()

# ✅ Allow cross-origin from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5175"] for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/upload")
async def options_upload(request: Request):
    return JSONResponse(content={"status": "ok"})

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user_id: str = Form(...)):
    temp_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    try:
        cid = upload_to_ipfs(temp_path)
        file_url = f"https://dxosifgcyzghpryexhrc.supabase.co/storage/v1/object/public/medical-records/{file.filename}"
        result = add_medical_record(cid, file_url, user_id)
    finally:
        os.remove(temp_path)

    return {"cid": cid, "file_url": file_url, "db_result": result}

@app.get("/records/{user_id}")
def list_records(user_id: str):
    return {"records": get_medical_records(user_id)}

@app.get("/download/{cid}")
def download_file(cid: str):
    file_path = download_from_ipfs(cid)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=file_path, filename=os.path.basename(file_path))
