# Festival (holiday) ke saare database operations yaha hain.

from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.festival import Festival


# Saare holidays, date ke hisaab se sorted
def list_all(db: Session) -> list[Festival]:
    stmt = select(Festival).order_by(Festival.date)
    return list(db.execute(stmt).scalars().all())


# Naya holiday banata hai
def create(db: Session, *, festival_date: date, name: str) -> Festival:
    festival = Festival(date=festival_date, name=name)
    db.add(festival)
    db.commit()
    db.refresh(festival)
    return festival


# ID se ek holiday dhundhta hai
def get_by_id(db: Session, festival_id: int) -> Festival | None:
    return db.get(Festival, festival_id)


# Holiday delete karta hai
def delete(db: Session, *, festival: Festival) -> None:
    db.delete(festival)
    db.commit()
