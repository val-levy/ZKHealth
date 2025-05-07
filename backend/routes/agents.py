from fastapi import APIRouter, HTTPException, Body, Path
from pydantic import BaseModel, Field
from utils.aptos_client import AptosClient
from utils.contract_client import ContractClient
from typing import List
from aptos_sdk.async_client import RestClient
from aptos_sdk.account import Account

router = APIRouter(prefix="/agents", tags=["agents"])
aptos_client = AptosClient()

class AgentCreate(BaseModel):
    agent_type: int = Field(
        ...,
        description="Type of agent to create: 0 for patient, 1 for provider",
        example=0
    )

class CustodianAdd(BaseModel):
    custodian_address: str = Field(
        ...,
        description="Aptos address of the custodian to add",
        example="0x123abc..."
    )

@router.post("/create",
    description="Create a new agent (patient or provider) in the system",
    response_description="Returns the new agent's address and public key",
    responses={
        200: {
            "description": "Agent created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "address": "0x123abc...",
                        "public_key": "0x456def...",
                        "private_key": "0x789ghi..."
                    }
                }
            }
        }
    }
)
async def create_agent(data: AgentCreate = Body(..., example={
    "agent_type": 0
})):
    try:
        account = await aptos_client.create_account()
        contract_client = ContractClient(account)
        await contract_client.create_agent(data.agent_type)
        return {
            "address": str(account.address()),
            "public_key": str(account.public_key()),
            "private_key": account.private_key.hex()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{address}/custodians",
    description="Add a custodian for an agent",
    responses={
        200: {
            "description": "Custodian added successfully",
            "content": {
                "application/json": {
                    "example": {
                        "status": "success"
                    }
                }
            }
        }
    }
)
async def add_custodian(
    address: str = Path(..., description="Address of the agent", example="0x123abc..."),
    data: CustodianAdd = Body(..., example={
        "custodian_address": "0x456def..."
    })
):
    try:
        contract_client = ContractClient(aptos_client.create_account())  # TODO: Use proper account management
        await contract_client.client.account_resources(address)  # Verify account exists
        await contract_client.add_custodian(data.custodian_address)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{address}/custodians",
    description="Get all custodians for an agent",
    response_description="List of custodian addresses",
    responses={
        200: {
            "description": "List of custodian addresses",
            "content": {
                "application/json": {
                    "example": [
                        "0x456def...",
                        "0x789ghi..."
                    ]
                }
            }
        }
    }
)
async def get_custodians(
    address: str = Path(..., description="Address of the agent", example="0x123abc...")
) -> List[str]:
    try:
        resources = await aptos_client.get_account_resource(
            address,
            f"{aptos_client.contract_address}::Agent::Agent"
        )
        return resources.get("custodians", []) if resources else []
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))