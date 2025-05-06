from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.aptos_client import AptosClient
from utils.contract_client import ContractClient
from typing import List
from aptos_sdk.async_client import RestClient
from aptos_sdk.account import Account

router = APIRouter(prefix="/agents", tags=["agents"])
aptos_client = AptosClient()

class AgentCreate(BaseModel):
    agent_type: int  # 0 = patient, 1 = provider

class CustodianAdd(BaseModel):
    custodian_address: str

@router.post("/create")
async def create_agent(data: AgentCreate):
    try:
        account = aptos_client.create_account()
        contract_client = ContractClient(account)
        await contract_client.create_agent(data.agent_type)
        return {"address": account.address(), "public_key": account.public_key()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{address}/custodians")
async def add_custodian(address: str, data: CustodianAdd):
    try:
        contract_client = ContractClient(aptos_client.create_account())  # TODO: Use proper account management
        await contract_client.client.account_resources(address)  # Verify account exists
        await contract_client.add_custodian(data.custodian_address)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{address}/custodians")
async def get_custodians(address: str) -> List[str]:
    try:
        resources = await aptos_client.get_account_resource(
            address,
            f"{aptos_client.contract_address}::Agent::Agent"
        )
        return resources.get("custodians", []) if resources else []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))