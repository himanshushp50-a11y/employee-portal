# Kuberya Attendance — Backend

FastAPI + SQLAlchemy + SQLite backend for the Kuberya AI Solutions attendance portal. Mirrors the
data model already used by the `frontend/` mock (Redux) layer, so wiring the frontend to this API
later is a 1:1 swap.

## Stack

| Layer | Choice |
|---|---|
| Framework | FastAPI |
| Package manager | [uv](https://docs.astral.sh/uv/) |
| ORM | SQLAlchemy 2.0 (sync) |
| Migrations | Alembic |
| Database | SQLite (swap `DATABASE_URL` for Postgres later — see note in `crud/attendance.py`) |
| Auth | JWT (PyJWT) + bcrypt password hashing |
| Validation | Pydantic v2 |
| Lint | ruff |
| Tests | pytest |

## Project structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, router registration, /api/health
│   ├── seed.py               # Seeds demo employee, admin account, 2026 festivals
│   ├── core/
│   │   ├── config.py         # Settings (reads .env via pydantic-settings)
│   │   ├── constants.py      # Shared constants (avatar colors, shift length)
│   │   ├── database.py       # Engine, SessionLocal, Base, get_db dependency
│   │   └── security.py       # Password hashing (bcrypt) + JWT create/decode
│   ├── models/                # SQLAlchemy ORM models (one file per entity)
│   │   ├── employee.py
│   │   ├── attendance.py
│   │   ├── leave_request.py   # LeaveRequest + LeaveRequestDate (one row per date)
│   │   └── festival.py
│   ├── schemas/                # Pydantic request/response schemas (mirrors models/)
│   │   ├── auth.py
│   │   ├── employee.py
│   │   ├── attendance.py
│   │   ├── leave.py
│   │   └── festival.py
│   ├── crud/                   # DB access layer — routes never touch the Session directly
│   │   ├── employee.py
│   │   ├── attendance.py
│   │   ├── leave.py
│   │   └── festival.py
│   └── api/
│       ├── deps.py             # get_current_employee, get_current_admin
│       └── routes/              # One router per feature, prefixed /api/<feature>
│           ├── auth.py
│           ├── employees.py
│           ├── attendance.py
│           ├── leave.py
│           └── festivals.py
├── alembic/                    # Migrations (env.py wired to app.core.database.Base)
├── tests/
├── pyproject.toml
├── .env.example
└── kuberya_attendance.db        # SQLite file (gitignored, created on first migrate)
```

**The pattern to follow for every new feature:** model → schema → crud function → route →
register the router in `app/api/routes/__init__.py`. Keep routes thin — they only translate
HTTP ↔ schemas and call `crud/`; business logic lives in `crud/`.

## Setup

```bash
cd backend
cp .env.example .env          # adjust secrets/URLs if needed
uv sync                        # installs deps into .venv
uv run alembic upgrade head    # creates kuberya_attendance.db + tables
uv run python -m app.seed      # seeds demo employee + admin + 2026 festivals
uv run uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

Demo credentials (same as the frontend mock):

| Role | Email | Password |
|---|---|---|
| Employee | `aniruddha@kuberya.ai` | `demo1234` |
| Admin | `admin@kuberya.ai` | `admin1234` |

## Adding a migration after changing a model

```bash
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic upgrade head
```

## Running tests / lint

```bash
uv run pytest
uv run ruff check app
```

## API overview

All routes are prefixed `/api`. Employee routes require `Authorization: Bearer <token>`; admin
routes additionally require the account to have `is_admin = true` (403 otherwise).

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | public | Create an employee account (always non-admin) |
| POST | `/auth/login` | public | Returns JWT + employee profile |
| GET | `/auth/me` | employee | Current user's profile |
| PATCH | `/employees/me` | employee | Update own name/designation |
| GET | `/employees` | admin | List all employees |
| POST | `/attendance/clock-in` | employee | Clock in for today |
| POST | `/attendance/clock-out` | employee | Clock out for today |
| GET | `/attendance/me?month=YYYY-MM` | employee | Own attendance history |
| GET | `/attendance?for_date=YYYY-MM-DD` | admin | All employees' attendance for a date |
| POST | `/leave-requests` | employee | Submit a leave request (one or more dates) |
| GET | `/leave-requests/me` | employee | Own leave requests |
| DELETE | `/leave-requests/{id}` | employee | Cancel own pending request |
| GET | `/leave-requests` | admin | All leave requests, newest/pending first |
| POST | `/leave-requests/{id}/approve` | admin | Approve — also marks those dates `on-leave` |
| POST | `/leave-requests/{id}/reject` | admin | Reject |
| GET | `/festivals` | employee | Company holiday calendar |
| POST | `/festivals` | admin | Add a festival |
| DELETE | `/festivals/{id}` | admin | Remove a festival |

## Not built yet (next steps)

- Wire the frontend's Redux slices (`authSlice`, `attendanceSlice`, `leaveSlice`) to call this
  API via axios instead of mutating local mock state — the shapes already match closely.
- `tests/` currently only has the folder scaffold — add pytest coverage per route module as
  features stabilize (a `conftest.py` with a fixture DB + `TestClient` is the natural next file).
- Rate limiting / refresh tokens if this goes past demo/internal use.
