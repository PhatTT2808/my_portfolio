from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, planner, public, vocabulary

app = FastAPI(title="Portfolio API", version="1.0.0")

# If CORS_ORIGINS contains "*", use allow_origin_regex to match any origin
# (allow_credentials=True cannot be combined with allow_origins=["*"]).
cors_origins = settings.CORS_ORIGINS
if "*" in cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(public.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(vocabulary.router, prefix="/api")
app.include_router(planner.router, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}