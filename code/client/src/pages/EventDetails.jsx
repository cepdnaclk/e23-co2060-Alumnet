import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getEventById } from "../api";

export default function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getEventById(id);
        setEvent(data);
      } catch (e) {
        setErr(e.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  if (loading) {
    return <PageShell title="Event Details"><div>Loading...</div></PageShell>;
  }

  if (err) {
    return <PageShell title="Event Details"><div style={errorBox}>{err}</div></PageShell>;
  }

  return (
    <PageShell title={event.title} subtitle={`By ${event.created_by_name}`}>
      <div style={card}>
        <div style={meta}>Date: {event.event_date}</div>
        <div style={meta}>Time: {event.event_time}</div>
        <div style={meta}>Venue: {event.venue}</div>
        <div style={meta}>
          Registered: {event.registered_count} / {event.available_slots}
        </div>

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