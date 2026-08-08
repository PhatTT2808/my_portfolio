from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_owner
from app.db import get_client
from app.schemas import VocabIn, VocabOut, VocabUpdate

router = APIRouter(
    prefix="/vocabulary", tags=["vocabulary"], dependencies=[Depends(require_owner)]
)
TABLE = "vocabulary"


@router.get("", response_model=list[VocabOut])
def list_words(search: str | None = None) -> list[VocabOut]:
    query = get_client().table(TABLE).select("*")
    if search:
        query = query.ilike("word", f"%{search}%")
    res = query.order("created_at", desc=True).execute()
    return [VocabOut(**row) for row in res.data]


@router.post("", response_model=VocabOut, status_code=201)
def add_word(payload: VocabIn) -> VocabOut:
    res = get_client().table(TABLE).insert(payload.model_dump()).execute()
    return VocabOut(**res.data[0])


@router.patch("/{word_id}", response_model=VocabOut)
def update_word(word_id: str, payload: VocabUpdate) -> VocabOut:
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = get_client().table(TABLE).update(changes).eq("id", word_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Word not found")
    return VocabOut(**res.data[0])


@router.delete("/{word_id}", status_code=204)
def delete_word(word_id: str) -> None:
    res = get_client().table(TABLE).delete().eq("id", word_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Word not found")
