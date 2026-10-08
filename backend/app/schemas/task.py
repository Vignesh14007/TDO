from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    task_date: date
    due_date: Optional[date] = None
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    category: str = Field(default="general", min_length=1, max_length=50)
    duration: Optional[int] = Field(None, ge=1, le=1440)  # in minutes (max 24 hours)
    goal_id: Optional[int] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    task_date: Optional[date] = None
    due_date: Optional[date] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    duration: Optional[int] = Field(None, ge=1, le=1440)
    goal_id: Optional[int] = None
    status: Optional[str] = Field(None, pattern="^(pending|completed|cancelled)$")


class TaskOut(TaskBase):
    id: int
    user_id: int
    status: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
