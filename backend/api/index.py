from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.main import app


class VercelPathMiddleware(BaseHTTPMiddleware):
    """Restore the original request path.

    vercel.json rewrites every path to /api/index so that all traffic reaches
    this ASGI app.  Vercel records the original path in the x-vercel-rewrite
    header (falling back to x-vercel-forwarded-path), which we restore here so
    FastAPI routing (e.g. /api/health, /api/tasks, ...) matches correctly.
    """

    async def dispatch(self, request: Request, call_next):
        original = request.headers.get("x-vercel-rewrite") or request.headers.get(
            "x-vercel-forwarded-path"
        )
        if original and original != "/api/index":
            request.scope["path"] = original
            request.scope["raw_path"] = original.encode()
            request.scope["root_path"] = ""
        return await call_next(request)


app.add_middleware(VercelPathMiddleware)