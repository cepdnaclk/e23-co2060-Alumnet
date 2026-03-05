import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Announcements() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch(`${API_BASE}/events`);
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Announcements</h1>
      <p>Upcoming events</p>

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
              {ev.location || "Online"} • {new Date(ev.event_date).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}