import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { CalendarDays, Clock3, Ellipsis, GraduationCap, ImagePlus, Loader2, MapPin, Presentation, Trophy, Upload, Users, Wrench, X } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import { getEventById, updateEvent } from "../api";
import { supabase } from "../supabase";
import { getEventDateValue } from "../utils/dateTime";

const EVENT_TYPES = {
  lecture: { name: "Lecture", Icon: GraduationCap, dynamicLabel: "Speaker", placeholder: "Speaker name", venueLabel: "Venue", extras: ["organization"] },
  workshop: { name: "Workshop", Icon: Wrench, dynamicLabel: "Instructor / Trainer", placeholder: "Instructor or trainer name", venueLabel: "Venue / Zoom Link", extras: ["organization", "zoom_link", "duration", "application_link"] },
  conference: { name: "Conference", Icon: Presentation, dynamicLabel: "Host Organization", placeholder: "Hosting organization", venueLabel: "Venue", extras: ["keynote_speaker", "registration_deadline", "application_link"] },
  competition: { name: "Competition", Icon: Trophy, dynamicLabel: "Organizer", placeholder: "Organizer name", venueLabel: "Venue", extras: ["team_size", "registration_deadline", "prize_pool", "application_link"] },
  other: { name: "Other", Icon: Ellipsis, dynamicLabel: "Organizer", placeholder: "Organizer name", venueLabel: "Venue / Location", extras: [] },
};

const EMPTY_DETAILS = { organization: "", keynote_speaker: "", duration: "", team_size: "", registration_deadline: "", prize_pool: "", application_link: "" };
const EMPTY_FORM = { title: "", event_date: "", event_time: "", ending_time: "", event_type: "", venue: "", description: "", available_slots: "", speaker: "", zoom_link: "", image_url: "", event_details: EMPTY_DETAILS };

