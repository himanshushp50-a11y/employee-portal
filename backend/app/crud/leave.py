# Leave request ke saare database operations yaha hain.

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.leave_request import LeaveRequest, LeaveRequestDate


# Chhota helper — leave request ke saath uski "dates" aur "employee" ki info bhi
# saath me load kar leta hai (taaki baad me alag se query na maarni pade).
# Neeche ke saare functions isi helper se shuru hote hain.
def _base_stmt():
    return select(LeaveRequest).options(
        selectinload(LeaveRequest.dates), selectinload(LeaveRequest.employee)
    )


# ID se ek leave request dhundhta hai
def get_by_id(db: Session, leave_request_id: int) -> LeaveRequest | None:
    stmt = _base_stmt().where(LeaveRequest.id == leave_request_id)
    return db.execute(stmt).scalar_one_or_none()


# Ek employee ke saare leave requests (sabse naya sabse upar)
def list_by_employee(db: Session, *, employee_id: int) -> list[LeaveRequest]:
    stmt = _base_stmt().where(LeaveRequest.employee_id == employee_id).order_by(
        LeaveRequest.created_at.desc()
    )
    return list(db.execute(stmt).scalars().all())


# SABHI employees ke leave requests (admin ke "Requests" page ke liye)
def list_all(db: Session) -> list[LeaveRequest]:
    stmt = _base_stmt().order_by(LeaveRequest.created_at.desc())
    return list(db.execute(stmt).scalars().all())


# Nayi leave request banata hai — status hamesha "pending" se shuru hoti hai
def create(
    db: Session, *, employee_id: int, dates: list[date], reason: str
) -> LeaveRequest:
    leave_request = LeaveRequest(employee_id=employee_id, reason=reason, status="pending")
    leave_request.dates = [LeaveRequestDate(date=d) for d in dates]  # har date ka apna row banaya
    db.add(leave_request)
    db.commit()
    db.refresh(leave_request)
    return get_by_id(db, leave_request.id)  # dobara load kiya taaki "dates" list bhi saath aaye


# Approve/reject karte waqt status change karta hai
def set_status(db: Session, *, leave_request: LeaveRequest, status: str) -> LeaveRequest:
    leave_request.status = status
    db.commit()
    db.refresh(leave_request)
    return leave_request


# Request delete karta hai (employee apni pending request cancel karta hai)
def delete(db: Session, *, leave_request: LeaveRequest) -> None:
    db.delete(leave_request)
    db.commit()
