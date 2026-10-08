from datetime import date, timedelta
from typing import Set
from sqlalchemy import distinct
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.dashboard import StreakSummary


def get_user_completed_dates(db: Session, user_id: int) -> Set[date]:
    """Retrieve all unique calendar dates on which the user completed at least one task."""
    rows = (
        db.query(Task.task_date)
        .filter(Task.user_id == user_id, Task.status == "completed")
        .distinct()
        .all()
    )
    return {row[0] for row in rows if row[0] is not None}


def calculate_user_streaks(db: Session, user_id: int) -> StreakSummary:
    """Calculate deterministic streak and consistency statistics from stored task data."""
    completed_dates = get_user_completed_dates(db, user_id)
    today = date.today()
    yesterday = today - timedelta(days=1)

    # 1. Current Streak
    current_streak = 0
    if today in completed_dates:
        check_date = today
        while check_date in completed_dates:
            current_streak += 1
            check_date -= timedelta(days=1)
    elif yesterday in completed_dates:
        # Grace period: maintaining streak from yesterday until today ends
        check_date = yesterday
        while check_date in completed_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

    # 2. Longest Streak
    sorted_dates = sorted(completed_dates)
    longest_streak = 0
    if sorted_dates:
        longest_streak = 1
        current_run = 1
        for i in range(1, len(sorted_dates)):
            if sorted_dates[i] == sorted_dates[i - 1] + timedelta(days=1):
                current_run += 1
            else:
                current_run = 1
            if current_run > longest_streak:
                longest_streak = current_run

    # 3. Consistency percentage over last 30 days
    last_30_start = today - timedelta(days=29)
    days_active_last_30 = sum(1 for d in completed_dates if d >= last_30_start and d <= today)
    consistency_percentage = round((days_active_last_30 / 30.0) * 100.0, 1)

    return StreakSummary(
        current_streak=current_streak,
        longest_streak=max(longest_streak, current_streak),
        consistency_percentage=consistency_percentage,
        total_active_days=len(completed_dates),
    )
