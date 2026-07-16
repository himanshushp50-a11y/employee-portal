# Ye "main gate" hai — server start hote hi sabse pehle ye file chalti hai.
# Run karne ka command: uv run uvicorn app.main:app --reload

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import all_routers
from app.core.config import settings
from app.core.database import Base, engine

# Ye import zaroori hai — isse saari models (tables) "register" ho jaati hain,
# tabhi neeche wali line unhe database me bana payegi.
import app.models  # noqa: F401

# Agar tables pehle se nahi bane, to yahan ban jaate hain (already bane ho to kuch nahi hota)
Base.metadata.create_all(bind=engine)

# Ye humara FastAPI app hai — poora backend isi ke andar chalega
app = FastAPI(title=settings.app_name)

# CORS: browser normally ek website ko doosri website (yaha alag port) se
# baat karne se rokta hai. Ye setting frontend (localhost:3000) ko allow karti hai.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# saare routes (auth, employees, attendance, leave, festivals) ko app me jodo
for router in all_routers:
    app.include_router(router)


# Ek simple check — "server chal raha hai ya nahi" dekhne ke liye
@app.get("/api/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}
