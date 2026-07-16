# Leave request bhejne, dekhne, approve/reject karne ke routes.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_employee
from app.core.database import get_db
from app.crud import attendance as attendance_crud
from app.crud import leave as leave_crud
from app.models.employee import Employee
from app.schemas.leave import LeaveRequestCreate, LeaveRequestRead, LeaveRequestWithEmployee

router = APIRouter(prefix="/api/leave-requests", tags=["leave"])


# Chhota helper: request dhundho, aur ye check bhi karo ki ye request USI employee ki hai.
# Employee sirf apni requests dekh/cancel kar sakta hai, kisi aur ki nahi.
def _get_owned_or_404(db: Session, leave_request_id: int, employee_id: int):
    leave_request = leave_crud.get_by_id(db, leave_request_id)
    if leave_request is None or leave_request.employee_id != employee_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
    return leave_request


# POST /api/leave-requests — nayi leave request bhejna
@router.post("", response_model=LeaveRequestRead, status_code=status.HTTP_201_CREATED)
def create_leave_request(
    payload: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
) -> LeaveRequestRead:
    leave_request = leave_crud.create(
        db, employee_id=current_employee.id, dates=payload.dates, reason=payload.reason
    )
    return LeaveRequestRead.from_model(leave_request)


# GET /api/leave-requests/me — apni saari requests dekhna
@router.get("/me", response_model=list[LeaveRequestRead])
def my_leave_requests(
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
) -> list[LeaveRequestRead]:
    requests = leave_crud.list_by_employee(db, employee_id=current_employee.id)
    return [LeaveRequestRead.from_model(r) for r in requests]


# DELETE /api/leave-requests/{id} — apni request cancel karna
@router.delete("/{leave_request_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_leave_request(
    leave_request_id: int,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
) -> None:
    leave_request = _get_owned_or_404(db, leave_request_id, current_employee.id)
    leave_crud.delete(db, leave_request=leave_request)


# GET /api/leave-requests — SABHI employees ki saari requests (admin only)
@router.get("", response_model=list[LeaveRequestWithEmployee])
def list_all_leave_requests(
    db: Session = Depends(get_db),
    _admin: Employee = Depends(get_current_admin),
) -> list[LeaveRequestWithEmployee]:
    requests = leave_crud.list_all(db)
    return [LeaveRequestWithEmployee.from_model(r) for r in requests]


# POST /api/leave-requests/{id}/approve — admin request approve karta hai
@router.post("/{leave_request_id}/approve", response_model=LeaveRequestRead)
def approve_leave_request(
    leave_request_id: int,
    db: Session = Depends(get_db),
    _admin: Employee = Depends(get_current_admin),
) -> LeaveRequestRead:
    leave_request = leave_crud.get_by_id(db, leave_request_id)
    if leave_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
    leave_crud.set_status(db, leave_request=leave_request, status="approved")
    # approve hote hi un saari dates ki attendance bhi automatically "on-leave" mark kar do
    attendance_crud.mark_on_leave(
        db,
        employee_id=leave_request.employee_id,
        dates=[d.date for d in leave_request.dates],
    )
    return LeaveRequestRead.from_model(leave_request)


# POST /api/leave-requests/{id}/reject — admin request reject karta hai
@router.post("/{leave_request_id}/reject", response_model=LeaveRequestRead)
def reject_leave_request(
    leave_request_id: int,
    db: Session = Depends(get_db),
    _admin: Employee = Depends(get_current_admin),
) -> LeaveRequestRead:
    leave_request = leave_crud.get_by_id(db, leave_request_id)
    if leave_request is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
    leave_crud.set_status(db, leave_request=leave_request, status="rejected")
    return LeaveRequestRead.from_model(leave_request)
