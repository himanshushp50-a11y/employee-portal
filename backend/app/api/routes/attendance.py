# Clock-in, clock-out aur attendance dekhne ke routes.

from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_employee
from app.core.database import get_db
from app.crud import attendance as attendance_crud
from app.models.employee import Employee
from app.schemas.attendance import AttendanceRead, AttendanceWithEmployee

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


# POST /api/attendance/clock-in — abhi ka time record kar deta hai
@router.post("/clock-in", response_model=AttendanceRead)
def clock_in(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),  # token se pata chalta hai kaun hai
) -> AttendanceRead:
    record = attendance_crud.clock_in(
        db, employee_id=current_employee.id, at=datetime.now(timezone.utc)
    )
    return AttendanceRead.model_validate(record)


# POST /api/attendance/clock-out
@router.post("/clock-out", response_model=AttendanceRead)
def clock_out(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
) -> AttendanceRead:
    record = attendance_crud.clock_out(
        db, employee_id=current_employee.id, at=datetime.now(timezone.utc)
    )
    if record is None:
        # matlab aaj clock-in kiya hi nahi tha, seedhe clock-out nahi kar sakte
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You haven't clocked in today.",
        )
    return AttendanceRead.model_validate(record)


# GET /api/attendance/me?month=2026-07 — apni attendance history
@router.get("/me", response_model=list[AttendanceRead])
def my_attendance(
    month: str | None = None,  # optional filter, jaise "2026-07"
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
) -> list[AttendanceRead]:
    records = attendance_crud.list_by_employee(
        db, employee_id=current_employee.id, month=month
    )
    return [AttendanceRead.model_validate(r) for r in records]


# GET /api/attendance?for_date=2026-07-10 — ek date ki sabki attendance (admin only)
@router.get("", response_model=list[AttendanceWithEmployee])
def attendance_for_date(
    for_date: date,
    db: Session = Depends(get_db),
    _admin: Employee = Depends(get_current_admin),  # sirf admin ye dekh sakta hai
) -> list[AttendanceWithEmployee]:
    records = attendance_crud.list_by_date(db, record_date=for_date)
    return [AttendanceWithEmployee.model_validate(r) for r in records]
