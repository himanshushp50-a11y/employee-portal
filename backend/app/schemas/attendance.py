# Attendance record API me kaise dikhega, wo yaha define hai.

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.employee import EmployeeRead

# status sirf inhi 3 values me se ek ho sakta hai
AttendanceStatus = Literal["present", "absent", "on-leave"]


# Ek attendance record ka normal format
class AttendanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # database model se seedhe convert ho sakta hai

    id: int
    employee_id: int
    date: date
    clock_in: datetime | None
    clock_out: datetime | None
    status: AttendanceStatus


# Wahi record, lekin employee ki details bhi saath me
# (admin ko "kaun present hai" table dikhane ke liye use hota hai)
class AttendanceWithEmployee(AttendanceRead):
    employee: EmployeeRead
