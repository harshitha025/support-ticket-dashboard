import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getTicket, updateTicket } from "../api/tickets";
import type { Ticket, TicketStatus } from "../types/ticket";

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTicket() {
      const ticketId = Number(id);

      if (!Number.isInteger(ticketId) || ticketId <= 0) {
        setError("Invalid ticket ID.");
        setLoading(false);
        return;
      }

      try {
        setError("");
        const data = await getTicket(ticketId);
        setTicket(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load the ticket.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTicket();
  }, [id]);

  async function handleStatusChange(status: TicketStatus) {
    if (!ticket) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const updatedTicket = await updateTicket(ticket.id, { status });
      setTicket(updatedTicket);
      setMessage("Ticket status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the ticket.",
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <p className="state-message">Loading ticket details...</p>
      </main>
    );
  }

  if (error && !ticket) {
    return (
      <main className="page">
        <p className="feedback error">{error}</p>
        <Link className="text-link" to="/">
          Back to tickets
        </Link>
      </main>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <main className="page">
      <div className="details-navigation">
        <Link className="text-link" to="/">
          ← Back to tickets
        </Link>
      </div>

      <section className="details-card">
        <div className="details-header">
          <div>
            <p className="eyebrow">Ticket #{ticket.id}</p>
            <h1>{ticket.title}</h1>
          </div>

          <span className={`badge priority-${ticket.priority}`}>
            {formatLabel(ticket.priority)} Priority
          </span>
        </div>

        {message && <p className="feedback success">{message}</p>}
        {error && <p className="feedback error">{error}</p>}

        <div className="details-grid">
          <div>
            <h2>Description</h2>
            <p className="ticket-description">{ticket.description}</p>
          </div>

          <div className="details-sidebar">
            <div className="detail-item">
              <span>Customer</span>
              <strong>{ticket.customer_name}</strong>
            </div>

            <div className="detail-item">
              <span>Email</span>
              <a href={`mailto:${ticket.customer_email}`}>
                {ticket.customer_email}
              </a>
            </div>

            <div className="detail-item">
              <span>Created</span>
              <strong>{formatDate(ticket.created_at)}</strong>
            </div>

            <div className="detail-item">
              <label htmlFor="ticket-status">Status</label>
              <select
                id="ticket-status"
                value={ticket.status}
                disabled={updating}
                onChange={(event) =>
                  handleStatusChange(event.target.value as TicketStatus)
                }
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}