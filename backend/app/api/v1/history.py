from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.task import Task
from app.schemas.history import HistoryResponse, HistorySummary
from app.schemas.task import TaskOut

router = APIRouter()


@router.get("", response_model=HistoryResponse)
def get_history(
    period: Optional[str] = Query("all", pattern="^(all|today|this_week|this_month)$"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status_filter: Optional[str] = Query(None, alias="status", pattern="^(pending|completed|cancelled)$"),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve historical tasks with summary metrics and flexible date filtering."""
    today = date.today()
    query = db.query(Task).filter(Task.user_id == current_user.id)

    # Determine date boundaries
    if start_date or end_date:
        if start_date:
            query = query.filter(Task.task_date >= start_date)
        if end_date:
            query = query.filter(Task.task_date <= end_date)
    elif period == "today":
        query = query.filter(Task.task_date == today)
    elif period == "this_week":
        # Monday to Sunday of current week
        week_start = today - timedelta(days=today.weekday())
        query = query.filter(Task.task_date >= week_start, Task.task_date <= today)
    elif period == "this_month":
        month_start = today.replace(day=1)
        query = query.filter(Task.task_date >= month_start, Task.task_date <= today)

    if status_filter:
        query = query.filter(Task.status == status_filter)
    if category:
        query = query.filter(Task.category.ilike(category))

    tasks_db = query.order_by(Task.task_date.desc(), Task.created_at.desc()).all()

    total = len(tasks_db)
    completed = sum(1 for t in tasks_db if t.status == "completed")
    pending = sum(1 for t in tasks_db if t.status == "pending")
    cancelled = sum(1 for t in tasks_db if t.status == "cancelled")
    total_duration = sum(t.duration for t in tasks_db if t.duration and t.status == "completed")

    summary = HistorySummary(
        total_tasks=total,
        completed_tasks=completed,
        pending_tasks=pending,
        cancelled_tasks=cancelled,
        total_duration_minutes=total_duration,
    )

    return HistoryResponse(
        summary=summary,
        tasks=[TaskOut.model_validate(t) for t in tasks_db],
    )
