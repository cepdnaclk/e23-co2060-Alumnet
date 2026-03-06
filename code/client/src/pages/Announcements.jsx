import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Announcements() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [showForm, setShowForm] = useState(false);

  // role detection from token
  const token = localStorage.getItem("token");

  const role = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token)?.role || null;
    } catch {
      return null;
    }
  }, [token]);

  const canCreate = role === "admin" || role === "alumni";

  const loadEvents = async () => {
    try {
      setErr("");
      const res = await fetch(`${API_BASE}/events`);
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // create event handler (POSTING)
  const handleCreate = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          event_date: eventDate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to create event");
      }

      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");
      setShowForm(false);

      setLoading(true);
      await loadEvents();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Top section with heading on left and button on right */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 8,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Announcements</h1>
          <p style={{ margin: "8px 0 0 0" }}>Upcoming events</p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {showForm ? "Close" : "Add Event"}
          </button>
        )}
      </div>

      {/* Add Event form (ONLY for admin and alumni, and only when button clicked) */}
      {canCreate && showForm && (
        <form
          onSubmit={handleCreate}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 16,
            background: "white",
            marginBottom: 16,
          }}
        >
          <h3 style={{ marginTop: 0 }}>Add Event</h3>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
            required
          />

          <input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
            required
          />

          <button style={{ padding: "10px 16px" }}>Create</button>
        </form>
      )}

      {!canCreate && (
        <p style={{ opacity: 0.7 }}>
          Only alumni and admins can create events.
        </p>
      )}

      {loading && <p>Loading events...</p>}
      {err && <p style={{ color: "red" }}>Error: {err}</p>}

      {!loading && !err && events.length === 0 && <p>No upcoming events.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {events.map((ev) => (
          <div
            key={ev.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              background: "white",
            }}
          >
            <h3 style={{ margin: 0 }}>{ev.title}</h3>
            <p style={{ margin: "8px 0" }}>{ev.description}</p>
            <small>
              {ev.location || "Online"} •{" "}
              {ev.event_date ? new Date(ev.event_date).toLocaleString() : ""}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}