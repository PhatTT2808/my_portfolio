from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    password: str


class TokenResponse(BaseModel):
    access_token: str
    expires_in: int


class ProfileOut(BaseModel):
    headline: str
    subheadline: str | None = None
    bio: str | None = None
    spotify_embed_url: str | None = None
    email: str | None = None
    github_url: str | None = None
    linkedin_url: str | None = None


class ProjectOut(BaseModel):
    id: str
    title: str
    description: str | None = None
    video_url: str | None = None
    thumbnail_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    repo_url: str | None = None
    live_url: str | None = None
    sort_order: int = 0


class VocabIn(BaseModel):
    word: str = Field(min_length=1, max_length=120)
    meaning: str = Field(min_length=1, max_length=1000)
    example: str | None = Field(default=None, max_length=1000)
    pronunciation: str | None = Field(default=None, max_length=120)


class VocabUpdate(BaseModel):
    word: str | None = Field(default=None, min_length=1, max_length=120)
    meaning: str | None = Field(default=None, min_length=1, max_length=1000)
    example: str | None = Field(default=None, max_length=1000)
    pronunciation: str | None = Field(default=None, max_length=120)
    learned: bool | None = None


class VocabOut(VocabIn):
    id: str
    learned: bool = False
    created_at: str


class TaskIn(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    notes: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    priority: Literal["low", "medium", "high"] = "medium"


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    notes: str | None = Field(default=None, max_length=2000)
    due_date: date | None = None
    priority: Literal["low", "medium", "high"] | None = None
    done: bool | None = None


class TaskOut(TaskIn):
    id: str
    done: bool = False
    created_at: str


class ScheduleIn(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    weekday: int = Field(ge=0, le=6)
    start_time: str
    end_time: str
    location: str | None = Field(default=None, max_length=200)


class ScheduleOut(ScheduleIn):
    id: str


class ExpenseIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    amount: float = Field(gt=0)
    category: str = Field(default="other", max_length=60)
    spent_on: date


class ExpenseOut(ExpenseIn):
    id: str
    created_at: str


class ExpenseSummary(BaseModel):
    total: float
    by_category: dict[str, float]
