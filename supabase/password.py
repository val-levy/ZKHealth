import bcrypt

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    return hashed.decode()

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed_password.encode())

def register_user(password: str) -> dict:
    if len(password) < 8:
        return {"success": False, "error": "Password too short"}
    hashed = hash_password(password)
    return {"success": True, "password_hash": hashed}

def authenticate_user(input_password: str, stored_hash: str) -> dict:
    if verify_password(input_password, stored_hash):
        return {"success": True}
    return {"success": False, "error": "Invalid password"}
