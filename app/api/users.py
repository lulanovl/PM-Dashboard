from fastapi import APIRouter, Depends
from app.models.user import User
from app.api.deps import get_current_user
from app.schemas import auth as schemas

router = APIRouter()

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user.
    """
    return current_user
