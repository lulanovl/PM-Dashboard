from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from datetime import timedelta
from jose import jwt, JWTError
from app.core.config import settings
from app.core import security

from app.core.database import get_db
from app.models.project import Project, ProjectParticipant, UserRole
from app.models.user import User
from app.schemas import project as schemas
from app.api.deps import get_current_user
from app.api import deps

router = APIRouter()

@router.post("/projects", response_model=schemas.Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_in: schemas.ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new project.
    
    The creating user becomes the owner of the project.
    """
    project = Project(
        name=project_in.name,
        description=project_in.description,
        owner_id=current_user.id
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    # Also add as participant/owner in association table?
    # The requirement says "create project from details... automatically gives access... making him the owner"
    # The models have owner_id directly on Project.
    # The association table is for "invites".
    # But GET /projects says "List projects where user is owner OR participant".
    # So we should probably keep consistency. 
    # Let's verify logic: GET /projects needs to query (Project.owner_id == user.id) OR (ProjectParticipant.user_id == user.id)
    return project

@router.get("/projects", response_model=List[schemas.Project])
async def read_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all projects where the current user is either an owner or a participant.
    """
    # Fetch projects where user is owner
    # AND projects where user is participant
    query = select(Project).outerjoin(ProjectParticipant).where(
        (Project.owner_id == current_user.id) | 
        (ProjectParticipant.user_id == current_user.id)
    ).distinct()
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/project/{project_id}/info", response_model=schemas.Project)
async def read_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific project.
    
    Requires user to be an owner or participant.
    """
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check access
    # Is owner?
    if project.owner_id == current_user.id:
        return project
        
    # Is participant?
    query_part = select(ProjectParticipant).where(
        (ProjectParticipant.project_id == project_id) &
        (ProjectParticipant.user_id == current_user.id)
    )
    result_part = await db.execute(query_part)
    if result_part.scalars().first():
        return project
        
    raise HTTPException(status_code=403, detail="Not authorized to access this project")

@router.put("/project/{project_id}/info", response_model=schemas.Project)
async def update_project(
    project_id: int,
    project_in: schemas.ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update project details (Name, Description).
    
    Accessible by Owner and Participants.
    """
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check access (Participant or Owner can modify)
    is_owner = project.owner_id == current_user.id
    print(f"Update Project: Project {project_id}, Owner {project.owner_id}, Current User {current_user.id}, Is Owner: {is_owner}")
    
    if not is_owner:
        query_part = select(ProjectParticipant).where(
            (ProjectParticipant.project_id == project_id) &
            (ProjectParticipant.user_id == current_user.id)
        )
        result_part = await db.execute(query_part)
        is_participant = result_part.scalars().first()
        print(f"Update Project: Is Participant: {is_participant}")
        
        if not is_participant:
            raise HTTPException(status_code=403, detail="Not authorized to modify this project")

    if project_in.name is not None:
        project.name = project_in.name
    if project_in.description is not None:
        project.description = project_in.description
        
    await db.commit()
    await db.refresh(project)
    return project

@router.delete("/project/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a project and all associated documents.
    
    **Restricted to Project Owner only.**
    """
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Only owner can delete
    if project.owner_id != current_user.id:
         raise HTTPException(status_code=403, detail="Only the project owner can delete it")
         
    await db.delete(project)
    await db.commit()
    return None

@router.post("/project/{project_id}/invite")
async def invite_user(
    project_id: int,
    user: str, # From query param ?user=<login>
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Invite a user to the project by their username.
    
    - **user** (query param): Username of the user to invite.
    
    **Restricted to Project Owner only.**
    """
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can invite users")
        
    # Find user to invite
    query_user = select(User).where(User.username == user)
    result_user = await db.execute(query_user)
    invited_user = result_user.scalars().first()
    
    if not invited_user:
        raise HTTPException(status_code=404, detail="User to invite not found")
        
    if invited_user.id == project.owner_id:
        raise HTTPException(status_code=400, detail="User is already the owner")
        
    # Check if already participant
    query_part = select(ProjectParticipant).where(
        (ProjectParticipant.project_id == project_id) & 
        (ProjectParticipant.user_id == invited_user.id)
    )
    if (await db.execute(query_part)).scalars().first():
        raise HTTPException(status_code=400, detail="User is already a participant")
        
    participant = ProjectParticipant(
        project_id=project_id,
        user_id=invited_user.id,
        role=UserRole.PARTICIPANT
    )
    db.add(participant)
    await db.commit()
    return {"status": "invited", "user": user}

from datetime import timedelta
from jose import jwt, JWTError
from app.core.config import settings
from app.core import security

@router.get("/project/{project_id}/share")
async def share_project(
    project_id: int,
    with_email: str = Query(..., alias="with"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate and send a share link to an email address.
    
    - **with** (query param): Email address to share with.
    """
    # Check project existence
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Only owner can share/invite
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can share project")

    # Generate Invite Token
    # We use a custom subject or claims for the invite
    invite_data = {
        "sub": with_email, # Subject is the email
        "type": "invite",
        "project_id": project_id
    }
    # Expire in 24 hours
    expires = timedelta(hours=24)
    token = security.create_access_token(invite_data, expires_delta=expires)
    
    # Construct Link
    # Since we are running locally, we assume localhost:8000 or similar. settings.API_V1_STR is /api/v1
    # The link should be to a frontend or an endpoint that handles the join.
    # Let's point to the GET /join endpoint we are about to create (or a hypothetical frontend URL)
    # Ideally should be a frontend URL. But for API-only project, maybe a GET request to API.
    join_link = f"{settings.FRONTEND_URL}/join?token={token}"
    
    # In a real app, we would send this via email.
    return {"message": f"Share link generated for {with_email}", "link": join_link}

@router.get("/join")
async def join_project(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Join a project using an invite token.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_type = payload.get("type")
        project_id = payload.get("project_id")
        email = payload.get("sub")
        
        if token_type != "invite" or project_id is None:
             raise HTTPException(status_code=400, detail="Invalid invite token")
             
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    # Check project exists
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalars().first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check if user is already owner
    if project.owner_id == current_user.id:
        return {"message": "You are already the owner of this project", "project_id": project.id}

    # Check if already participant
    query_part = select(ProjectParticipant).where(
        (ProjectParticipant.project_id == project_id) & 
        (ProjectParticipant.user_id == current_user.id)
    )
    if (await db.execute(query_part)).scalars().first():
        return {"message": "You are already a participant of this project", "project_id": project.id}

    # Add to participants
    participant = ProjectParticipant(
        project_id=project_id,
        user_id=current_user.id,
        role=UserRole.PARTICIPANT
    )
    db.add(participant)
    await db.commit()
    
    return {"message": f"Successfully joined project '{project.name}'", "project_id": project.id}
