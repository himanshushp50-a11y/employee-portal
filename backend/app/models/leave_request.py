# Leave (time-off) request ke liye DO tables hain:
#   1. LeaveRequest      -> ek request (kisne mangi, kyu, kya status)
#   2. LeaveRequestDate  -> us request ki dates (ek request me multiple dates ho sakti hain,
#                           isliye inko alag table me rakha hai — ek list ki jagah)

from datetime import date as date_type
from datetime import datetime, timezone

from sqlalchemy import Date, DateTime, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

# status sirf inhi teen values me se ek ho sakta hai
LeaveStatus = Enum("pending", "approved", "rejected", name="leave_status")


class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))  # kisne request bheji
    reason: Mapped[str] = mapped_column(String(500), default="")
    status: Mapped[str] = mapped_column(LeaveStatus, default="pending")  # nayi request hamesha "pending" se start hoti hai
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)  # request kab bheji gayi, automatically fill hota hai
    )

    employee = relationship("Employee", back_populates="leave_requests")
    # is request ki saari dates seedhe nikalne ke liye link (leave_request.dates likhoge to list mil jaayegi)
    dates = relationship(
        "LeaveRequestDate", back_populates="leave_request", cascade="all, delete-orphan"
    )


class LeaveRequestDate(Base):
    __tablename__ = "leave_request_dates"

    id: Mapped[int] = mapped_column(primary_key=True)
    leave_request_id: Mapped[int] = mapped_column(ForeignKey("leave_requests.id"))  # ye kis request ki date hai
    date: Mapped[date_type] = mapped_column(Date, index=True)

    leave_request = relationship("LeaveRequest", back_populates="dates")
