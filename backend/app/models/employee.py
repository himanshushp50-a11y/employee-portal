# Ye "Employee" table ka blueprint hai — database me employees table
# bilkul aise hi columns ke saath banega.

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Employee(Base):
    __tablename__ = "employees"  # database me table ka naam

    id: Mapped[int] = mapped_column(primary_key=True)  # unique number, auto badhta hai
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)  # do employees ka email same nahi ho sakta
    password_hash: Mapped[str] = mapped_column(String(255))  # asli password nahi, uska encrypted version
    role: Mapped[str] = mapped_column(String(120), default="Employee")  # designation, jaise "Software Engineer"
    avatar_color: Mapped[str] = mapped_column(String(20), default="#7C3AED")
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)  # True = admin, False = normal employee

    # ye do lines "links" hain — kisi employee ki attendance/leave records seedhe nikalne ke liye
    # (jaise employee.attendance_records likhte hi uski saari attendance mil jaayegi)
    attendance_records = relationship(
        "AttendanceRecord", back_populates="employee", cascade="all, delete-orphan"
    )
    leave_requests = relationship(
        "LeaveRequest", back_populates="employee", cascade="all, delete-orphan"
    )
