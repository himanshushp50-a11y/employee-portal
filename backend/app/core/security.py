# Ye file do kaam karti hai:
#   1. Password ko hash karna aur check karna (asli password kabhi save nahi hota)
#   2. Login token (JWT) banana aur padhna — login ke baad user ko ye "ticket" milta hai

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import settings


# Password ko ek scrambled/unreadable text me badal deta hai (database me yehi save hota hai)
def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


# Login ke waqt: user ne jo password type kiya, wo database wale hashed password se match karta hai?
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


# Login successful hone par ek token (ticket) banata hai.
# "subject" me hum employee ki id daalte hain, taaki baad me token se pata chale "ye kaun hai".
def create_access_token(subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expires_at}  # "sub" = subject, "exp" = expiry time
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


# Token ko wapas padhta hai — agar token sahi/valid hai to usme se employee id nikal deta hai.
# Agar token galat/expire ho gaya hai to None wapas karta hai.
def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except jwt.PyJWTError:
        return None
    return payload.get("sub")
