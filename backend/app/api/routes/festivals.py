# Company holidays dekhne/add/delete karne ke routes.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, get_current_employee
from app.core.database import get_db
from app.crud import festival as festival_crud
from app.models.employee import Employee
from app.schemas.festival import FestivalCreate, FestivalRead

router = APIRouter(prefix="/api/festivals", tags=["festivals"])


# GET /api/festivals — koi bhi logged-in user (employee ya admin) dekh sakta hai
@router.get("", response_model=list[FestivalRead])
def list_festivals(
    db: Session = Depends(get_db),
    _current_employee: Employee = Depends(get_current_employee),  # bas login check
) -> list[FestivalRead]:
    return [FestivalRead.model_validate(f) for f in festival_crud.list_all(db)]


# POST /api/festivals — naya holiday add karna (admin only)
@router.post("", response_model=FestivalRead, status_code=status.HTTP_201_CREATED)
def create_festival(
    payload: FestivalCreate,
    db: Session = Depends(get_db),
    _admin: Employee = Depends(get_current_admin),
) -> FestivalRead:
    festival = festival_crud.create(db, festival_date=payload.date, name=payload.name)
    return FestivalRead.model_validate(festival)


# DELETE /api/festivals/{id} — holiday hatana (admin only)
@router.delete("/{festival_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_festival(
    festival_id: int,
    db: Session = Depends(get_db),
    _admin: Employee = Depends(get_current_admin),
) -> None:
    festival = festival_crud.get_by_id(db, festival_id)
    if festival is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Festival not found.")
    festival_crud.delete(db, festival=festival)
