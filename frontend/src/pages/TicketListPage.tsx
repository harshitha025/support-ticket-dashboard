import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTickets, updateTicket } from "../api/tickets";
import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "../types/ticket";

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

export default function TicketListPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [priorityFilter, setPriorityFilter] =
    useState<TicketPriority | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);
        setError("");

        const data = await getTickets(
          statusFilter || undefined,
          priorityFilter || undefined,
        );

        setTickets(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load tickets.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [statusFilter, priorityFilter]);

  async function handleStatusChange(
    ticketId: number,
    status: TicketStatus,
  ) {
    try {
      setError("");
      setMessage("");

      const updatedTicket = await updateTicket(ticketId, { status });

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === ticketId ? updatedTicket : ticket,
        ),
      );

      setMessage("Ticket status updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update ticket.",
      );
    }
  }

  return (
    <main className="page">
      <section className="page-header">
        <div>
          <p className="eyebrow">Customer support</p>
          <h1>Support Tickets</h1>
          <p className="page-description">
            Review customer requests, filter tickets, and update their status.
          </p>
        </div>

        <Link className="button primary-button" to="/tickets/new">
          Create Ticket
        </Link>
      </section>

      <section className="filters-card">
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as TicketStatus | "")
            }
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="priority-filter">Priority</label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value as TicketPriority | "")
            }
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </section>

      {message && <p className="feedback success">{message}</p>}
      {error && <p className="feedback error">{error}</p>}

      {loading ? (
        <p className="state-message">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <p className="state-message">No tickets match the selected filters.</p>
      ) : (
        <section className="ticket-table-wrapper">
          <table className="ticket-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <strong>{ticket.title}</strong>
                  </td>
                  <td>{ticket.customer_name}</td>
                  <td>
                    <span
                      className={`badge priority-${ticket.priority}`}
                    >
                      {formatLabel(ticket.priority)}
                    </span>
                  </td>
                  <td>
                    <select
                      aria-label={`Update status for ${ticket.title}`}
                      value={ticket.status}
                      onChange={(event) =>
                        handleStatusChange(
                          ticket.id,
                          event.target.value as TicketStatus,
                        )
                      }
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </td>
                  <td>{formatDate(ticket.created_at)}</td>
                  <td>
                    <Link
                      className="text-link"
                      to={`/tickets/${ticket.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}