import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")

    # sha256 hex digest of the private-area password
    PRIVATE_PASSWORD_HASH: str = os.getenv("PRIVATE_PASSWORD_HASH", "")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM: str = "HS256"
    JWT_TTL_HOURS: int = int(os.getenv("JWT_TTL_HOURS", "72"))

    # Comma-separated list of allowed frontend origins.
    # Add "*" to allow any origin (useful for local dev / personal deployment).
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,https://tanphat-portfolio.vercel.app",
        ).split(",")
        if o.strip()
    ]


settings = Settings()