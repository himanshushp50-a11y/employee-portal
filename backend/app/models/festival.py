# Sabse simple table — company holidays (jaise "Diwali", "Independence Day").

from datetime import date as date_type

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Festival(Base):
    __tablename__ = "festivals"

    id: Mapped[int] = mapped_column(primary_key=True)
    date: Mapped[date_type] = mapped_column(Date, index=True)
    name: Mapped[str] = mapped_column(String(120))
