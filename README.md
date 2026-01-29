# Project Management Dashboard

A comprehensive project management service that allows users to create, update, share, and manage projects and associated documents.

## Features

-   **User Authentication**: Secure signup and login functionality using JWT.
-   **Project Management**: Create, read, update, and delete projects.
-   **Document Management**: Upload, update, and delete project documents (PDF, DOCX, etc.).
-   **Role-Based Access**:
    -   **Owner**: Full control over the project (edit, delete, manage documents, share).
    -   **Participant**: Can view details and documents but has restricted permissions (cannot delete the project).
-   **Project Sharing**: specialized invite links to add members to projects.
-   **Modern UI**: Built with React, TailwindCSS, and Framer Motion for a smooth user experience.

## Technology Stack

### Backend
-   **Language**: Python 3.10+
-   **Framework**: FastAPI
-   **Database**: PostgreSQL
-   **ORM**: SQLAlchemy
-   **Migrations**: Alembic

### Frontend
-   **Framework**: React 19 (Vite)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS
-   **State/Data**: Axios, React Router DOM
-   **UI Components**: Radix UI, Lucide React
-   **Animations**: Framer Motion

## Prerequisites

1.  **PostgreSQL**: Ensure you have PostgreSQL installed and running.
    -   Create a database named `pm_dashboard` (or update `.env` with your preferred name).
2.  **Node.js**: Version 18+ (Verified on v24).
3.  **Python**: Version 3.10+.

## Installation & Running

### 1. Backend Setup

Open a terminal in the **root** directory of the project.

1.  **Create a Virtual Environment** (Optional but recommended):
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    -   Ensure a `.env` file exists in the root directory.
    -   It should contain your database URL, e.g.:
        ```env
        DATABASE_URL=postgresql://user:password@localhost:5432/pm_dashboard
        SECRET_KEY=your_secret_key
        ALGORITHM=HS256
        ACCESS_TOKEN_EXPIRE_MINUTES=60
        ```

4.  **Run Migrations**:
    ```bash
    alembic upgrade head
    ```

5.  **Start the Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will run at `http://localhost:8000`.

### 2. Frontend Setup

Open a second terminal in the `frontend` directory.

1.  **Navigate to frontend**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    The frontend will run at `http://localhost:5173`.

## Usage

1.  Open your browser to `http://localhost:5173`.
2.  Register a new account.
3.  Create a project on the dashboard.
4.  Click on a project card to view details, upload documents, or share it with others.
