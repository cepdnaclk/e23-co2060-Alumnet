import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PageShell from "../components/PageShell";
import LoadingScreen from "../components/LoadingScreen";
import { getEventById, updateEvent } from "../api";
import { supabase } from "../supabase";

export default function EditEvent() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  let role = "";
  try {
    role = token ? jwtDecode(token).role : "";
  } catch {
    role = "";
  }
  const cancelPath = ["university_admin", "system_admin"].includes(role)
    ? "/admin-events"
    : "/my-created-events";
  const [form, setForm] = useState({
    title: "",
    event_date: "",
    event_time: "",
    venue: "",
    description: "",
    available_slots: "",
    speaker: "",
    zoom_link: "",
    image_url: "",
  });
  const [registeredCount, setRegisteredCount] = useState(0);
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await getEventById(token, id);
        setForm({
          title: event.title || "",
          event_date: event.event_date ? event.event_date.slice(0, 10) : "",
          event_time: event.event_time ? event.event_time.slice(0, 5) : "",
          venue: event.venue || "",
          description: event.description || "",
          available_slots: String(event.available_slots ?? 0),
          speaker: event.speaker || "",
          zoom_link: event.zoom_link || "",
          image_url: event.image_url || "",
        });
        setRegisteredCount(Number(event.registered_count || 0));
        setPosterPreview(event.image_url || "");
      } catch (e) {
        setErr(e.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, token]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPoster(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const uploadPoster = async () => {
    if (!poster) return form.image_url;

    const extension = poster.name.split(".").pop();
    const filePath = `events/${Date.now()}-${Math.random()}.${extension}`;
    const { error } = await supabase.storage
      .from("event-posters")
      .upload(filePath, poster);

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from("event-posters")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setSuccess("");

    try {
      const imageUrl = await uploadPoster();
      const data = await updateEvent(token, id, {
        ...form,
        available_slots: Number(form.available_slots) || 0,
        image_url: imageUrl,
      });
      setForm((current) => ({ ...current, image_url: imageUrl }));
      setSuccess(data.message || "Event updated successfully");
    } catch (e) {
      setErr(e.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen text="Loading event..." />;

  if (err && !form.title) {
    return (
      <PageShell title="Edit Event" subtitle="Unable to open this event">
        <div style={errorBox}>{err}</div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Edit Event" subtitle="Update event details">
      <form onSubmit={handleSubmit} style={card}>
        <div style={posterRow}>
          <div style={posterBox}>
            {posterPreview ? (
              <img src={posterPreview} alt="Event poster preview" style={posterImg} />
            ) : (
              <span style={posterPlaceholder}>E</span>
            )}
          </div>
          <div>
            <h3 style={posterTitle}>Event Poster</h3>
            <p style={posterText}>Choose a new image only if you want to replace it.</p>
            <input type="file" accept="image/*" onChange={handlePosterChange} style={input} />
          </div>
        </div>

        <div style={grid}>
          <Field label="Title">
            <input value={form.title} onChange={(e) => setField("title", e.target.value)} required style={input} />
          </Field>
          <Field label="Speaker">
            <input value={form.speaker} onChange={(e) => setField("speaker", e.target.value)} style={input} />
          </Field>
          <Field label="Venue">
            <input value={form.venue} onChange={(e) => setField("venue", e.target.value)} required style={input} />
          </Field>
          <Field label="Zoom Link">
            <input type="url" value={form.zoom_link} onChange={(e) => setField("zoom_link", e.target.value)} style={input} />
          </Field>
          <Field label="Date">
            <input type="date" value={form.event_date} onChange={(e) => setField("event_date", e.target.value)} required style={input} />
          </Field>
          <Field label="Time">
            <input type="time" value={form.event_time} onChange={(e) => setField("event_time", e.target.value)} required style={input} />
          </Field>
          <Field label={`Available Slots (${registeredCount} already registered)`}>
            <input type="number" min={registeredCount} value={form.available_slots} onChange={(e) => setField("available_slots", e.target.value)} required style={input} />
          </Field>
        </div>

        <Field label="Description">
          <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} style={textarea} />
        </Field>

        <div style={actions}>
          <button type="submit" disabled={saving} style={button}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link to={cancelPath} style={cancelLink}>Cancel</Link>
        </div>
        {success && <div style={successBox}>{success}</div>}
        {err && <div style={errorBox}>{err}</div>}
      </form>
    </PageShell>
  );
}

function Field({ label, children }) {
  return <div style={field}><label style={labelStyle}>{label}</label>{children}</div>;
}

const card = { padding: 22, borderRadius: 16, background: "rgba(255,255,255,0.75)", border: "1px solid rgba(0,0,0,0.06)", maxWidth: 760 };
const posterRow = { display: "flex", alignItems: "center", gap: 24, marginBottom: 28 };
const posterBox = { width: 100, height: 100, borderRadius: "50%", background: "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 };
const posterImg = { width: "100%", height: "100%", objectFit: "cover" };
const posterPlaceholder = { fontSize: 34 };
const posterTitle = { margin: 0, fontSize: 16 };
const posterText = { margin: "6px 0 10px", fontSize: 14, color: "rgba(17,17,17,0.56)" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 };
const field = { display: "grid", gap: 6, marginBottom: 14 };
const labelStyle = { fontSize: 13, color: "rgba(17,17,17,0.62)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.8)", color: "#111", fontSize: 14, fontFamily: '"Google Sans"', outline: "none", boxSizing: "border-box" };
const textarea = { ...input, minHeight: 120, resize: "vertical" };
const actions = { display: "flex", alignItems: "center", gap: 12, marginTop: 4 };
const button = { padding: "10px 16px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.08)", background: "#111", color: "#fff", fontSize: 14, cursor: "pointer" };
const cancelLink = { padding: "10px 16px", color: "#111", fontSize: 14, textDecoration: "none" };
const successBox = { background: "#dcfce7", padding: 12, borderRadius: 12, marginTop: 14 };
const errorBox = { background: "#fee2e2", padding: 12, borderRadius: 12, marginTop: 14 };
