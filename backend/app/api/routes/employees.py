# Employee list dekhne aur profile update karne ke routes.

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_employee
from app.core.database import get_db
from app.crud import employee as employee_crud
from app.models.employee import Employee
from app.schemas.employee import EmployeeRead, EmployeeUpdate

router = APIRouter(prefix="/api/employees", tags=["employees"])


# GET /api/employees — sabhi employees ki list (sirf admin ke liye)
# `_admin` variable use nahi ho raha, sirf yaha hai taaki "get_current_admin" check chal jaaye
# (agar caller admin nahi hai to ye line hi 403 error de degi, aage code chalega hi nahi)
@router.get("", response_model=list[EmployeeRead])
def list_employees(
    db: Session = Depends(get_db),
    _admin: Employee = Depends(get_current_admin),
) -> list[EmployeeRead]:
    employees = employee_crud.list_non_admins(db)
    return [EmployeeRead.model_validate(e) for e in employees]


# PATCH /api/employees/me — apna naam/designation update karna
@router.patch("/me", response_model=EmployeeRead)
def update_my_profile(
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_employee: Employee = Depends(get_current_employee),
) -> EmployeeRead:
    updated = employee_crud.update_profile(
        db, employee=current_employee, name=payload.name, role=payload.role
    )
    return EmployeeRead.model_validate(updated)
