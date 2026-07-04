import { useState } from "react";
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
    <main className="createEventPage">
      <style>{css}</style>
      <section className="createEventShell">
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

        <button type="submit" disabled={loading} className="createEventButton">
          {loading ? "Creating..." : "Create Event"}
        </button>

        {success && <div style={successBox}>{success}</div>}
        {err && <div style={errorBox}>{err}</div>}
      </form>
      </section>
    </main>
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

const css = `
.createEventPage{
  position:relative;
  min-height:100vh;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  padding:24px 22px 34px;
  animation:createEventDissolve .22s ease both;
  overflow-x:hidden;
}

.createEventShell{
  width:min(1340px, 100%);
  margin:0 auto;
  border-radius:22px;
  padding:28px 34px 30px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
  overflow:hidden;
}

.createEventButton{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  margin-top:4px;
  padding:0 12px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-family:"Google Sans";
  font-size:13px;
  font-weight:500;
  line-height:1;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease, opacity .18s ease;
}

.createEventButton:hover:not(:disabled){
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

.createEventButton:disabled{
  opacity:.68;
  cursor:not-allowed;
}

@keyframes createEventDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:720px){
  .createEventPage{ padding:10px 14px 36px; }
  .createEventShell{ border-radius:18px; padding:20px 14px 24px; }
}
`;

const card = {
  padding: 0,
  maxWidth: 920,
};

const posterUploadRow = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  marginBottom: 28,
};

const posterPreviewBox = {
  width: 132,
  aspectRatio: "1054 / 1492",
  borderRadius: 10,
  background: "#f3f5f8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0,
};

const posterImg = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
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
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.05)",
  background: "#f3f5f8",
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
