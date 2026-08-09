from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.routers import auth, planner, public, vocabulary

app = FastAPI(title="Portfolio API", version="1.0.0")


class NoCacheMiddleware(BaseHTTPMiddleware):
    """Prevent Vercel CDN from caching API responses (avoids stale CORS headers)."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response


# Auth uses Bearer tokens (not cookies), so credentials are not needed.
# Allow all origins to avoid CORS issues across any frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(NoCacheMiddleware)

app.include_router(public.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(vocabulary.router, prefix="/api")
app.include_router(planner.router, prefix="/api")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}