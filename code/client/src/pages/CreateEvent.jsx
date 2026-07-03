import { useState } from "react";
import PageShell from "../components/PageShell";
import { createEvent } from "../api";
import { supabase } from "../supabase";

export default function CreateEvent() {
  const token = localStorage.getItem("token");

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [availableSlots, setAvailableSlots] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [zoomLink, setZoomLink] = useState("");

  const [eventPoster, setEventPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const handlePosterChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setEventPoster(null);
      setPosterPreview("");
      return;
    }

    setEventPoster(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const uploadPoster = async () => {
    if (!eventPoster) return "";

    const fileExt = eventPoster.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `events/${fileName}`;

    const { error } = await supabase.storage
      .from("event-posters")
      .upload(filePath, eventPoster);

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("event-posters")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      const uploadedPosterUrl = await uploadPoster();

      const data = await createEvent(token, {
        title,
        event_date: eventDate,
        event_time: eventTime,
        venue,
        description,
        available_slots: availableSlots ? Number(availableSlots) : 0,
        speaker,
        image_url: uploadedPosterUrl,
        zoom_link: zoomLink,
      });

      setSuccess(data.message || "Event created successfully");

      setTitle("");
      setEventDate("");
      setEventTime("");
      setVenue("");
      setDescription("");
      setAvailableSlots("");
      setSpeaker("");
      setZoomLink("");
      setEventPoster(null);
      setPosterPreview("");
    } catch (e) {
      setErr(e.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Create Event" subtitle="Alumni and admins can add events">
      <form onSubmit={handleSubmit} style={card}>
        <div style={posterUploadRow}>
          <div style={posterPreviewBox}>
            {posterPreview ? (
              <img
                src={posterPreview}
                alt="Event poster preview"
                style={posterImg}
              />
            ) : (
              <span style={posterPlaceholder}>E</span>
            )}
          </div>

          <div>
            <h3 style={posterTitle}>Event Poster</h3>
            <p style={posterText}>Upload a poster image for this event.</p>
            <input
              type="file"
              accept="image/*"
              onChange={handlePosterChange}
              style={input}
            />
          </div>
        </div>

        <div style={grid}>
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={input}
            />
          </Field>

          <Field label="Speaker">
            <input
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              placeholder="Speaker name"
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

          <Field label="Zoom Link">
            <input
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="For online events"
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

const posterUploadRow = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  marginBottom: 28,
};

const posterPreviewBox = {
  width: 100,
  height: 100,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0,
};

const posterImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const posterPlaceholder = {
  fontSize: 34,
  color: "#111111",
};

const posterTitle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 500,
};

const posterText = {
  margin: "6px 0 10px",
  fontSize: 14,
  color: "rgba(17,17,17,0.56)",
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
  fontFamily: '"Google Sans"',
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
  fontFamily: '"Google Sans"',
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