from datetime import date
from typing import List
from pydantic import BaseModel
from app.schemas.dashboard import StreakSummary


class DailyMetric(BaseModel):
    date: date
    completed: int
    pending: int
    total: int
    completion_rate: float


class CategoryMetric(BaseModel):
    category: str
    total: int
    completed: int
    completion_rate: float


class PriorityMetric(BaseModel):
    priority: str
    total: int
    completed: int
    completion_rate: float


class AnalyticsData(BaseModel):
    days_analyzed: int
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overall_completion_rate: float
    daily_metrics: List[DailyMetric]
    category_breakdown: List[CategoryMetric]
    priority_breakdown: List[PriorityMetric]
    streak: StreakSummary
