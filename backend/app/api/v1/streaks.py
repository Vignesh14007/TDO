from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.dashboard import StreakSummary
from app.services.streak_service import calculate_user_streaks

router = APIRouter()


@router.get("", response_model=StreakSummary)
def get_user_streaks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve detailed streak and consistency statistics for current user."""
    return calculate_user_streaks(db, current_user.id)
