from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Ticket


def seed_tickets(db: Session) -> None:
    existing_ticket = db.scalar(select(Ticket).limit(1))

    if existing_ticket:
        return

    tickets = [
        Ticket(
            title="Unable to complete payment",
            description="The customer receives an error after submitting the payment form.",
            customer_name="Jane Smith",
            customer_email="jane@example.com",
            status="open",
            priority="high",
        ),
        Ticket(
            title="Password reset email not received",
            description="The customer requested a password reset several times but never received the email.",
            customer_name="Michael Brown",
            customer_email="michael@example.com",
            status="in_progress",
            priority="medium",
        ),
        Ticket(
            title="Update billing address",
            description="Customer needs help updating the billing address on the account.",
            customer_name="Sarah Wilson",
            customer_email="sarah@example.com",
            status="resolved",
            priority="low",
        ),
    ]

    db.add_all(tickets)
    db.commit()