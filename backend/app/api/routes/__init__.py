# Saare feature-wise routes (auth, employees, attendance, leave, festivals) ko
# ek list me jod deta hai — taaki main.py easily sabko ek saath register kar sake.

from app.api.routes.attendance import router as attendance_router
from app.api.routes.auth import router as auth_router
from app.api.routes.employees import router as employees_router
from app.api.routes.festivals import router as festivals_router
from app.api.routes.leave import router as leave_router

all_routers = [
    auth_router,
    employees_router,
    attendance_router,
    leave_router,
    festivals_router,
]
