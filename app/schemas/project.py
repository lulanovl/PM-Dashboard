from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from enum import Enum

class UserRole(str, Enum):
    OWNER = "owner"
    PARTICIPANT = "participant"

class ProjectBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None

class ProjectParticipant(BaseModel):
    user_id: int
    role: UserRole
    # Could add username here if we join

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProjectWithDetails(Project):
    pass
    # We might want to include documents or participants list here if requested "full info"
