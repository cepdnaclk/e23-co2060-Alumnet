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
    <PageShell title="Event Details" subtitle="View full event information">
      <div style={card}>
        <div style={heroTitleBlock}>
          <h1 style={eventTitle}>{event.title}</h1>
          <p style={eventCreator}>Hosted by {event.created_by_name || "-"}</p>
        </div>

        {event.image_url && (
          <img src={event.image_url} alt={event.title} style={eventPoster} />
        )}

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
            <span style={detailLabel}>Registered</span>
            <strong>
              {registered} / {slots}
            </strong>
          </div>

          <div style={detailBox}>
            <span style={detailLabel}>Availability</span>
            <strong>
              {remaining > 0 ? `${remaining} slots available` : "Event full"}
            </strong>
          </div>
        </div>

        <div style={actionRow}>
          {event.zoom_link && (
            <a
              href={event.zoom_link}
              target="_blank"
              rel="noreferrer"
              style={zoomBtn}
            >
              Join Zoom Session
            </a>
          )}

          {event.is_registered ? (
            <button
              style={{ ...joinBtn, opacity: 0.6, cursor: "not-allowed" }}
              disabled
            >
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
        </div>

        {event.description && <p style={desc}>{event.description}</p>}
      </div>
    </PageShell>
  );
}

const card = {
  padding: 28,
  borderRadius: 22,
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.06)",
};

const heroTitleBlock = {
  marginBottom: 22,
  paddingBottom: 16,
  borderBottom: "1px solid rgba(0,0,0,0.08)",
};

const eventTitle = {
  margin: 0,
  fontSize: 36,
  lineHeight: 1.15,
  fontWeight: 800,
  color: "#111111",
  letterSpacing: "-0.04em",
};

const eventCreator = {
  marginTop: 8,
  marginBottom: 0,
  fontSize: 15,
  color: "rgba(17,17,17,0.58)",
};

const eventPoster = {
  width: "100%",
  maxHeight: 520,
  objectFit: "contain",
  borderRadius: 18,
  marginBottom: 24,
  background: "#f5f5f5",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 14,
  marginBottom: 22,
};

const detailBox = {
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(0,0,0,0.06)",
  display: "grid",
  gap: 5,
};

const detailLabel = {
  fontSize: 13,
  color: "rgba(17,17,17,0.52)",
};

const actionRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 6,
};

const joinBtn = {
  padding: "10px 18px",
  borderRadius: 999,
  border: "none",
  background: "#111",
  color: "white",
  fontSize: 14,
};

const zoomBtn = {
  display: "inline-block",
  padding: "10px 18px",
  borderRadius: 999,
  background: "#2563eb",
  color: "white",
  textDecoration: "none",
  fontSize: 14,
};

const desc = {
  marginTop: 24,
  fontSize: 16,
  lineHeight: 1.7,
  color: "rgba(17,17,17,0.8)",
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
};