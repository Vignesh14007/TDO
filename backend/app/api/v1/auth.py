from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserAuthResponse, UserOut
from app.schemas.token import Token

router = APIRouter()


@router.post("/register", response_model=UserAuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check for existing email
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists.",
        )

    # Create new user
    db_user = User(
        email=user_in.email.lower(),
        name=user_in.name.strip(),
        hashed_password=get_password_hash(user_in.password),
        is_active=True,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Generate access token
    access_token = create_access_token(subject=db_user.id)
    return UserAuthResponse(
        user=UserOut.model_validate(db_user),
        token=Token(access_token=access_token, token_type="bearer"),
    )


@router.post("/login", response_model=UserAuthResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return access token."""
    user = db.query(User).filter(User.email == login_data.email.lower()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is disabled.",
        )

    access_token = create_access_token(subject=user.id)
    return UserAuthResponse(
        user=UserOut.model_validate(user),
        token=Token(access_token=access_token, token_type="bearer"),
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """Logout endpoint. Confirms authentication and advises client to discard token."""
    return {"message": "Successfully logged out."}
