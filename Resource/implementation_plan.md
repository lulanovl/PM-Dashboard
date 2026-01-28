# IMPL_PLAN: Project Management Dashboard

## User Review Required
> [!IMPORTANT]
> **Database Selection**: We will use **PostgreSQL** as requested. Please ensure a PostgreSQL instance is running and accessible (connection string will be needed in `.env`).
> **ORM**: We will use **SQLAlchemy (Async)** with **Alembic** for migrations, as it's the standard for modern FastAPI apps.
> **File Storage**: Documents will be stored in a local `media/` directory by default. If cloud storage (AWS S3) is preferred, please specify.

## Proposed Changes

### Project Structure
```text
app/
├── api/
│   ├── auth.py         # Login, Register
│   ├── projects.py     # CRUD Projects, Invite
│   └── documents.py    # CRUD Documents
├── core/
│   ├── config.py       # Env vars
│   ├── security.py     # JWT, Password hashing
│   └── database.py     # DB session
├── models/
│   ├── user.py
│   ├── project.py      # Project + Association (UserProject)
│   └── document.py
├── schemas/
│   ├── auth.py
│   ├── project.py
│   └── document.py
├── main.py
└── requirements.txt
```

### Database Schema (Models)

#### User
- `id`: Integer, PK
- `username`: String, Unique
- `password_hash`: String

#### Project
- `id`: Integer, PK
- `name`: String
- `description`: String
- `owner_id`: FK(User.id)
- `created_at`: DateTime

#### ProjectParticipant (Association)
- `user_id`: FK(User.id)
- `project_id`: FK(Project.id)
- `role`: Enum (OWNER, PARTICIPANT) - *Actually, owner is implicit on project, but this table handles invites*

#### Document
- `id`: Integer, PK
- `project_id`: FK(Project.id)
- `filename`: String
- `file_path`: String
- `content_type`: String
- `uploaded_at`: DateTime

### API Design

#### Auth
- `POST /auth`: Register new user.
- `POST /login`: authenticate, return JWT (exp 1h).

#### Projects
- `POST /projects`: Create project. Creator = Owner.
- `GET /projects`: List projects where user is owner OR participant.
- `GET /project/{id}/info`: Info.
- `PUT /project/{id}/info`: Update info (Participant/Owner).
- `DELETE /project/{id}`: Delete (Owner only). **Deletes the corresponding documents.**
- `POST /project/{id}/invite?user=<login>`: Add entry to ProjectParticipant (Owner only). Grants participant permissions.
- `GET /project/{id}/share?with=<email>`: (Optional) Send share link to email.

#### Documents
- `GET /project/{id}/documents`: List docs.
- `POST /project/{id}/documents`: Upload (Multipart). Save file to disk, record in DB.
- `GET /document/{id}`: FileResponse. Check access.
- `PUT /document/{id}`: Update file content or metadata.
- `DELETE /document/{id}`: Delete file from disk and DB.

## Verification Plan

### Automated Tests
- We will set up a simple test runner or extensive `curl`/`httpie` script to verify endpoints.
- Unit tests with `pytest` and `httpx` (AsyncClient).

### Manual Verification
1. Start server `uvicorn app.main:app --reload`
2. specific flows:
    - Register User A & User B
    - User A creates Project P
    - User A uploads Doc D to P
    - User A invites User B
    - User B checks P info (success)
    - User B tries to Delete P (fail)
