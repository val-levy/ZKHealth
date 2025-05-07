from fastapi import APIRouter, HTTPException, Body, Path
from pydantic import BaseModel, Field
from utils.aptos_client import AptosClient
from utils.contract_client import ContractClient
from aptos_sdk.account import Account
from typing import Optional
from enum import IntEnum

router = APIRouter(prefix="/records", tags=["medical_records"])
aptos_client = AptosClient()

class RecordType(IntEnum):
    GENERAL = 0
    LAB = 1
    PRESCRIPTION = 2
    IMAGING = 3

class RecordCreate(BaseModel):
    patient_address: str = Field(..., description="Aptos address of the patient", example="0x123abc...")
    data_hash: str = Field(..., description="Hash of the medical record data", example="0xabcdef1234567890...")
    record_type: RecordType = Field(..., description="Type of medical record", example=RecordType.GENERAL)
    provider_private_key: str = Field(..., description="Private key of the provider", example="0xaabbcc...")

class Record(BaseModel):
    id: int = Field(..., example=1)
    patient_address: str = Field(..., example="0x123abc...")
    provider_address: str = Field(..., example="0x789ghi...")
    data_hash: str = Field(..., example="0xabcdef1234567890...")
    timestamp: int = Field(..., example=1636000000)
    record_type: RecordType = Field(..., example=RecordType.GENERAL)
    is_active: bool = Field(..., example=True)

class RecordStatus(BaseModel):
    is_active: bool = Field(..., description="New status for the record", example=True)
    provider_private_key: str = Field(..., description="Private key of the provider", example="0xaabbcc...")

@router.post("/create",
    description="Create a new medical record",
    responses={
        200: {
            "description": "Record created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success",
                        "tx_hash": "0x123..."
                    }
                }
            }
        }
    }
)
async def create_record(data: RecordCreate = Body(..., example={
        "patient_address": "0x123abc...",
        "data_hash": "0xabcdef1234567890...",
        "record_type": 0,
        "provider_private_key": "0xaabbcc..."
    })):
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

@router.get("/{patient_address}/{record_id}",
    description="Get a specific medical record",
    response_model=Record,
    responses={
        200: {
            "description": "Medical record details",
            "content": {
                "application/json": {
                    "example": {
                        "id": 1,
                        "patient_address": "0x123abc...",
                        "provider_address": "0x789ghi...",
                        "data_hash": "0xabcdef1234567890...",
                        "timestamp": 1636000000,
                        "record_type": 0,
                        "is_active": True
                    }
                }
            }
        }
    }
)
async def get_record(
    patient_address: str = Path(..., description="Address of the patient", example="0x123abc..."),
    record_id: int = Path(..., description="ID of the record", example=1)
) -> Record:
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

@router.post("/{patient_address}/{record_id}/status",
    description="Update the status of a medical record",
    responses={
        200: {
            "description": "Record status updated successfully",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success",
                        "tx_hash": "0x123..."
                    }
                }
            }
        }
    }
)
async def update_record_status(
    patient_address: str = Path(..., description="Address of the patient", example="0x123abc..."),
    record_id: int = Path(..., description="ID of the record", example=1),
    data: RecordStatus = Body(..., example={
        "is_active": True,
        "provider_private_key": "0xaabbcc..."
    })
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