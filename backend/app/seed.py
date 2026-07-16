# Ye ek "one-time script" hai — database me demo data daal deta hai:
# ek demo employee, ek admin account, aur 2026 ke saare festivals.
# Agar wo pehle se hain to dobara nahi banata (safe hai baar baar chalana).
#
# Chalane ka command: uv run python -m app.seed

from datetime import date

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.crud import employee as employee_crud
from app.crud import festival as festival_crud

import app.models  # noqa: F401

# 2026 ke holidays: (date, naam)
FESTIVALS_2026 = [
    (date(2026, 1, 1), "New Year's Day"),
    (date(2026, 1, 26), "Republic Day"),
    (date(2026, 3, 4), "Holi"),
    (date(2026, 3, 30), "Eid al-Fitr"),
    (date(2026, 8, 15), "Independence Day"),
    (date(2026, 8, 26), "Milad-un-Nabi"),
    (date(2026, 8, 28), "Raksha Bandhan"),
    (date(2026, 9, 4), "Janmashtami"),
    (date(2026, 10, 2), "Gandhi Jayanti"),
    (date(2026, 10, 20), "Dussehra"),
    (date(2026, 11, 8), "Diwali"),
    (date(2026, 12, 25), "Christmas"),
]


def seed() -> None:
    Base.metadata.create_all(bind=engine)  # tables na ho to bana do
    db = SessionLocal()
    try:
        # demo employee — agar already nahi hai to banao
        if employee_crud.get_by_email(db, settings.seed_employee_email) is None:
            employee_crud.create(
                db,
                name="Aniruddha Sharma",
                email=settings.seed_employee_email,
                password=settings.seed_employee_password,
                role="Software Engineer",
                avatar_color="#7C3AED",
                is_admin=False,
            )
            print(f"Created demo employee: {settings.seed_employee_email}")

        # demo admin — agar already nahi hai to banao
        if employee_crud.get_by_email(db, settings.seed_admin_email) is None:
            employee_crud.create(
                db,
                name="Kuberya Admin",
                email=settings.seed_admin_email,
                password=settings.seed_admin_password,
                role="Administrator",
                avatar_color="#0F172A",
                is_admin=True,
            )
            print(f"Created admin account: {settings.seed_admin_email}")

        # festivals — jo pehle se database me nahi hain, sirf wahi add karo
        existing_dates = {f.date for f in festival_crud.list_all(db)}
        for festival_date, name in FESTIVALS_2026:
            if festival_date not in existing_dates:
                festival_crud.create(db, festival_date=festival_date, name=name)
        print(f"Festivals seeded: {len(FESTIVALS_2026)}")
    finally:
        db.close()


# ye script seedhe chalane par hi ye function chalega
# (agar koi doosri file ise import kare to nahi chalega)
if __name__ == "__main__":
    seed()
