from typing import List
from pydantic import BaseModel
from app.schemas.task import TaskOut
from app.schemas.goal import GoalOut


class TodaySummary(BaseModel):
    total: int
    completed: int
    pending: int
    completion_percentage: float


class StreakSummary(BaseModel):
    current_streak: int
    longest_streak: int
    consistency_percentage: float
    total_active_days: int


class DashboardData(BaseModel):
    today: TodaySummary
    streak: StreakSummary
    today_tasks: List[TaskOut]
    active_goals: List[GoalOut]
