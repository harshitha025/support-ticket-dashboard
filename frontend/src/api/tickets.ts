import type {
  CreateTicketPayload,
  Ticket,
  TicketPriority,
  TicketStatus,
  UpdateTicketPayload,
} from "../types/ticket";

const API_URL = "http://127.0.0.1:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail ?? "Something went wrong.";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getTickets(
  status?: TicketStatus,
  priority?: TicketPriority,
): Promise<Ticket[]> {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (priority) {
    params.set("priority", priority);
  }

  const query = params.toString();
  const response = await fetch(
    `${API_URL}/api/tickets${query ? `?${query}` : ""}`,
  );

  return handleResponse<Ticket[]>(response);
}

export async function getTicket(id: number): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets/${id}`);

  return handleResponse<Ticket>(response);
}

export async function createTicket(
  payload: CreateTicketPayload,
): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Ticket>(response);
}

export async function updateTicket(
  id: number,
  payload: UpdateTicketPayload,
): Promise<Ticket> {
  const response = await fetch(`${API_URL}/api/tickets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Ticket>(response);
}