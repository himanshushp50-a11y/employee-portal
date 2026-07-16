# Login/Signup ke routes (URLs) yaha hain.
# Har route sirf itna karta hai: request padho -> crud function ko call karo -> response bhejo.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_employee
from app.core.constants import AVATAR_COLORS
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.crud import employee as employee_crud
from app.models.employee import Employee
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse
from app.schemas.employee import EmployeeRead

# Saare routes ka URL "/api/auth/..." se shuru hoga
router = APIRouter(prefix="/api/auth", tags=["auth"])


# POST /api/auth/signup — naya account banata hai
@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    # step 1: ye email pehle se to nahi use ho rahi?
    if employee_crud.get_by_email(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    # step 2: employee banao (naya signup hamesha normal employee hota hai, admin nahi)
    employee_count = len(employee_crud.list_all(db))
    employee = employee_crud.create(
        db,
        name=payload.name,
        email=payload.email,
        password=payload.password,
        role=payload.role or "Employee",
        avatar_color=AVATAR_COLORS[employee_count % len(AVATAR_COLORS)],  # baari-baari se color
        is_admin=False,
    )
    # step 3: login token bhi bana ke de do, taaki signup ke baad seedhe logged-in ho
    token = create_access_token(subject=str(employee.id))
    return TokenResponse(access_token=token, employee=EmployeeRead.model_validate(employee))


# POST /api/auth/login — email+password se login karta hai
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    employee = employee_crud.get_by_email(db, payload.email)
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password."
    )
    # employee mila hi nahi, YA password match nahi hua -> dono case me same error
    # (security ke liye — hume nahi batana chahiye "email galat hai" vs "password galat hai")
    if employee is None or not verify_password(payload.password, employee.password_hash):
        raise invalid_credentials
    token = create_access_token(subject=str(employee.id))
    return TokenResponse(access_token=token, employee=EmployeeRead.model_validate(employee))


# GET /api/auth/me — "main kaun hoon" (token bhejo, apni info wapas milegi)
@router.get("/me", response_model=EmployeeRead)
def read_me(current_employee: Employee = Depends(get_current_employee)) -> EmployeeRead:
    return EmployeeRead.model_validate(current_employee)
