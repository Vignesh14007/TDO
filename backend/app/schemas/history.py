from typing import List
from pydantic import BaseModel
from app.schemas.task import TaskOut


class HistorySummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    cancelled_tasks: int
    total_duration_minutes: int


class HistoryResponse(BaseModel):
    summary: HistorySummary
    tasks: List[TaskOut]