export default function EditEvent() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  let role = "";
  try { role = token ? jwtDecode(token).role : ""; } catch { role = ""; }
  const cancelPath = ["university_admin", "system_admin"].includes(role) ? "/admin-events" : "/my-created-events";
  const [form, setForm] = useState(EMPTY_FORM);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [poster, setPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getEventById(token, id).then((event) => {
      const savedDetails = event.event_details || {};
      setForm({
        title: event.title || "", event_date: getEventDateValue(event.event_date),
        event_time: event.event_time?.slice(0, 5) || "", ending_time: event.ending_time?.slice(0, 5) || "",
        event_type: event.event_type || "", venue: event.venue || "", description: event.description || "",
        available_slots: String(event.available_slots ?? 0), speaker: event.speaker || "", zoom_link: event.zoom_link || "",
        image_url: event.image_url || "", event_details: { ...EMPTY_DETAILS, ...savedDetails },
      });
      setRegisteredCount(Number(event.registered_count || 0));
      setPosterPreview(event.image_url || "");
    }).catch((e) => setErr(e.message || "Failed to load event")).finally(() => setLoading(false));
  }, [id, token]);

  useEffect(() => {
    if (form.event_type !== "workshop") return;
    const duration = calculateDuration(form.event_time, form.ending_time);
    setForm((current) => current.event_details.duration === duration ? current : { ...current, event_details: { ...current.event_details, duration } });
  }, [form.event_type, form.event_time, form.ending_time]);

  const setField = (name, value) => setForm((current) => ({ ...current, [name]: value }));
  const setDetail = (name, value) => setForm((current) => ({ ...current, event_details: { ...current.event_details, [name]: value } }));
  const typeConfig = EVENT_TYPES[form.event_type];

  const handlePosterChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setPoster(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const removePoster = () => { setPoster(null); setPosterPreview(""); setField("image_url", ""); };
  const uploadPoster = async () => {
    if (!poster) return form.image_url;
    const extension = poster.name.split(".").pop();
    const filePath = `events/${Date.now()}-${Math.random()}.${extension}`;
    const { error } = await supabase.storage.from("event-posters").upload(filePath, poster);
    if (error) throw new Error(error.message);
    return supabase.storage.from("event-posters").getPublicUrl(filePath).data.publicUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.event_type) { setErr("Please select an event type"); return; }
    setSaving(true); setErr(""); setSuccess("");
    try {
      const imageUrl = await uploadPoster();
      const payload = {
        ...form, image_url: imageUrl, available_slots: Number(form.available_slots) || 0,
        ending_time: ["lecture", "workshop", "conference"].includes(form.event_type) ? form.ending_time || null : null,
        zoom_link: typeConfig.extras.includes("zoom_link") ? form.zoom_link : "",
        event_details: Object.fromEntries(Object.entries(form.event_details).filter(([, value]) => String(value).trim())),
      };
      const data = await updateEvent(token, id, payload);
      setField("image_url", imageUrl);
      setSuccess(data.message || "Event updated successfully");
    } catch (e) { setErr(e.message || "Failed to update event"); } finally { setSaving(false); }
  };

  if (loading) return <LoadingScreen text="Loading event..." />;
  if (err && !form.title) return <main className="editEventPage"><style>{css}</style><div className="editNotice error">{err}</div></main>;

  return <main className="editEventPage"><style>{css}</style>
    <form onSubmit={handleSubmit} className="editEventLayout">
      <div className="editEventMain">
        <section className="formCard">
          <div className="sectionHeading"><span>01</span><div><h2>What are you planning?</h2><p>Select the event type before editing its details.</p></div></div>
          <div className="eventTypeGrid" role="radiogroup" aria-label="Event type">
            {Object.entries(EVENT_TYPES).map(([value, option]) => { const Icon = option.Icon; const selected = form.event_type === value; return <button key={value} type="button" role="radio" aria-checked={selected} className={`eventTypeCard${selected ? " selected" : ""}`} onClick={() => setField("event_type", value)}><Icon size={14} /><strong>{option.name}</strong></button>; })}
          </div>
        </section>
        <section className="formCard">
          <div className="sectionHeading"><span>02</span><div><h2>Update the event details</h2><p>{form.event_type ? "Existing information is filled in. Complete or revise any fields below." : "Choose an event type above to continue."}</p></div></div>
          <fieldset disabled={!form.event_type}>
            <div className="fieldGrid">
              <Field label="Event title" full><input value={form.title} onChange={(e) => setField("title", e.target.value)} required /></Field>
              <Field label={`${typeConfig?.dynamicLabel || "Speaker / Organizer"} *`}><input value={form.speaker} onChange={(e) => setField("speaker", e.target.value)} placeholder={typeConfig?.placeholder} required /></Field>
              {typeConfig?.extras.includes("organization") && <Field label={form.event_type === "lecture" ? "Organization / Department" : "Organization"}><input value={form.event_details.organization} onChange={(e) => setDetail("organization", e.target.value)} /></Field>}
              {typeConfig?.extras.includes("keynote_speaker") && <Field label="Chief Guest / Keynote Speaker"><input value={form.event_details.keynote_speaker} onChange={(e) => setDetail("keynote_speaker", e.target.value)} /></Field>}
              <Field label={typeConfig?.venueLabel || "Venue"}><input value={form.venue} onChange={(e) => setField("venue", e.target.value)} required /></Field>
              {typeConfig?.extras.includes("zoom_link") && <Field label="Zoom Link (optional)"><input type="url" value={form.zoom_link} onChange={(e) => setField("zoom_link", e.target.value)} /></Field>}
              <Field label="Date"><input type="date" value={form.event_date} onChange={(e) => setField("event_date", e.target.value)} required /></Field>
              <Field label={["lecture", "workshop", "conference"].includes(form.event_type) ? "Starting Time" : "Time"}><input type="time" value={form.event_time} onChange={(e) => setField("event_time", e.target.value)} required /></Field>
              {["lecture", "workshop", "conference"].includes(form.event_type) && <Field label="Ending Time (optional)"><input type="time" min={form.event_time || undefined} value={form.ending_time} onChange={(e) => setField("ending_time", e.target.value)} /></Field>}
              {typeConfig?.extras.includes("duration") && <Field label="Duration (automatic)"><input value={form.event_details.duration} readOnly /></Field>}
              {typeConfig?.extras.includes("team_size") && <Field label="Team Size"><input type="number" min="1" value={form.event_details.team_size} onChange={(e) => setDetail("team_size", e.target.value)} /></Field>}
              {typeConfig?.extras.includes("registration_deadline") && <Field label="Registration Deadline"><input type="datetime-local" value={form.event_details.registration_deadline} onChange={(e) => setDetail("registration_deadline", e.target.value)} required /></Field>}
              {typeConfig?.extras.includes("application_link") && <Field label="To apply or participation"><input type="url" value={form.event_details.application_link} onChange={(e) => setDetail("application_link", e.target.value)} /></Field>}
              {typeConfig?.extras.includes("prize_pool") && <Field label="Prize Pool / Awards"><input value={form.event_details.prize_pool} onChange={(e) => setDetail("prize_pool", e.target.value)} /></Field>}
              <Field label={`Available Slots (${registeredCount} registered)`}><input type="number" min={registeredCount} value={form.available_slots} onChange={(e) => setField("available_slots", e.target.value)} required /></Field>
              <Field label="Description" full><textarea value={form.description} onChange={(e) => setField("description", e.target.value)} /></Field>
            </div>
          </fieldset>
        </section>
      </div>
      <aside className="editEventSidebar">
        <section className="posterCard"><div className="posterHeading"><span>Event poster</span><small>Optional</small></div><label className={`posterDropzone${posterPreview ? " hasImage" : ""}`}>{posterPreview ? <img src={posterPreview} alt="Event poster preview" /> : <><ImagePlus size={23} /><strong>Upload a poster</strong><small>PNG, JPG or WEBP</small></>}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePosterChange} /></label>{posterPreview && <button className="posterFile" type="button" onClick={removePoster}>{poster ? <Upload size={14} /> : null}<span>{poster?.name || "Current poster"}</span><X size={14} /></button>}</section>
        <section className="eventSummary"><p>Event preview</p><h3>{form.title || "Your event title"}</h3><div><CalendarDays size={15}/><span>{form.event_date || "Date not set"}</span></div><div><Clock3 size={15}/><span>{form.event_time || "Time not set"}</span></div><div><MapPin size={15}/><span>{form.venue || "Venue not set"}</span></div><div><Users size={15}/><span>{form.available_slots || "0"} available slots</span></div></section>
        {(success || err) && <div className={`editNotice ${success ? "success" : "error"}`}>{success || err}</div>}
        <button type="submit" disabled={saving || !form.event_type} className="saveButton">{saving && <Loader2 size={15} className="spin" />}{saving ? "Saving..." : "Save Changes"}</button>
        <Link to={cancelPath} className="cancelLink">Cancel</Link>
      </aside>
    </form>
  </main>;
}

