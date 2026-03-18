import { useState } from "react";
import PageShell from "../components/PageShell";
import { createEvent } from "../api";

export default function CreateEvent() {
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [availableSlots, setAvailableSlots] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      const data = await createEvent(token, {
        title,
        event_date: eventDate,
        event_time: eventTime,
        venue,
        description,
        available_slots: availableSlots ? Number(availableSlots) : 0,
      });

      setSuccess(data.message || "Event created successfully");
      setTitle("");
      setEventDate("");
      setEventTime("");
      setVenue("");
      setDescription("");
      setAvailableSlots("");
    } catch (e) {
      setErr(e.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Create Event" subtitle="Alumni and admins can add events">
      <form onSubmit={handleSubmit} style={card}>
        <div style={grid}>
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={input}
            />
          </Field>

          <Field label="Venue">
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              style={input}
            />
          </Field>

          <Field label="Date">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              style={input}
            />
          </Field>

          <Field label="Time">
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              required
              style={input}
            />
          </Field>

          <Field label="Available Slots">
            <input
              type="number"
              min="0"
              value={availableSlots}
              onChange={(e) => setAvailableSlots(e.target.value)}
              style={input}
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={textarea}
            placeholder="Add a short description for the event..."
          />
        </Field>

        <button type="submit" disabled={loading} style={btn}>
          {loading ? "Creating..." : "Create Event"}
        </button>

        {success && <div style={successBox}>{success}</div>}
        {err && <div style={errorBox}>{err}</div>}
      </form>
    </PageShell>
  );
}

function Field({ label, children }) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const card = {
  padding: 22,
  borderRadius: 16,
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(0,0,0,0.06)",
  backdropFilter: "blur(6px)",
  maxWidth: 760,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const fieldWrap = {
  display: "grid",
  gap: 6,
  marginBottom: 14,
};

const labelStyle = {
  fontSize: 13,
  color: "rgba(17,17,17,0.56)",
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.76)",
  color: "#111111",
  fontSize: 14,
  fontFamily: '"Google Sans", Arial, sans-serif',
  outline: "none",
};

const textarea = {
  ...input,
  minHeight: 120,
  resize: "vertical",
};

const btn = {
  marginTop: 4,
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.8)",
  color: "#111111",
  fontSize: 14,
  fontFamily: '"Google Sans", Arial, sans-serif',
  fontWeight: 400,
  cursor: "pointer",
};

const successBox = {
  background: "#dcfce7",
  padding: 12,
  borderRadius: 12,
  marginTop: 14,
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
  marginTop: 14,
};