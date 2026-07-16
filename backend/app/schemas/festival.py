# Festival (holiday) API me kaise dikhega, wo yaha define hai.

from datetime import date

from pydantic import BaseModel, ConfigDict


# Ek holiday dikhane ka format
class FestivalRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: date
    name: str


# Naya holiday banate waqt ye chahiye
class FestivalCreate(BaseModel):
    date: date
    name: str
