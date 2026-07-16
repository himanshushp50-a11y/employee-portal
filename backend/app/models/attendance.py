# Ye "AttendanceRecord" table ka blueprint hai.
# Har row ek employee ke ek din ka attendance record hai.

from datetime import date as date_type
from datetime import datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# status sirf inhi teen values me se ek ho sakta hai
AttendanceStatus = Enum("present", "absent", "on-leave", name="attendance_status")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    # ek employee ek date pe sirf EK hi record rakh sakta hai (dobara clock-in nahi ban sakta usi din ke liye)
    __table_args__ = (UniqueConstraint("employee_id", "date", name="uq_employee_date"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))  # kis employee ka record hai
    date: Mapped[date_type] = mapped_column(Date, index=True)
    clock_in: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)   # time null ho sakta hai (abhi clock-in nahi hua)
    clock_out: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(AttendanceStatus, default="present")

    # is record ka employee seedhe nikalne ke liye link
    employee = relationship("Employee", back_populates="attendance_records")
