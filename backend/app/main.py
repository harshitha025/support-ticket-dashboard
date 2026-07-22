from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine, get_db
from app.models import Ticket
from app.schemas import (
    TicketCreate,
    TicketPriority,
    TicketResponse,
    TicketStatus,
    TicketUpdate,
)
from app.seed import seed_tickets


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        seed_tickets(db)

    yield


app = FastAPI(
    title="Support Ticket API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"message": "Support Ticket API is running"}


@app.get("/api/tickets", response_model=list[TicketResponse])
def get_tickets(
    ticket_status: TicketStatus | None = Query(default=None, alias="status"),
    priority: TicketPriority | None = None,
    db: Session = Depends(get_db),
) -> list[Ticket]:
    query = select(Ticket).order_by(Ticket.created_at.desc())

    if ticket_status is not None:
        query = query.where(Ticket.status == ticket_status.value)

    if priority is not None:
        query = query.where(Ticket.priority == priority.value)

    return list(db.scalars(query).all())


@app.get("/api/tickets/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
) -> Ticket:
    ticket = db.get(Ticket, ticket_id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    return ticket


@app.post(
    "/api/tickets",
    response_model=TicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
) -> Ticket:
    ticket = Ticket(
        title=ticket_data.title.strip(),
        description=ticket_data.description.strip(),
        customer_name=ticket_data.customer_name.strip(),
        customer_email=str(ticket_data.customer_email),
        status=TicketStatus.OPEN.value,
        priority=ticket_data.priority.value,
    )

    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    return ticket


@app.patch("/api/tickets/{ticket_id}", response_model=TicketResponse)
def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
) -> Ticket:
    ticket = db.get(Ticket, ticket_id)

    if ticket is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    update_data = ticket_data.model_dump(exclude_unset=True)

    if "status" in update_data:
        ticket.status = update_data["status"].value

    if "priority" in update_data:
        ticket.priority = update_data["priority"].value

    db.commit()
    db.refresh(ticket)

    return ticket