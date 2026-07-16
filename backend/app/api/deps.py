# Ye file "Kaun request bhej raha hai?" check karti hai.
#
# FastAPI ka `Depends(...)` ek "pehle ye function chalao, uska result de do" jaisa hai.
# Jab kisi route me `Depends(get_current_employee)` likha hota hai, FastAPI request aane
# se pehle is file ke functions apne aap chala deta hai — humein manually call nahi karna padta.

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.crud import employee as employee_crud
from app.models.employee import Employee

# Ye request ke "Authorization: Bearer <token>" header se token nikal deta hai
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Ek common error, baar baar likhna na pade isliye ek jagah bana diya
CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# "Ye request bhejne wala kaun hai?" — token check karke employee return karta hai.
# Koi bhi step fail ho (token nahi, ya galat token, ya employee exist nahi karta) -> 401 error.
def get_current_employee(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Employee:
    if token is None:
        raise CREDENTIALS_ERROR
    subject = decode_access_token(token)  # token se employee ki id nikalo
    if subject is None:
        raise CREDENTIALS_ERROR
    employee = employee_crud.get_by_id(db, int(subject))
    if employee is None:
        raise CREDENTIALS_ERROR
    return employee


# Pehle upar wale function se check karta hai "kaun hai", phir dekhta hai "admin hai ya nahi".
# Admin-only routes me `Depends(get_current_admin)` use hota hai.
def get_current_admin(
    current_employee: Employee = Depends(get_current_employee),
) -> Employee:
    if not current_employee.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_employee
