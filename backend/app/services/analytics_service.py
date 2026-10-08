from datetime import date, timedelta
from typing import List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.task import Task
from app.schemas.analytics import AnalyticsData, DailyMetric, CategoryMetric, PriorityMetric
from app.services.streak_service import calculate_user_streaks


def get_analytics_data(db: Session, user_id: int, days: int = 30) -> AnalyticsData:
    """Compute performance metrics, daily activity, category and priority distribution."""
    today = date.today()
    start_date = today - timedelta(days=days - 1)

    # Fetch tasks within the window
    tasks = (
        db.query(Task)
        .filter(Task.user_id == user_id, Task.task_date >= start_date, Task.task_date <= today)
        .all()
    )

    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "completed")
    pending_tasks = sum(1 for t in tasks if t.status == "pending")
    overall_rate = round((completed_tasks / total_tasks * 100.0), 1) if total_tasks > 0 else 0.0

    # 1. Daily Metrics
    daily_map: Dict[date, Dict[str, int]] = {}
    curr = start_date
    while curr <= today:
        daily_map[curr] = {"total": 0, "completed": 0, "pending": 0}
        curr += timedelta(days=1)

    for t in tasks:
        if t.task_date in daily_map:
            daily_map[t.task_date]["total"] += 1
            if t.status == "completed":
                daily_map[t.task_date]["completed"] += 1
            elif t.status == "pending":
                daily_map[t.task_date]["pending"] += 1

    daily_metrics: List[DailyMetric] = []
    for d in sorted(daily_map.keys()):
        tot = daily_map[d]["total"]
        comp = daily_map[d]["completed"]
        pend = daily_map[d]["pending"]
        rate = round((comp / tot * 100.0), 1) if tot > 0 else 0.0
        daily_metrics.append(
            DailyMetric(
                date=d,
                total=tot,
                completed=comp,
                pending=pend,
                completion_rate=rate,
            )
        )

    # 2. Category Metrics
    cat_map: Dict[str, Dict[str, int]] = {}
    for t in tasks:
        cat = t.category.lower().capitalize()
        if cat not in cat_map:
            cat_map[cat] = {"total": 0, "completed": 0}
        cat_map[cat]["total"] += 1
        if t.status == "completed":
            cat_map[cat]["completed"] += 1

    category_breakdown = [
        CategoryMetric(
            category=cat,
            total=stats["total"],
            completed=stats["completed"],
            completion_rate=round((stats["completed"] / stats["total"] * 100.0), 1)
            if stats["total"] > 0
            else 0.0,
        )
        for cat, stats in sorted(cat_map.items(), key=lambda x: x[1]["total"], reverse=True)
    ]

    # 3. Priority Metrics
    prio_map: Dict[str, Dict[str, int]] = {"high": {"total": 0, "completed": 0}, "medium": {"total": 0, "completed": 0}, "low": {"total": 0, "completed": 0}}
    for t in tasks:
        prio = t.priority.lower()
        if prio in prio_map:
            prio_map[prio]["total"] += 1
            if t.status == "completed":
                prio_map[prio]["completed"] += 1

    priority_breakdown = [
        PriorityMetric(
            priority=prio.capitalize(),
            total=stats["total"],
            completed=stats["completed"],
            completion_rate=round((stats["completed"] / stats["total"] * 100.0), 1)
            if stats["total"] > 0
            else 0.0,
        )
        for prio, stats in prio_map.items()
    ]

    streak_summary = calculate_user_streaks(db, user_id)

    return AnalyticsData(
        days_analyzed=days,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        overall_completion_rate=overall_rate,
        daily_metrics=daily_metrics,
        category_breakdown=category_breakdown,
        priority_breakdown=priority_breakdown,
        streak=streak_summary,
    )
