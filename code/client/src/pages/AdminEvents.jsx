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
              <h3 style={title}>{event.title}</h3>
              <br></br>
              <div style={meta}>Date: {event.event_date}</div>
              <div style={meta}>Time: {event.event_time}</div>
              <div style={meta}>Venue: {event.venue}</div>
              <div style={meta}>Created By: {event.created_by_name}</div>
              <div style={meta}>Slots: {event.available_slots}</div>
              {event.description && <p style={desc}>{event.description}</p>}
              <br></br>

              <div style={btnRow}>
                <button style={approveBtn} onClick={() => handleApprove(event.id)}>
                  Approve
                </button>
                <button style={rejectBtn} onClick={() => handleReject(event.id)}>
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
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: 20,
};

const card = {
  padding: 20,
  borderRadius: 16,
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(0,0,0,0.06)",
  backdropFilter: "blur(6px)",
};

const title = {
  margin: 0,
  fontSize: 16,
};

const meta = {
  marginTop: 6,
  fontSize: 14,
  color: "rgba(17,17,17,0.72)",
};

const desc = {
  marginTop: 10,
};

const btnRow = {
  display: "flex",
  gap: 10,
  marginTop: 14,
};

const approveBtn = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#dcfce7",
  fontSize: 14,
  cursor: "pointer",
};

const rejectBtn = {
  padding: "8px 14px",
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