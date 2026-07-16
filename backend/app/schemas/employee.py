# "Schemas" batate hain API me data kaisa dikhega — model se alag isliye
# hai kyunki hum kabhi password_hash jaisi cheez frontend ko nahi bhejna chahte.

from pydantic import BaseModel, ConfigDict


# Ye employee ki wo info hai jo frontend ko dikhayenge (password kabhi nahi bhejte)
class EmployeeRead(BaseModel):
    # from_attributes=True ka matlab: database model se seedhe convert ho sakta hai
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    role: str
    avatar_color: str
    is_admin: bool


# Profile edit karte waqt frontend sirf ye 2 cheezein bhej sakta hai
class EmployeeUpdate(BaseModel):
    name: str
    role: str
