# Ye file database se "connection" banati hai.
# Isse teen cheezein milti hain:
#   1. engine       -> database tak pahuchne ka raasta
#   2. Base         -> saari models (tables) isi se banti hain
#   3. get_db()     -> har request ke liye ek fresh database session deta hai

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

# Render/Postgres URLs "postgresql://" ya "postgres://" se aate hain, jinme SQLAlchemy
# by-default purana psycopg2 driver dhoondta hai. Hum psycopg3 (psycopg[binary]) use karte
# hain, isliye URL ko "postgresql+psycopg://" me badal dete hain.
database_url = settings.database_url
if database_url.startswith("postgres://"):
    database_url = "postgresql+psycopg://" + database_url[len("postgres://"):]
elif database_url.startswith("postgresql://"):
    database_url = "postgresql+psycopg://" + database_url[len("postgresql://"):]

# SQLite ko ek special option chahiye hota hai (multi-thread me use karne ke liye)
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

# engine = database se baat karne ka main pipe
engine = create_engine(database_url, connect_args=connect_args)

# SessionLocal() call karke ek nayi "database conversation" (session) milti hai
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base class — humari saari tables (models/ folder me) isी se inherit karti hain
class Base(DeclarativeBase):
    pass


# Ye function FastAPI ke saath use hota hai: "Depends(get_db)".
# Request shuru hote hi ek session khulta hai, request khatam hote hi (finally) band ho jaata hai.
def get_db() -> Generator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
