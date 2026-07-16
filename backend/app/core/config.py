# Ye file app ki saari "settings" ek jagah rakhti hai.
# Jaise: database kahan hai, login token kitni der chalega, demo login kya hai.
# In values ko ".env" file me likh ke change kar sakte ho, bina code touch kiye.

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ye batata hai ki settings ".env" naam ki file se read hongi
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Kuberya Attendance API"
    environment: str = "development"

    # SQLite database file ka path (ek simple file-based database)
    database_url: str = "sqlite:///./kuberya_attendance.db"

    # login token (JWT) banane ke liye secret key + settings
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # token 24 ghante tak valid rahega

    # sirf ye website (frontend) is backend ko call kar sakti hai
    cors_origins: list[str] = ["http://localhost:3000"]

    # demo/test ke liye pehle se bana hua admin aur employee account
    seed_admin_email: str = "admin@kuberya.ai"
    seed_admin_password: str = "admin1234"
    seed_employee_email: str = "aniruddha@kuberya.ai"
    seed_employee_password: str = "demo1234"


# @lru_cache ka matlab: Settings() sirf ek baar banega, baar baar nahi.
# (pehli call slow, uske baad instant — kyunki wahi purana result reuse hota hai)
@lru_cache
def get_settings() -> Settings:
    return Settings()


# poore app me yehi ek "settings" variable import karke use karte hain
settings = get_settings()
