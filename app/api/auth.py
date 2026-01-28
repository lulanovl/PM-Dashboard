from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.security import OAuth2PasswordRequestForm

from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.schemas import auth as schemas

router = APIRouter()

@router.post("/auth", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user to the system.
    
    - **username**: Unique identifier for the user
    - **password**: Strong password for account security
    
    Returns the created user information.
    """
    # Check if user exists
    result = await db.execute(select(User).where(User.username == user.username))
    db_user = result.scalars().first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Create new user
    hashed_password = security.get_password_hash(user.password)
    new_user = User(username=user.username, password_hash=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(form_data: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate and request an access token (JWT).
    
    - **username**: Registered username
    - **password**: User password
    
    Returns a short-lived access token for authorized API access.
    """
    # Note: Using custom schema UserLogin instead of OAuth2PasswordRequestForm for valid JSON body as requested in prompt "POST /login - Login into service (login, password)"
    # However, to be standard compatible with OAuth2 scheme in deps.py, we usually use form data.
    # The prompt says: POST /login - Login into service (login, password).
    # "All the returned data must be in JSON format".
    # And input? "POST /auth - Create user (login, password, repeat password)" - prompt says this.
    # The prompt actually requested "POST /login - Login into service (login, password)".
    # If I use OAuth2PasswordBearer in deps, it expects form data by default or specific flow.
    # But I can implement standard Token endpoint.
    
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=schemas.Token)
async def login_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
