from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.aptos_client import AptosClient
from utils.contract_client import ContractClient

router = APIRouter(prefix="/relationships", tags=["relationships"])
aptos_client = AptosClient()

class RelationshipCreate(BaseModel):
    provider_address: str
    patient_private_key: str  # Private key of the patient creating the relationship

class ViewerAdd(BaseModel):
    viewer_address: str
    patient_private_key: str

@router.post("/create")
async def create_relationship(data: RelationshipCreate):
    try:
        account = Account.load_key(data.patient_private_key)
        contract_client = ContractClient(account)
        tx_hash = await contract_client.create_relationship(data.provider_address)
        return {"status": "success", "tx_hash": tx_hash}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{patient_address}/viewers")
async def add_viewer(patient_address: str, data: ViewerAdd):
    try:
        account = Account.load_key(data.patient_private_key)
        contract_client = ContractClient(account)
        tx_hash = await contract_client.add_viewer(data.viewer_address)
        return {"status": "success", "tx_hash": tx_hash}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{patient_address}/provider/{provider_address}/viewers")
async def get_viewers(patient_address: str, provider_address: str):
    try:
        resources = await aptos_client.get_account_resource(
            patient_address,
            f"{aptos_client.contract_address}::Relationship::Relationships"
        )
        relationships = resources.get("relationships", {})
        return relationships.get(provider_address, {}).get("viewers", [])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))