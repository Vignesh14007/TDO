from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.analytics import AnalyticsData
from app.services.analytics_service import get_analytics_data

router = APIRouter()


@router.get("", response_model=AnalyticsData)
def get_analytics(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve full productivity analytics for specified time window."""
    return get_analytics_data(db, current_user.id, days=days)
