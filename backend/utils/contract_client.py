from aptos_sdk.async_client import RestClient
from aptos_sdk.account import Account
from aptos_sdk.transactions import TransactionArgument, EntryFunction, TransactionPayload
from aptos_sdk.type_tag import TypeTag, StructTag
from config import get_settings

settings = get_settings()

class ContractClient:
    def __init__(self, account: Account):
        self.client = RestClient(settings.APTOS_NODE_URL)
        self.account = account
        self.contract_address = settings.CONTRACT_ADDRESS

    async def create_agent(self, agent_type: int):
        payload = EntryFunction.natural(
            f"{self.contract_address}::Agent",
            "create_agent",
            [],
            [TransactionArgument(agent_type, Serializer.u8)]
        )
        signed_tx = await self.client.create_bcs_signed_transaction(
            self.account, TransactionPayload(payload)
        )
        return await self.client.submit_bcs_transaction(signed_tx)

    async def create_relationship(self, provider_address: str):
        payload = EntryFunction.natural(
            f"{self.contract_address}::Relationship",
            "create_relationship",
            [],
            [TransactionArgument(provider_address, Serializer.address)]
        )
        signed_tx = await self.client.create_bcs_signed_transaction(
            self.account, TransactionPayload(payload)
        )
        return await self.client.submit_bcs_transaction(signed_tx)

    async def add_record(self, patient_address: str, data_hash: bytes, record_type: int):
        payload = EntryFunction.natural(
            f"{self.contract_address}::MedicalRecord",
            "add_record",
            [],
            [
                TransactionArgument(patient_address, Serializer.address),
                TransactionArgument(data_hash, Serializer.bytes),
                TransactionArgument(record_type, Serializer.u8)
            ]
        )
        signed_tx = await self.client.create_bcs_signed_transaction(
            self.account, TransactionPayload(payload)
        )
        return await self.client.submit_bcs_transaction(signed_tx)