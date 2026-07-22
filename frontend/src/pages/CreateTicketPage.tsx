import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createTicket } from "../api/tickets";
import type { CreateTicketPayload, TicketPriority } from "../types/ticket";

const initialForm: CreateTicketPayload = {
  title: "",
  description: "",
  customer_name: "",
  customer_email: "",
  priority: "medium",
};

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateTicketPayload>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function validateForm(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!form.customer_name.trim()) {
      nextErrors.customer_name = "Customer name is required.";
    }

    if (!form.customer_email.trim()) {
      nextErrors.customer_email = "Customer email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) {
      nextErrors.customer_email = "Enter a valid email address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const ticket = await createTicket({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
      });

      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Unable to create the ticket.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page">
      <div className="details-navigation">
        <Link className="text-link" to="/">
          ← Back to tickets
        </Link>
      </div>

      <section className="form-card">
        <div className="form-header">
          <p className="eyebrow">New support request</p>
          <h1>Create Ticket</h1>
          <p className="page-description">
            Enter the customer issue and assign its priority.
          </p>
        </div>

        {submitError && <p className="feedback error">{submitError}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && (
              <span className="field-error">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer-name">Customer Name</label>
              <input
                id="customer-name"
                type="text"
                value={form.customer_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customer_name: event.target.value,
                  }))
                }
                aria-invalid={Boolean(errors.customer_name)}
              />
              {errors.customer_name && (
                <span className="field-error">
                  {errors.customer_name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="customer-email">Customer Email</label>
              <input
                id="customer-email"
                type="email"
                value={form.customer_email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    customer_email: event.target.value,
                  }))
                }
                aria-invalid={Boolean(errors.customer_email)}
              />
              {errors.customer_email && (
                <span className="field-error">
                  {errors.customer_email}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={form.priority}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priority: event.target.value as TicketPriority,
                }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-actions">
            <Link className="button secondary-button" to="/">
              Cancel
            </Link>

            <button
              className="button primary-button"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}