from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.aptos_client import AptosClient
from utils.contract_client import ContractClient
from aptos_sdk.account import Account
from typing import Optional

router = APIRouter(prefix="/records", tags=["medical_records"])
aptos_client = AptosClient()

class RecordCreate(BaseModel):
    patient_address: str
    data_hash: str
    record_type: int
    provider_private_key: str

class Record(BaseModel):
    id: int
    patient_address: str
    provider_address: str
    data_hash: str
    timestamp: int
    record_type: int
    is_active: bool

class RecordStatus(BaseModel):
    is_active: bool
    provider_private_key: str

@router.post("/create")
async def create_record(data: RecordCreate):
    try:
        account = Account.load_key(data.provider_private_key)
        contract_client = ContractClient(account)
        tx_hash = await contract_client.add_record(
            data.patient_address,
            bytes.fromhex(data.data_hash.replace("0x", "")),
            data.record_type
        )
        return {"status": "success", "tx_hash": tx_hash}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{patient_address}/{record_id}")
async def get_record(patient_address: str, record_id: int) -> Record:
    try:
        resources = await aptos_client.get_account_resource(
            patient_address,
            f"{aptos_client.contract_address}::MedicalRecord::PatientRecords"
        )
        if not resources or "records" not in resources:
            raise HTTPException(status_code=404, detail="Record not found")
            
        record = resources["records"].get(str(record_id))
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
            
        return Record(**record)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{patient_address}/{record_id}/status")
async def update_record_status(
    patient_address: str,
    record_id: int,
    data: RecordStatus
):
    try:
        account = Account.load_key(data.provider_private_key)
        contract_client = ContractClient(account)
        tx_hash = await contract_client.update_record_status(
            patient_address,
            record_id,
            data.is_active
        )
        return {"status": "success", "tx_hash": tx_hash}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))