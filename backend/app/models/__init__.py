# Ye file sirf saari tables (models) ko ek jagah se import karne ke liye hai.
# Isse baaki files me chhota import likh sakte hain: `from app.models import Employee`
# (lambi wali `from app.models.employee import Employee` likhne ki zaroorat nahi)

from app.models.attendance import AttendanceRecord
from app.models.employee import Employee
from app.models.festival import Festival
from app.models.leave_request import LeaveRequest, LeaveRequestDate

__all__ = [
    "AttendanceRecord",
    "Employee",
    "Festival",
    "LeaveRequest",
    "LeaveRequestDate",
]
