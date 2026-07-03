import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { approveEvent, getPendingEvents, rejectEvent } from "../api";

export default function AdminEvents() {
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadPendingEvents = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getPendingEvents(token);
      setEvents(data);
    } catch (e) {
      setErr(e.message || "Failed to load pending events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveEvent(token, id);
      loadPendingEvents();
    } catch (e) {
      setErr(e.message || "Failed to approve event");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectEvent(token, id);
      loadPendingEvents();
    } catch (e) {
      setErr(e.message || "Failed to reject event");
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
    <PageShell
      title="Event Approvals"
      subtitle="Approve or reject submitted events"
    >
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : events.length === 0 ? (
        <div>No pending events.</div>
      ) : (
        <div style={grid}>
          {events.map((event) => (
            <div key={event.id} style={card}>
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  style={adminPoster}
                />
              )}

              <h3 style={title}>{event.title}</h3>
              <div style={createdBy}>By {event.created_by_name || "-"}</div>

              <div style={detailsGrid}>
                <div style={detailBox}>
                  <span style={detailLabel}>Date</span>
                  <strong>{formatDate(event.event_date)}</strong>
                </div>

                <div style={detailBox}>
                  <span style={detailLabel}>Time</span>
                  <strong>{formatTime(event.event_time)}</strong>
                </div>

                <div style={detailBox}>
                  <span style={detailLabel}>Venue</span>
                  <strong>{event.venue || "-"}</strong>
                </div>

                <div style={detailBox}>
                  <span style={detailLabel}>Speaker</span>
                  <strong>{event.speaker || "-"}</strong>
                </div>

                <div style={detailBox}>
                  <span style={detailLabel}>Slots</span>
                  <strong>{event.available_slots || 0}</strong>
                </div>
              </div>

              {event.description && <p style={desc}>{event.description}</p>}

              <div style={btnRow}>
                <button
                  style={approveBtn}
                  onClick={() => handleApprove(event.id)}
                >
                  Approve
                </button>
                <button
                  style={rejectBtn}
                  onClick={() => handleReject(event.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))",
  gap: 20,
};

const card = {
  padding: 22,
  borderRadius: 18,
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(0,0,0,0.06)",
  backdropFilter: "blur(6px)",
};

const adminPoster = {
  width: "100%",
  maxHeight: 280,
  objectFit: "contain",
  borderRadius: 16,
  marginBottom: 18,
  background: "#f5f5f5",
};

const title = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.2,
  fontWeight: 700,
  color: "#111111",
};

const createdBy = {
  marginTop: 6,
  marginBottom: 18,
  fontSize: 14,
  color: "rgba(17,17,17,0.56)",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  marginBottom: 16,
};

const detailBox = {
  padding: 12,
  borderRadius: 14,
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(0,0,0,0.06)",
  display: "grid",
  gap: 4,
};

const detailLabel = {
  fontSize: 12,
  color: "rgba(17,17,17,0.52)",
};

const desc = {
  marginTop: 14,
  fontSize: 15,
  lineHeight: 1.6,
  color: "rgba(17,17,17,0.78)",
};

const btnRow = {
  display: "flex",
  gap: 10,
  marginTop: 18,
};

const approveBtn = {
  padding: "9px 16px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#dcfce7",
  fontSize: 14,
  cursor: "pointer",
};

const rejectBtn = {
  padding: "9px 16px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#fee2e2",
  fontSize: 14,
  cursor: "pointer",
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
};