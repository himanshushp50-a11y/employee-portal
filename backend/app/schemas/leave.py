# Leave request API me kaise dikhega, wo yaha define hai.
#
# Note: Database me dates ek alag table (LeaveRequestDate) me stored hain,
# lekin API me hum unhe simple list [date, date, ...] ki tarah dikhana chahte hain.
# Isliye "from_attributes" seedha use nahi hota — neeche from_model() function
# manually us conversion (object list -> simple date list) ko karta hai.

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.employee import EmployeeRead

LeaveStatus = Literal["pending", "approved", "rejected"]


# Nayi leave request bhejte waqt frontend se ye chahiye: dates + reason
class LeaveRequestCreate(BaseModel):
    dates: list[date] = Field(min_length=1)  # kam se kam 1 date honi chahiye
    reason: str = ""


# Ek leave request ka normal format
class LeaveRequestRead(BaseModel):
    id: int
    employee_id: int
    dates: list[date]
    reason: str
    status: LeaveStatus
    created_at: datetime

    # database wale LeaveRequest object ko is schema me convert karta hai
    @classmethod
    def from_model(cls, leave_request) -> "LeaveRequestRead":
        return cls(
            id=leave_request.id,
            employee_id=leave_request.employee_id,
            dates=sorted(d.date for d in leave_request.dates),  # LeaveRequestDate objects -> plain dates
            reason=leave_request.reason,
            status=leave_request.status,
            created_at=leave_request.created_at,
        )


# Wahi request, lekin employee ki details bhi saath me (admin ke liye)
class LeaveRequestWithEmployee(LeaveRequestRead):
    employee: EmployeeRead

    @classmethod
    def from_model(cls, leave_request) -> "LeaveRequestWithEmployee":
        return cls(
            id=leave_request.id,
            employee_id=leave_request.employee_id,
            dates=sorted(d.date for d in leave_request.dates),
            reason=leave_request.reason,
            status=leave_request.status,
            created_at=leave_request.created_at,
            employee=EmployeeRead.model_validate(leave_request.employee),
        )
