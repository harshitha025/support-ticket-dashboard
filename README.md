# Support Ticket Dashboard

A full-stack Support Ticket Dashboard built as part of the Aurexillion Full-Stack Software Engineer technical assessment.

## Technologies Used

### Frontend
- React
- TypeScript
- Vite
- React Router DOM
- CSS

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic

### Testing
- Pytest

---

# Project Features

- View all support tickets
- Create a new support ticket
- View ticket details
- Update ticket status
- Filter tickets by status and priority
- Persistent SQLite database
- Backend validation
- Responsive user interface

---

# Project Structure

```
aurexillion-support-ticket-dashboard
│
├── frontend
├── backend
└── README.md
```

---

# Installation

## Clone the repository

```bash
git clone <repository-url>
```

```
cd aurexillion-support-ticket-dashboard
```

---

# Backend Setup

```
cd backend
```

Create a virtual environment

```
python -m venv .venv
```

Activate it

Windows

```
.\.venv\Scripts\Activate.ps1
```

Install packages

```
pip install -r requirements.txt
```

Run the backend

```
fastapi dev app/main.py
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger

```
http://127.0.0.1:8000/docs
```

---

# Frontend Setup

```
cd frontend
```

Install dependencies

```
npm install
```

Run

```
npm run dev
```

Frontend URL

```
http://localhost:5173
```

---

# Database

SQLite is used for persistence.

The database is automatically created on first run.

Sample tickets are automatically seeded.

---

# Running Tests

```
cd backend
pytest
```

---

# Assumptions

- Every new ticket starts with status **Open**.
- SQLite is sufficient for this assessment.
- Filtering is performed through backend query parameters.

---

# Technical Trade-offs

- SQLite was selected because it is lightweight and requires no additional setup.
- FastAPI provides simple REST API development with automatic validation.
- The UI prioritizes functionality and maintainability over advanced styling.

---

# Future Improvements

- Search by customer or title
- Pagination
- Authentication
- Docker support
- Deployment
- Drag-and-drop Kanban board
- Swagger customization
- Additional automated tests

---

# Author

Harshitha Vemula