function Field({ label, children, full = false }) { return <div className={`formField${full ? " full" : ""}`}><label>{label}</label>{children}</div>; }
function calculateDuration(start, end) { if (!start || !end) return ""; const [sh, sm] = start.split(":").map(Number); const [eh, em] = end.split(":").map(Number); const mins = eh * 60 + em - (sh * 60 + sm); if (mins <= 0) return ""; const h = Math.floor(mins / 60), m = mins % 60; return [h ? `${h} hour${h === 1 ? "" : "s"}` : "", m ? `${m} minute${m === 1 ? "" : "s"}` : ""].filter(Boolean).join(" "); }

const css = `
.editEventPage{min-height:100vh;color:#111;font-family:"Google Sans";padding:34px 22px;width:min(1340px,calc(100% - 44px));margin:0 auto;background:#fff;border:1px solid rgba(255,255,255,.84);border-radius:22px;box-shadow:0 28px 72px rgba(0,0,0,.22);overflow:hidden}
.editEventLayout{display:grid;grid-template-columns:minmax(0,1fr) 290px;align-items:start;gap:28px;padding:0 12px 18px}.editEventMain{display:grid;gap:22px}.formCard+.formCard{padding-top:24px;border-top:1px solid rgba(0,0,0,.07)}
.sectionHeading{display:flex;gap:12px;margin-bottom:22px}.sectionHeading>span{display:grid;place-items:center;width:28px;height:28px;flex:none;border-radius:8px;background:#eef1f4;color:#777;font-size:11px}.sectionHeading h2{margin:0;font-size:17px}.sectionHeading p{margin:4px 0 0;color:#78807d;font-size:12px}
.eventTypeGrid{display:flex;gap:3px;padding:4px;border-radius:12px;background:#eceeef;overflow-x:auto}.eventTypeCard{display:inline-flex;flex:1 0 max-content;align-items:center;justify-content:center;gap:7px;min-width:110px;height:38px;padding:0 18px;border:0;border-radius:9px;background:transparent;color:#777}.eventTypeCard.selected{background:#fff;color:#111;box-shadow:0 2px 8px rgba(0,0,0,.1)}.eventTypeCard strong{font-size:12px;font-weight:500}
fieldset{min-width:0;margin:0;padding:0;border:0}fieldset:disabled{opacity:.52}.fieldGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.formField{display:flex;flex-direction:column;gap:7px;min-width:0}.formField.full{grid-column:1/-1}.formField>label{color:#777;font-size:12px}.formField input,.formField textarea{width:100%;box-sizing:border-box;padding:11px 13px;border:1px solid rgba(0,0,0,.06);border-radius:10px;outline:none;background:#f3f5f8;color:#111;font:13px "Google Sans"}.formField input:focus,.formField textarea:focus{border-color:#999;background:#f8f9fa}.formField textarea{min-height:125px;resize:vertical}
.editEventSidebar{position:sticky;top:22px;display:grid;gap:15px}.posterCard,.eventSummary{padding:20px;border:1px solid rgba(0,0,0,.06);border-radius:16px;background:#fafbfc}.posterHeading{display:flex;justify-content:space-between;margin-bottom:14px;font-size:13px;font-weight:600}.posterHeading small{color:#777}.posterDropzone{aspect-ratio:4/4.7;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;overflow:hidden;border:1px dashed #bbb;border-radius:13px;background:#f3f5f8;cursor:pointer;text-align:center}.posterDropzone input{display:none}.posterDropzone.hasImage{padding:0}.posterDropzone img{width:100%;height:100%;object-fit:contain}.posterDropzone strong{font-size:13px}.posterDropzone small{font-size:11px;color:#777}.posterFile{width:100%;display:flex;align-items:center;gap:7px;margin-top:10px;padding:8px;border:0;border-radius:8px;background:#eef1f4}.posterFile span{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}
.eventSummary>p{margin:0 0 9px;color:#777;font-size:11px;text-transform:uppercase}.eventSummary h3{margin:0 0 14px;font-size:15px}.eventSummary div{display:flex;gap:8px;margin-top:8px;color:#666;font-size:12px}.saveButton,.cancelLink{display:flex;align-items:center;justify-content:center;gap:7px;height:40px;border:0;border-radius:10px;font:500 13px "Google Sans";text-decoration:none}.saveButton{background:#111;color:#fff}.saveButton:disabled{opacity:.5}.cancelLink{background:#eef1f4;color:#111}.editNotice{padding:11px;border-radius:10px;font-size:12px}.editNotice.success{background:#dcfce7;color:#166534}.editNotice.error{background:#fee2e2;color:#991b1b}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:900px){.editEventLayout{grid-template-columns:1fr}.editEventSidebar{position:static;grid-template-columns:repeat(2,1fr)}.saveButton,.cancelLink,.editNotice{grid-column:1/-1}}@media(max-width:600px){.editEventPage{width:calc(100% - 28px);padding:20px 14px}.editEventLayout{padding:0}.fieldGrid,.editEventSidebar{grid-template-columns:1fr}.eventTypeCard{flex:0 0 auto}}
`;
