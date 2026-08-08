from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from app.core.security import require_owner
from app.db import get_client
from app.schemas import (
    ExpenseIn,
    ExpenseOut,
    ExpenseSummary,
    ScheduleIn,
    ScheduleOut,
    TaskIn,
    TaskOut,
    TaskUpdate,
)

router = APIRouter(tags=["planner"], dependencies=[Depends(require_owner)])


# ---------- tasks ----------
@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(done: bool | None = None) -> list[TaskOut]:
    query = get_client().table("tasks").select("*")
    if done is not None:
        query = query.eq("done", done)
    res = query.order("due_date", desc=False).execute()
    return [TaskOut(**row) for row in res.data]


@router.post("/tasks", response_model=TaskOut, status_code=201)
def add_task(payload: TaskIn) -> TaskOut:
    res = get_client().table("tasks").insert(payload.model_dump(mode="json")).execute()
    return TaskOut(**res.data[0])


@router.patch("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: str, payload: TaskUpdate) -> TaskOut:
    changes = payload.model_dump(mode="json", exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = get_client().table("tasks").update(changes).eq("id", task_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskOut(**res.data[0])


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: str) -> None:
    res = get_client().table("tasks").delete().eq("id", task_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Task not found")


# ---------- schedule ----------
@router.get("/schedule", response_model=list[ScheduleOut])
def list_schedule() -> list[ScheduleOut]:
    res = (
        get_client()
        .table("schedule")
        .select("*")
        .order("weekday")
        .order("start_time")
        .execute()
    )
    return [ScheduleOut(**row) for row in res.data]


@router.post("/schedule", response_model=ScheduleOut, status_code=201)
def add_schedule(payload: ScheduleIn) -> ScheduleOut:
    res = get_client().table("schedule").insert(payload.model_dump()).execute()
    return ScheduleOut(**res.data[0])


@router.delete("/schedule/{slot_id}", status_code=204)
def delete_schedule(slot_id: str) -> None:
    res = get_client().table("schedule").delete().eq("id", slot_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Slot not found")


# ---------- expenses ----------
@router.get("/expenses", response_model=list[ExpenseOut])
def list_expenses(start: date | None = None, end: date | None = None) -> list[ExpenseOut]:
    query = get_client().table("expenses").select("*")
    if start:
        query = query.gte("spent_on", start.isoformat())
    if end:
        query = query.lte("spent_on", end.isoformat())
    res = query.order("spent_on", desc=True).execute()
    return [ExpenseOut(**row) for row in res.data]


@router.post("/expenses", response_model=ExpenseOut, status_code=201)
def add_expense(payload: ExpenseIn) -> ExpenseOut:
    res = (
        get_client().table("expenses").insert(payload.model_dump(mode="json")).execute()
    )
    return ExpenseOut(**res.data[0])


@router.delete("/expenses/{expense_id}", status_code=204)
def delete_expense(expense_id: str) -> None:
    res = get_client().table("expenses").delete().eq("id", expense_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Expense not found")


@router.get("/expenses/summary", response_model=ExpenseSummary)
def expense_summary(start: date | None = None, end: date | None = None) -> ExpenseSummary:
    rows = list_expenses(start, end)
    by_category: dict[str, float] = defaultdict(float)
    for row in rows:
        by_category[row.category] += row.amount
    return ExpenseSummary(
        total=round(sum(by_category.values()), 2),
        by_category={k: round(v, 2) for k, v in by_category.items()},
    )
