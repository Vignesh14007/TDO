from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class GoalBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = Field(default="active", pattern="^(active|completed|archived)$")
    progress: int = Field(default=0, ge=0, le=100)


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = Field(None, pattern="^(active|completed|archived)$")
    progress: Optional[int] = Field(None, ge=0, le=100)


class GoalOut(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
