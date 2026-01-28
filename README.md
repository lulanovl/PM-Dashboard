# Project Management Dashboard

## Prerequisites
1.  **PostgreSQL**: Ensure you have PostgreSQL installed and running.
    -   Create a database named `pm_dashboard`.
    -   Update `.env` if your credentials differ from `postgres:postgres@localhost:5432`.
2.  **Node.js**: Version 18+ (verified v24).
3.  **Python**: Version 3.10+.

## Running the Project

You will need two terminal windows.

### Terminal 1: Backend
Navigate to the project root:
```bash
cd "C:\Users\Eldar\OneDrive - Engineering College LA\APRD\Epam Project"
```

1.  **Install Python Dependencies** (if not done):
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run Migrations** (Initialize Database):
    ```bash
    alembic upgrade head
    ```

3.  **Start Server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will start at `http://localhost:8000`.

### Terminal 2: Frontend
Navigate to the frontend directory:
```bash
cd "C:\Users\Eldar\OneDrive - Engineering College LA\APRD\Epam Project\frontend"
```

1.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    The frontend will start at `http://localhost:5173`.

## Usage
Open **http://localhost:5173** in your browser.
-   **Register** a new account.
-   **Create** a project.
-   **Upload** documents.
