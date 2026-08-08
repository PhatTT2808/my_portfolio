from fastapi import APIRouter, HTTPException

from app.db import get_client
from app.schemas import ProfileOut, ProjectOut

router = APIRouter(tags=["public"])


@router.get("/profile", response_model=ProfileOut)
def get_profile() -> ProfileOut:
    res = get_client().table("profile").select("*").limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not configured")
    return ProfileOut(**res.data[0])


@router.get("/projects", response_model=list[ProjectOut])
def list_projects() -> list[ProjectOut]:
    res = (
        get_client()
        .table("projects")
        .select("*")
        .eq("published", True)
        .order("sort_order")
        .execute()
    )
    return [ProjectOut(**row) for row in res.data]
