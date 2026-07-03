import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { getMyCreatedEvents } from "../api";

export default function MyCreatedEvents() {
  const token = localStorage.getItem("token");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getMyCreatedEvents(token);
        setEvents(data);
      } catch (e) {
        setErr(e.message || "Failed to load your events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [token]);

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

  const statusStyle = (status) => {
    if (status === "approved") return approvedStatus;
    if (status === "rejected") return rejectedStatus;
    return pendingStatus;
  };

  return (
    <PageShell
      title="My Created Events"
      subtitle="Track approval status of your submitted events"
    >
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : events.length === 0 ? (
        <div>You have not created any events yet.</div>
      ) : (
        <div style={grid}>
          {events.map((event) => {
            const registered = Number(event.registered_count || 0);
            const slots = Number(event.available_slots || 0);

            return (
              <div key={event.id} style={card}>
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} style={poster} />
                )}

                <div style={topRow}>
                  <h3 style={title}>{event.title}</h3>
                  <span style={statusStyle(event.approval_status)}>
                    {event.approval_status}
                  </span>
                </div>

                <div style={meta}>Date: {formatDate(event.event_date)}</div>
                <div style={meta}>Time: {formatTime(event.event_time)}</div>
                <div style={meta}>Venue: {event.venue || "-"}</div>
                <div style={meta}>Speaker: {event.speaker || "-"}</div>
                <div style={meta}>
                  Registered: {registered} / {slots}
                </div>

                {event.description && <p style={desc}>{event.description}</p>}
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
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  gap: 20,
};

const card = {
  padding: 20,
  borderRadius: 18,
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(0,0,0,0.06)",
};

const poster = {
  width: "100%",
  maxHeight: 220,
  objectFit: "contain",
  borderRadius: 14,
  background: "#f5f5f5",
  marginBottom: 16,
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "start",
};

const title = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
};

const meta = {
  marginTop: 8,
  fontSize: 14,
  color: "rgba(17,17,17,0.72)",
};

const desc = {
  marginTop: 14,
  fontSize: 14,
  lineHeight: 1.6,
};

const approvedStatus = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#166534",
  fontSize: 13,
};

const pendingStatus = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "#fef3c7",
  color: "#92400e",
  fontSize: 13,
};

const rejectedStatus = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "#fee2e2",
  color: "#991b1b",
  fontSize: 13,
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
};