from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Server Configuration
    PORT: int = 8002
    HOST: str = "0.0.0.0"
    
    # Aptos Network Configuration
    APTOS_NODE_URL: str = "https://fullnode.devnet.aptoslabs.com/v1"
    APTOS_FAUCET_URL: str = "https://faucet.devnet.aptoslabs.com"
    CONTRACT_ADDRESS: str = "0x1"
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "MedRec Backend"
    DEBUG: bool = True
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./medrec.db"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()