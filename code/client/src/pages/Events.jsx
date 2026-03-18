import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import PageShell from "../components/PageShell";
import { getEvents, registerForEvent } from "../api";

export default function Events() {
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const currentUser = useMemo(() => {
    try {
      if (!token) return null;
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const isStudent = currentUser?.role === "student";

  const loadEvents = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getEvents();
      setEvents(data);
    } catch (e) {
      setErr(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      setErr("");
      await registerForEvent(token, eventId);
      loadEvents();
    } catch (e) {
      setErr(e.message || "Failed to register for event");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <PageShell title="Events" subtitle="Approved events visible to students">
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : events.length === 0 ? (
        <div>No approved events yet.</div>
      ) : (
        <div style={grid}>
          {events.map((event) => {
            const registered = Number(event.registered_count || 0);
            const slots = Number(event.available_slots || 0);
            const remaining = Math.max(slots - registered, 0);

            return (
              <div key={event.id} style={card}>
                <div style={topBlock}>
                  <h3 style={title}>{event.title}</h3>
                  <div style={createdBy}>By {event.created_by_name || "-"}</div>
                </div>
                <br></br>

                <div style={metaRows}>
                  <div style={metaRow}>
                    <span style={metaLabel}>Date</span>
                    <span style={metaValue}>{formatDate(event.event_date)}</span>
                  </div>

                  <div style={metaRow}>
                    <span style={metaLabel}>Time</span>
                    <span style={metaValue}>{formatTime(event.event_time)}</span>
                  </div>

                  <div style={metaRow}>
                    <span style={metaLabel}>Venue</span>
                    <span style={metaValue}>{event.venue || "-"}</span>
                  </div>

                  <div style={metaRow}>
                    <span style={metaLabel}>Registered</span>
                    <span style={metaValue}>
                      {registered} / {slots}
                    </span>
                  </div>

                  <div style={metaRow}>
                    <span style={metaLabel}>Availability</span>
                    <span
                      style={{
                        ...metaValue,
                        color: remaining > 0 ? "#17a84f" : "#b91c1c",
                        fontWeight: 500,
                      }}
                    >
                      {remaining > 0
                        ? `${remaining} slots available`
                        : "Event full"}
                    </span>
                  </div>
                </div>

                {event.description && (
                  <p style={desc}>{event.description}</p>
                )}

                {isStudent && (
                  <button
                    style={{
                      ...joinBtn,
                      opacity: remaining > 0 ? 1 : 0.55,
                      cursor: remaining > 0 ? "pointer" : "not-allowed",
                    }}
                    onClick={() => handleRegister(event.id)}
                    disabled={remaining <= 0}
                  >
                    Join Event
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: 20,
};

const card = {
  padding: 20,
  borderRadius: 16,
  background: "rgba(255,255,255,0.65)",
  border: "1px solid rgba(0,0,0,0.06)",
  backdropFilter: "blur(6px)",
};

const topBlock = {
  marginBottom: 14,
};

const title = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.2,
  fontWeight: 500,
  color: "#111111",
  letterSpacing: "-0.02em",
};

const createdBy = {
  marginTop: 6,
  fontSize: 13,
  color: "rgba(17,17,17,0.56)",
};

const metaRows = {
  display: "grid",
  gap: 8,
};

const metaRow = {
  display: "grid",
  gridTemplateColumns: "88px 1fr",
  gap: 10,
  alignItems: "start",
};

const metaLabel = {
  fontSize: 13,
  color: "rgba(17,17,17,0.52)",
};

const metaValue = {
  fontSize: 14,
  color: "#111111",
  wordBreak: "break-word",
};

const desc = {
  marginTop: 14,
  marginBottom: 0,
  fontSize: 14,
  lineHeight: 1.7,
  color: "rgba(17,17,17,0.72)",
};

const joinBtn = {
  marginTop: 16,
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255,255,255,0.74)",
  color: "#111111",
  fontSize: 14,
  fontWeight: 400,
  fontFamily: '"Google Sans", Arial, sans-serif',
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 14,
  marginBottom: 14,
};