from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, desc, asc
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter()


@router.get("", response_model=List[TaskOut])
def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status", pattern="^(pending|completed|cancelled)$"),
    priority: Optional[str] = Query(None, pattern="^(low|medium|high)$"),
    category: Optional[str] = None,
    goal_id: Optional[int] = None,
    task_date: Optional[date] = Query(None, alias="date"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    search: Optional[str] = None,
    sort_by: str = Query("task_date", pattern="^(task_date|priority|created_at)$"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve and filter tasks belonging to the current user."""
    query = db.query(Task).filter(Task.user_id == current_user.id)

    if status_filter:
        query = query.filter(Task.status == status_filter)
    if priority:
        query = query.filter(Task.priority == priority)
    if category:
        query = query.filter(Task.category.ilike(category))
    if goal_id:
        query = query.filter(Task.goal_id == goal_id)
    if task_date:
        query = query.filter(Task.task_date == task_date)
    if start_date:
        query = query.filter(Task.task_date >= start_date)
    if end_date:
        query = query.filter(Task.task_date <= end_date)
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term),
            )
        )

    # Sorting
    order_func = desc if sort_order == "desc" else asc
    if sort_by == "priority":
        query = query.order_by(order_func(Task.priority), Task.task_date.asc())
    elif sort_by == "created_at":
        query = query.order_by(order_func(Task.created_at))
    else:
        query = query.order_by(order_func(Task.task_date), Task.created_at.asc())

    return query.all()


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new task for the current user."""
    # If goal_id is specified, verify ownership
    if task_in.goal_id:
        goal = db.query(Goal).filter(Goal.id == task_in.goal_id, Goal.user_id == current_user.id).first()
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referenced goal does not exist or does not belong to you.",
            )

    db_task = Task(
        user_id=current_user.id,
        goal_id=task_in.goal_id,
        title=task_in.title.strip(),
        description=task_in.description.strip() if task_in.description else None,
        task_date=task_in.task_date,
        due_date=task_in.due_date,
        priority=task_in.priority,
        category=task_in.category.strip(),
        duration=task_in.duration,
        status="pending",
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a single task ensuring user ownership."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a task ensuring user ownership."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )

    # If updating goal_id, verify ownership
    if task_in.goal_id is not None:
        if task_in.goal_id != task.goal_id:
            goal = db.query(Goal).filter(Goal.id == task_in.goal_id, Goal.user_id == current_user.id).first()
            if not goal:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Referenced goal does not exist or does not belong to you.",
                )
            task.goal_id = task_in.goal_id

    if task_in.title is not None:
        task.title = task_in.title.strip()
    if task_in.description is not None:
        task.description = task_in.description.strip() if task_in.description else None
    if task_in.task_date is not None:
        task.task_date = task_in.task_date
    if task_in.due_date is not None:
        task.due_date = task_in.due_date
    if task_in.priority is not None:
        task.priority = task_in.priority
    if task_in.category is not None:
        task.category = task_in.category.strip()
    if task_in.duration is not None:
        task.duration = task_in.duration
    if task_in.status is not None:
        task.status = task_in.status
        if task_in.status == "completed":
            task.completed_at = datetime.now(timezone.utc)
        elif task_in.status == "pending":
            task.completed_at = None

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a task ensuring user ownership."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    db.delete(task)
    db.commit()
    return None


@router.post("/{task_id}/complete", response_model=TaskOut)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a task as completed with UTC completion timestamp."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    task.status = "completed"
    task.completed_at = datetime.now(timezone.utc)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.post("/{task_id}/uncomplete", response_model=TaskOut)
def uncomplete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revert a task to pending and clear completion timestamp."""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found.",
        )
    task.status = "pending"
    task.completed_at = None
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
