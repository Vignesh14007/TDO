from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalUpdate, GoalOut

router = APIRouter()


@router.get("", response_model=List[GoalOut])
def list_goals(
    status_filter: Optional[str] = Query(None, alias="status", pattern="^(active|completed|archived)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all goals for the current user."""
    query = db.query(Goal).filter(Goal.user_id == current_user.id)
    if status_filter:
        query = query.filter(Goal.status == status_filter)
    return query.order_by(Goal.created_at.desc()).all()


@router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new goal for the current user."""
    db_goal = Goal(
        user_id=current_user.id,
        title=goal_in.title.strip(),
        description=goal_in.description.strip() if goal_in.description else None,
        start_date=goal_in.start_date,
        end_date=goal_in.end_date,
        status=goal_in.status,
        progress=goal_in.progress,
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


@router.get("/{goal_id}", response_model=GoalOut)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve a specific goal by ID ensuring user ownership."""
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found.",
        )
    return goal


@router.put("/{goal_id}", response_model=GoalOut)
def update_goal(
    goal_id: int,
    goal_in: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a goal ensuring user ownership."""
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found.",
        )

    if goal_in.title is not None:
        goal.title = goal_in.title.strip()
    if goal_in.description is not None:
        goal.description = goal_in.description.strip() if goal_in.description else None
    if goal_in.start_date is not None:
        goal.start_date = goal_in.start_date
    if goal_in.end_date is not None:
        goal.end_date = goal_in.end_date
    if goal_in.status is not None:
        goal.status = goal_in.status
    if goal_in.progress is not None:
        goal.progress = goal_in.progress

    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a goal ensuring user ownership."""
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found.",
        )
    db.delete(goal)
    db.commit()
    return None
