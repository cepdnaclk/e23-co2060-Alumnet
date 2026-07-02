import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getEventById, registerForEvent } from "../api";

export default function EventDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadEvent = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getEventById(token, id);
      setEvent(data);
    } catch (e) {
      setErr(e.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleJoin = async () => {
    try {
      setErr("");
      await registerForEvent(token, id);

      const updated = await getEventById(token, id);
      setEvent(updated);
    } catch (e) {
      setErr(e.message || "Failed to join event");
    }
  };

  if (loading) {
    return (
      <PageShell title="Event Details">
        <div>Loading...</div>
      </PageShell>
    );
  }

  if (err) {
    return (
      <PageShell title="Event Details">
        <div style={errorBox}>{err}</div>
      </PageShell>
    );
  }

  if (!event) {
    return (
      <PageShell title="Event Details">
        <div>Event not found.</div>
      </PageShell>
    );
  }

  const registered = Number(event.registered_count || 0);
  const slots = Number(event.available_slots || 0);
  const remaining = Math.max(slots - registered, 0);

  return (
    <PageShell title={event.title} subtitle={`By ${event.created_by_name}`}>
      <div style={card}>
        <div style={meta}>Date: {event.event_date}</div>
        <div style={meta}>Time: {event.event_time}</div>
        <div style={meta}>Venue: {event.venue}</div>
        <div style={meta}>
          Registered: {registered} / {slots}
        </div>
        <div style={meta}>
          Availability:{" "}
          {remaining > 0 ? `${remaining} slots available` : "Event full"}
        </div>

        {event.is_registered ? (
          <button style={{ ...joinBtn, opacity: 0.6, cursor: "not-allowed" }} disabled>
            Already Joined
          </button>
        ) : (
          <button
            style={{
              ...joinBtn,
              opacity: remaining > 0 ? 1 : 0.6,
              cursor: remaining > 0 ? "pointer" : "not-allowed",
            }}
            onClick={handleJoin}
            disabled={remaining <= 0}
          >
            {remaining <= 0 ? "Event Full" : "Join Event"}
          </button>
        )}

        <p style={desc}>{event.description}</p>

        <h3>Event Gallery</h3>
        <div style={galleryBox}>
          Pictures of this event can be added here later.
        </div>
      </div>
    </PageShell>
  );
}

const card = {
  padding: 24,
  borderRadius: 16,
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(0,0,0,0.06)",
};

const meta = {
  marginTop: 8,
  fontSize: 15,
  color: "rgba(17,17,17,0.72)",
};

const joinBtn = {
  marginTop: 18,
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  background: "#111",
  color: "white",
  fontSize: 14,
};

const desc = {
  marginTop: 20,
  fontSize: 16,
  lineHeight: 1.6,
};

const galleryBox = {
  marginTop: 12,
  padding: 24,
  borderRadius: 14,
  border: "1px dashed rgba(0,0,0,0.2)",
  color: "rgba(17,17,17,0.55)",
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
};