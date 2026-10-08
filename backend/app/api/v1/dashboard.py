from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.task import Task
from app.models.goal import Goal
from app.schemas.dashboard import DashboardData, TodaySummary
from app.schemas.task import TaskOut
from app.schemas.goal import GoalOut
from app.services.streak_service import calculate_user_streaks

router = APIRouter()


@router.get("", response_model=DashboardData)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all aggregated information for the user's primary dashboard."""
    today = date.today()

    # 1. Fetch Today's Tasks
    today_tasks_db = (
        db.query(Task)
        .filter(Task.user_id == current_user.id, Task.task_date == today)
        .order_by(Task.priority.desc(), Task.created_at.asc())
        .all()
    )
    total_today = len(today_tasks_db)
    completed_today = sum(1 for t in today_tasks_db if t.status == "completed")
    pending_today = sum(1 for t in today_tasks_db if t.status == "pending")
    percentage = round((completed_today / total_today * 100.0), 1) if total_today > 0 else 0.0

    today_summary = TodaySummary(
        total=total_today,
        completed=completed_today,
        pending=pending_today,
        completion_percentage=percentage,
    )

    # 2. Fetch Streak
    streak_summary = calculate_user_streaks(db, current_user.id)

    # 3. Fetch Active Goals
    active_goals_db = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id, Goal.status == "active")
        .order_by(Goal.created_at.desc())
        .all()
    )

    return DashboardData(
        today=today_summary,
        streak=streak_summary,
        today_tasks=[TaskOut.model_validate(t) for t in today_tasks_db],
        active_goals=[GoalOut.model_validate(g) for g in active_goals_db],
    )
