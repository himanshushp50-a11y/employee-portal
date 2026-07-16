# Login/Signup ke waqt data kis format me aana-jaana chahiye, wo yaha define hai.

from pydantic import BaseModel, EmailStr, Field

from app.schemas.employee import EmployeeRead


# Naya account banate waqt frontend se ye 4 cheezein aani chahiye
class SignupRequest(BaseModel):
    name: str = Field(min_length=1)      # khali naam allow nahi
    email: EmailStr                       # valid email format hona chahiye (auto-check hota hai)
    password: str = Field(min_length=4)   # kam se kam 4 characters
    role: str = "Employee"                # nahi diya to default "Employee"


# Login karte waqt bas email + password chahiye
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# Login/Signup successful hone par ye wapas bhejte hain
class TokenResponse(BaseModel):
    access_token: str            # login token (ticket)
    token_type: str = "bearer"   # standard naam, hamesha "bearer" hi rehta hai
    employee: EmployeeRead       # employee ki info bhi saath me
