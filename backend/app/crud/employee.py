# Ye file employee ke saare database operations (dhundhna, banana, update karna) rakhti hai.
# Routes (app/api/routes/) kabhi seedhe database ko touch nahi karte — hamesha in functions ko call karte hain.
#
# Note: kai functions me `db, *, name, email, ...` dikhega. Us `*` ke baad wale
# saare arguments sirf naam se dene padte hain — jaise `create(db, name="X", email="Y")`.
# Isse call karte waqt confusion nahi hota ki kaunsi value kis field ki hai.


from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.employee import Employee


# Email se employee dhundhta hai (login ke waqt use hota hai)
def get_by_email(db: Session, email: str) -> Employee | None:
    stmt = select(Employee).where(Employee.email == email.lower())
    return db.execute(stmt).scalar_one_or_none()  # match mila to employee, nahi to None


# ID se employee dhundhta hai (token check karte waqt use hota hai)
def get_by_id(db: Session, employee_id: int) -> Employee | None:
    return db.get(Employee, employee_id)


# Saare employees (admin bhi shaamil) naam ke hisaab se sorted list
def list_all(db: Session) -> list[Employee]:
    stmt = select(Employee).order_by(Employee.name)
    return list(db.execute(stmt).scalars().all())


# Sirf normal employees (admin chhod ke) — admin ke "Employees" page ke liye
def list_non_admins(db: Session) -> list[Employee]:
    stmt = select(Employee).where(Employee.is_admin.is_(False)).order_by(Employee.name)
    return list(db.execute(stmt).scalars().all())


# Naya employee (ya admin) database me banata hai
def create(
    db: Session,
    *,
    name: str,
    email: str,
    password: str,
    role: str,
    avatar_color: str,
    is_admin: bool = False,
) -> Employee:
    employee = Employee(
        name=name,
        email=email.lower(),
        password_hash=hash_password(password),  # asli password store nahi karte, hash karke rakhte hain
        role=role,
        avatar_color=avatar_color,
        is_admin=is_admin,
    )
    db.add(employee)      # naya row database session me daala
    db.commit()            # database me permanently save kiya
    db.refresh(employee)   # database se latest data (jaise auto-generated id) wapas load kiya
    return employee


# Employee apna naam/designation update karta hai
def update_profile(db: Session, *, employee: Employee, name: str, role: str) -> Employee:
    employee.name = name
    employee.role = role
    db.commit()
    db.refresh(employee)
    return employee
