import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LoadingScreen from "../components/LoadingScreen";
import { getEventById, updateEvent } from "../api";
import { supabase } from "../supabase";
import { getEventDateValue } from "../utils/dateTime";

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
    ending_time: "",
    event_type: "other",
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
          event_date: getEventDateValue(event.event_date),
          event_time: event.event_time ? event.event_time.slice(0, 5) : "",
          ending_time: event.ending_time ? event.ending_time.slice(0, 5) : "",
          event_type: event.event_type || "other",
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
      <main className="editEventPage">
        <style>{css}</style>
        <section className="editEventShell">
          <div style={errorBox}>{err}</div>
        </section>
      </main>
    );
  }

  return (
    <main className="editEventPage">
      <style>{css}</style>
      <section className="editEventShell">
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
          <Field label={["lecture", "workshop", "conference"].includes(form.event_type) ? "Starting Time" : "Time"}>
            <input type="time" value={form.event_time} onChange={(e) => setField("event_time", e.target.value)} required style={input} />
          </Field>
          {["lecture", "workshop", "conference"].includes(form.event_type) && (
            <Field label="Ending Time (optional)">
              <input type="time" min={form.event_time || undefined} value={form.ending_time} onChange={(e) => setField("ending_time", e.target.value)} style={input} />
            </Field>
          )}
          <Field label={`Available Slots (${registeredCount} already registered)`}>
            <input type="number" min={registeredCount} value={form.available_slots} onChange={(e) => setField("available_slots", e.target.value)} required style={input} />
          </Field>
        </div>

        <Field label="Description">
          <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} style={textarea} />
        </Field>

        <div style={actions}>
          <button type="submit" disabled={saving} className="editEventButton">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link to={cancelPath} className="editEventCancel">Cancel</Link>
        </div>
        {success && <div style={successBox}>{success}</div>}
        {err && <div style={errorBox}>{err}</div>}
      </form>
      </section>
    </main>
  );
}

function Field({ label, children }) {
  return <div style={field}><label style={labelStyle}>{label}</label>{children}</div>;
}

const css = `
.editEventPage{
  position:relative;
  min-height:100vh;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  padding:24px 22px 34px;
  animation:editEventDissolve .22s ease both;
  overflow-x:hidden;
}

.editEventShell{
  width:min(1340px, 100%);
  margin:0 auto;
  border-radius:22px;
  padding:28px 34px 30px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
  overflow:hidden;
}

.editEventButton,
.editEventCancel{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  padding:0 12px;
  border-radius:999px;
  font-family:"Google Sans";
  font-size:13px;
  font-weight:500;
  line-height:1;
  text-decoration:none;
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease, opacity .18s ease;
}

.editEventButton{
  background:#050505;
  color:#ffffff;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
}

.editEventButton:hover:not(:disabled){
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

.editEventButton:disabled{
  opacity:.68;
  cursor:not-allowed;
}

.editEventCancel{
  background:#ffffff;
  color:#111111;
  box-shadow:0 10px 24px rgba(0,0,0,.14), 0 2px 7px rgba(0,0,0,.06);
}

.editEventCancel:hover{
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

@keyframes editEventDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:720px){
  .editEventPage{ padding:10px 14px 36px; }
  .editEventShell{ border-radius:18px; padding:20px 14px 24px; }
}
`;

const card = { padding: 0, maxWidth: 920 };
const posterRow = { display: "flex", alignItems: "center", gap: 24, marginBottom: 28 };
const posterBox = { width: 132, aspectRatio: "1054 / 1492", borderRadius: 10, background: "#f3f5f8", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 };
const posterImg = { width: "100%", height: "100%", objectFit: "contain" };
const posterPlaceholder = { fontSize: 34 };
const posterTitle = { margin: 0, fontSize: 16 };
const posterText = { margin: "6px 0 10px", fontSize: 14, color: "rgba(17,17,17,0.56)" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 };
const field = { display: "grid", gap: 6, marginBottom: 14 };
const labelStyle = { fontSize: 13, color: "rgba(17,17,17,0.62)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.05)", background: "#f3f5f8", color: "#111", fontSize: 14, fontFamily: '"Google Sans"', outline: "none", boxSizing: "border-box" };
const textarea = { ...input, minHeight: 120, resize: "vertical" };
const actions = { display: "flex", alignItems: "center", gap: 12, marginTop: 4 };
const successBox = { background: "#dcfce7", padding: 12, borderRadius: 12, marginTop: 14 };
const errorBox = { background: "#fee2e2", padding: 12, borderRadius: 12, marginTop: 14 };
