from aptos_sdk.async_client import RestClient, FaucetClient
from aptos_sdk.account import Account
from config import get_settings

settings = get_settings()

class AptosClient:
    def __init__(self):
        self.client = RestClient(settings.APTOS_NODE_URL)
        self.faucet = FaucetClient(settings.APTOS_FAUCET_URL, self.client)
        
    async def get_account_resources(self, address: str):
        return await self.client.account_resources(address)
    
    async def get_account_resource(self, address: str, resource_type: str):
        resources = await self.get_account_resources(address)
        for resource in resources:
            if resource["type"] == resource_type:
                return resource["data"]
        return None

    async def create_account(self) -> Account:
        account = Account.generate()
        await self.faucet.fund_account(account.address(), 100_000_000)
        return account