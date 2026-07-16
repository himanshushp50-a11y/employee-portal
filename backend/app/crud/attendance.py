# Attendance (clock-in/out) ke saare database operations yaha hain.

from datetime import date, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.attendance import AttendanceRecord


# Ek employee ka ek specific date ka record dhundhta hai (agar hai to)
def get_by_employee_and_date(
    db: Session, *, employee_id: int, record_date: date
) -> AttendanceRecord | None:
    stmt = select(AttendanceRecord).where(
        AttendanceRecord.employee_id == employee_id,
        AttendanceRecord.date == record_date,
    )
    return db.execute(stmt).scalar_one_or_none()


# Employee ki poori attendance history (chahe to ek month tak limit kar sakte hain)
def list_by_employee(
    db: Session, *, employee_id: int, month: str | None = None
) -> list[AttendanceRecord]:
    stmt = select(AttendanceRecord).where(AttendanceRecord.employee_id == employee_id)
    if month:
        # NOTE: strftime sirf SQLite me kaam karta hai — agar kabhi PostgreSQL use
        # kiya to iski jagah alag function (jaise to_char) use karna padega.
        stmt = stmt.where(func.strftime("%Y-%m", AttendanceRecord.date) == month)
    stmt = stmt.order_by(AttendanceRecord.date.desc())  # sabse naya record sabse upar
    return list(db.execute(stmt).scalars().all())


# Ek particular date ki SABHI employees ki attendance (admin table ke liye)
def list_by_date(db: Session, *, record_date: date) -> list[AttendanceRecord]:
    stmt = select(AttendanceRecord).where(AttendanceRecord.date == record_date)
    return list(db.execute(stmt).scalars().all())


# Clock-in: agar aaj ka record already hai to usme time update karo, warna naya record banao
def clock_in(db: Session, *, employee_id: int, at: datetime) -> AttendanceRecord:
    record = get_by_employee_and_date(db, employee_id=employee_id, record_date=at.date())
    if record is None:
        record = AttendanceRecord(
            employee_id=employee_id, date=at.date(), clock_in=at, status="present"
        )
        db.add(record)
    else:
        record.clock_in = at
        record.status = "present"
    db.commit()
    db.refresh(record)
    return record


# Clock-out: aaj ka record dhundho aur usme clock_out time bhar do.
# Agar record hi nahi mila (matlab clock-in kiya hi nahi tha) to None wapas karo.
def clock_out(db: Session, *, employee_id: int, at: datetime) -> AttendanceRecord | None:
    record = get_by_employee_and_date(db, employee_id=employee_id, record_date=at.date())
    if record is None:
        return None
    record.clock_out = at
    db.commit()
    db.refresh(record)
    return record


# Leave approve hone par un saari dates ke attendance status ko "on-leave" bana deta hai
def mark_on_leave(db: Session, *, employee_id: int, dates: list[date]) -> None:
    for leave_date in dates:
        record = get_by_employee_and_date(db, employee_id=employee_id, record_date=leave_date)
        if record is None:
            record = AttendanceRecord(employee_id=employee_id, date=leave_date, status="on-leave")
            db.add(record)
        else:
            record.status = "on-leave"
    db.commit()
