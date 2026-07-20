import { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Ellipsis,
  GraduationCap,
  ImagePlus,
  Loader2,
  MapPin,
  Presentation,
  Trophy,
  Upload,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { createEvent } from "../api";
import { supabase } from "../supabase";

const EVENT_TYPES = {
  lecture: {
    name: "Lecture",
    Icon: GraduationCap,
    dynamicLabel: "Speaker",
    dynamicPlaceholder: "Speaker name",
    venueLabel: "Venue",
    extras: ["organization"],
  },
  workshop: {
    name: "Workshop",
    Icon: Wrench,
    dynamicLabel: "Instructor / Trainer",
    dynamicPlaceholder: "Instructor or trainer name",
    venueLabel: "Venue / Zoom Link",
    extras: ["organization", "zoom_link", "duration", "application_link"],
  },
  conference: {
    name: "Conference",
    Icon: Presentation,
    dynamicLabel: "Host Organization",
    dynamicPlaceholder: "Hosting organization",
    venueLabel: "Venue",
    extras: ["keynote_speaker", "registration_deadline", "application_link"],
  },
  competition: {
    name: "Competition",
    Icon: Trophy,
    dynamicLabel: "Organizer",
    dynamicPlaceholder: "Organizer name",
    venueLabel: "Venue",
    extras: ["team_size", "registration_deadline", "prize_pool", "application_link"],
  },
  other: {
    name: "Other",
    Icon: Ellipsis,
    dynamicLabel: "Organizer",
    dynamicPlaceholder: "Organizer name",
    venueLabel: "Venue / Location",
    extras: [],
  },
};

const EMPTY_DETAILS = {
  organization: "",
  keynote_speaker: "",
  duration: "",
  team_size: "",
  registration_deadline: "",
  prize_pool: "",
  application_link: "",
};

export default function CreateEvent() {
  const token = localStorage.getItem("token");

  const [eventType, setEventType] = useState("");
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [endingTime, setEndingTime] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [availableSlots, setAvailableSlots] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [zoomLink, setZoomLink] = useState("");
  const [details, setDetails] = useState(EMPTY_DETAILS);

  const [eventPoster, setEventPoster] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (eventType !== "workshop") return;
    const duration = calculateDuration(eventTime, endingTime);
    setDetails((current) =>
      current.duration === duration ? current : { ...current, duration }
    );
  }, [eventType, eventTime, endingTime]);

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
    if (!eventType) {
      setErr("Please select an event type");
      return;
    }
    setLoading(true);
    setErr("");
    setSuccess("");

    try {
      const uploadedPosterUrl = await uploadPoster();

      const data = await createEvent(token, {
        event_type: eventType,
        title,
        event_date: eventDate,
        event_time: eventTime,
        ending_time: ["lecture", "workshop", "conference"].includes(eventType)
          ? endingTime || null
          : null,
        venue,
        description,
        available_slots: availableSlots ? Number(availableSlots) : 0,
        speaker,
        image_url: uploadedPosterUrl,
        zoom_link: zoomLink,
        event_details: Object.fromEntries(
          Object.entries(details).filter(([, value]) => String(value).trim())
        ),
      });

      setSuccess(data.message || "Event created successfully");

      setTitle("");
      setEventType("");
      setEventDate("");
      setEventTime("");
      setEndingTime("");
      setVenue("");
      setDescription("");
      setAvailableSlots("");
      setSpeaker("");
      setZoomLink("");
      setDetails(EMPTY_DETAILS);
      setEventPoster(null);
      setPosterPreview("");
    } catch (e) {
      setErr(e.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const removePoster = () => {
    if (posterPreview) URL.revokeObjectURL(posterPreview);
    setEventPoster(null);
    setPosterPreview("");
  };

  const typeConfig = EVENT_TYPES[eventType];
  const setDetail = (name, value) => {
    setDetails((current) => ({ ...current, [name]: value }));
  };

  return (
    <main className="createEventPage">
      <style>{css}</style>
      <form onSubmit={handleSubmit} className="createEventLayout">
        <div className="createEventMain">
          <section className="formCard">
            <div className="sectionHeading">
              <span>01</span>
              <div><h2>What are you planning?</h2><p>Choose the event format that fits best.</p></div>
            </div>
            <div className="eventTypeGrid" role="radiogroup" aria-label="Event type">
          {Object.entries(EVENT_TYPES).map(([value, option]) => {
            const TypeIcon = option.Icon;
            const selected = eventType === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`eventTypeCard${selected ? " selected" : ""}`}
                onClick={() => setEventType(value)}
              >
                <span className="typeIcon"><TypeIcon size={14} strokeWidth={1.9} /></span>
                <strong>{option.name}</strong>
              </button>
            );
          })}
            </div>
          </section>

          <section className="formCard">
            <div className="sectionHeading">
              <span>02</span>
              <div>
                <h2>Tell us about the event</h2>
                <p>{eventType ? "Add the information attendees need to know." : "Choose an event type above to continue."}</p>
              </div>
            </div>
            <fieldset className="eventDetailsFieldset" disabled={!eventType}>
              <div className="fieldGrid">
          <Field label="Event title" full>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your event a clear, memorable name"
              required
            />
          </Field>

          <Field label={`${typeConfig?.dynamicLabel || "Speaker / Organizer"} *`}>
            <input
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              placeholder={typeConfig?.dynamicPlaceholder || "Select an event type first"}
              required
            />
          </Field>

          {typeConfig?.extras.includes("organization") && (
            <Field label={eventType === "lecture" ? "Organization / Department" : "Organization"}>
              <input value={details.organization} onChange={(e) => setDetail("organization", e.target.value)} placeholder="Organization name" />
            </Field>
          )}

          {typeConfig?.extras.includes("keynote_speaker") && (
            <Field label="Chief Guest / Keynote Speaker">
              <input value={details.keynote_speaker} onChange={(e) => setDetail("keynote_speaker", e.target.value)} placeholder="Guest or keynote speaker" />
            </Field>
          )}

          <Field label={typeConfig?.venueLabel || "Venue"}>
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Where will the event take place?"
              required
            />
          </Field>

          {typeConfig?.extras.includes("zoom_link") && <Field label="Zoom Link (optional)">
            <input
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="For online events"
            />
          </Field>}

          <Field label="Date">
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
            />
          </Field>

          <Field label={["lecture", "workshop", "conference"].includes(eventType) ? "Starting Time" : "Time"}>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              required
            />
          </Field>

          {["lecture", "workshop", "conference"].includes(eventType) && (
            <Field label="Ending Time (optional)">
              <input
                type="time"
                value={endingTime}
                min={eventTime || undefined}
                onChange={(e) => setEndingTime(e.target.value)}
              />
            </Field>
          )}

          {typeConfig?.extras.includes("duration") && (
            <Field label="Duration (automatic)">
              <input value={details.duration} readOnly placeholder="Set starting and ending times" />
            </Field>
          )}

          {typeConfig?.extras.includes("team_size") && (
            <Field label="Team Size">
              <input type="number" min="1" value={details.team_size} onChange={(e) => setDetail("team_size", e.target.value)} placeholder="Members per team" />
            </Field>
          )}

          {typeConfig?.extras.includes("registration_deadline") && (
            <Field label="Registration Deadline">
              <input type="datetime-local" value={details.registration_deadline} onChange={(e) => setDetail("registration_deadline", e.target.value)} required />
            </Field>
          )}

          {typeConfig?.extras.includes("application_link") && (
            <Field label="To apply or participation">
              <input
                type="url"
                value={details.application_link}
                onChange={(e) => setDetail("application_link", e.target.value)}
                placeholder="Link of application form"
              />
            </Field>
          )}

          {typeConfig?.extras.includes("prize_pool") && (
            <Field label="Prize Pool / Awards">
              <input value={details.prize_pool} onChange={(e) => setDetail("prize_pool", e.target.value)} placeholder="Prize or award details" />
            </Field>
          )}

          <Field label="Available Slots">
            <input
              type="number"
              min="0"
              value={availableSlots}
              onChange={(e) => setAvailableSlots(e.target.value)}
              placeholder="0 for unlimited"
            />
          </Field>
          <Field label="Description" full>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share what attendees can expect, who the event is for, and anything they should bring..."
          />
        </Field>
              </div>
            </fieldset>
          </section>
        </div>

        <aside className="createEventSidebar">
          <section className="posterCard">
            <div className="posterCardHeading"><span>Event poster</span><small>Optional</small></div>
            <label className={`posterDropzone${posterPreview ? " hasImage" : ""}`}>
              {posterPreview ? <img src={posterPreview} alt="Event poster preview" /> : <>
                <span className="uploadIcon"><ImagePlus size={23} /></span>
                <strong>Upload a poster</strong>
                <small>PNG, JPG or WEBP<br />Portrait works best</small>
              </>}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePosterChange} />
            </label>
            {eventPoster && <div className="posterFile"><Upload size={14} /><span>{eventPoster.name}</span><button type="button" onClick={removePoster} aria-label="Remove poster"><X size={14} /></button></div>}
          </section>

          <section className="eventSummary">
            <p>Event preview</p>
            <h3>{title || "Your event title"}</h3>
            <div><CalendarDays size={15} /><span>{eventDate || "Date not set"}</span></div>
            <div><Clock3 size={15} /><span>{eventTime ? `${eventTime}${endingTime ? ` – ${endingTime}` : ""}` : "Time not set"}</span></div>
            <div><MapPin size={15} /><span>{venue || "Venue not set"}</span></div>
            <div><Users size={15} /><span>{availableSlots ? `${availableSlots} available slots` : "Unlimited attendance"}</span></div>
          </section>

          {(success || err) && <div className={`formNotice ${success ? "success" : "error"}`} role="status">{success || err}</div>}

          <button type="submit" disabled={loading || !eventType} className="createEventButton">
            {loading && <Loader2 size={15} className="spin" />}
            {loading ? "Creating event..." : "Create Event"}
            {!loading && <ArrowRight size={16} />}
          </button>
          <p className="approvalNote">Your event will be visible after admin approval.</p>
        </aside>
      </form>
    </main>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div className={`formField${full ? " full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return "";
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [
    hours ? `${hours} hour${hours === 1 ? "" : "s"}` : "",
    remainder ? `${remainder} minute${remainder === 1 ? "" : "s"}` : "",
  ].filter(Boolean).join(" ");
}

const css = `
.createEventPage{
  min-height:100vh; color:#111; font-family:"Google Sans"; padding:34px 22px;
  animation:createEventDissolve .22s ease both;
  width:min(1340px,calc(100% - 44px)); margin:0 auto; background:#fff; border:1px solid rgba(255,255,255,.84); border-radius:22px; box-shadow:0 28px 72px rgba(0,0,0,.22); overflow:hidden;
}
.createEventHero{ display:flex; align-items:center; justify-content:space-between; gap:22px; margin:-12px -22px 28px; padding:30px 34px 28px; background:#fafbfc; border-bottom:1px solid rgba(0,0,0,.06); }
.createEventTitle{ display:flex; align-items:center; gap:14px; }
.createEventTitle > span{ width:46px; height:46px; display:grid; place-items:center; border-radius:13px; background:#111; color:#fff; }
.createEventHero h1{ margin:0; font-size:22px; font-weight:600; letter-spacing:-.25px; }
.createEventHero .createEventTitle p{ margin:4px 0 0; color:rgba(17,17,17,.52); font-size:13px; }
.heroNote{ color:#c73434; font-size:13px; text-align:right; }
.createEventLayout{ display:grid; grid-template-columns:minmax(0,1fr) 290px; align-items:start; gap:28px; padding:0 12px 18px; }
.createEventMain{ display:grid; gap:22px; }
.formCard{ padding:0; }
.formCard + .formCard{ padding-top:24px; border-top:1px solid rgba(0,0,0,.07); }
.posterCard,.eventSummary{ padding:20px; border:1px solid rgba(0,0,0,.06); border-radius:16px; background:#fafbfc; }
.sectionHeading{ display:flex; align-items:flex-start; gap:12px; margin-bottom:22px; }
.sectionHeading > span{
  display:grid; place-items:center; width:28px; height:28px; flex:0 0 auto; border-radius:8px; background:#eef1f4; color:rgba(17,17,17,.58); font-size:11px; font-weight:600;
}
.sectionHeading h2{ margin:0; font-size:17px; font-weight:650; letter-spacing:-.15px; }
.sectionHeading p{ margin:4px 0 0; color:rgba(22,33,30,.48); font-size:12px; }
.eventTypeGrid{ display:flex; align-items:center; gap:3px; width:100%; padding:4px; border-radius:12px; background:#eceeef; overflow-x:auto; scrollbar-width:none; box-shadow:inset 0 0 0 1px rgba(0,0,0,.025); }
.eventTypeGrid::-webkit-scrollbar{ display:none; }
.eventTypeCard{ display:inline-flex; flex:1 0 max-content; align-items:center; justify-content:center; gap:7px; min-width:110px; height:38px; padding:0 18px; border:0; border-radius:9px; background:transparent; color:rgba(17,17,17,.48); white-space:nowrap; transition:background .18s ease,box-shadow .18s ease,color .18s ease; }
.eventTypeCard:hover{ color:#111; background:rgba(255,255,255,.42); }
.eventTypeCard.selected{ background:#fff; color:#111; box-shadow:0 2px 8px rgba(0,0,0,.10),0 0 0 1px rgba(0,0,0,.025); }
.eventTypeCard strong{ color:inherit; font-size:12px; font-weight:500; }
.typeIcon{ display:grid; place-items:center; }
.fieldGrid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
.eventDetailsFieldset{ min-width:0; margin:0; padding:0; border:0; }
.eventDetailsFieldset:disabled{ opacity:.52; }
.eventDetailsFieldset:disabled input,.eventDetailsFieldset:disabled textarea{ cursor:not-allowed; }
.formField{ display:flex; flex-direction:column; gap:7px; min-width:0; }
.formField.full{ grid-column:1/-1; }
.formField > label{ color:rgba(17,17,17,.55); font-size:12px; font-weight:400; }
.formField input,.formField textarea{ width:100%; padding:11px 13px; border:1px solid rgba(0,0,0,.06); border-radius:10px; outline:none; background:#f3f5f8; color:#111; font-size:13px; transition:.18s ease; }
.formField input:focus,.formField textarea:focus{ border-color:rgba(0,0,0,.24); background:#f8f9fa; box-shadow:0 0 0 3px rgba(0,0,0,.04); }
.formField input[readonly]{ color:rgba(17,17,17,.62); cursor:default; }
.formField input::placeholder,.formField textarea::placeholder{ color:rgba(22,33,30,.34); }
.formField textarea{ min-height:125px; resize:vertical; line-height:1.5; }
.createEventSidebar{ position:sticky; top:22px; display:grid; gap:15px; }
.posterCardHeading{ display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; font-size:13px; font-weight:600; }
.posterCardHeading small{ padding:4px 8px; border-radius:20px; background:#f1f4f3; color:rgba(22,33,30,.45); font-size:10px; }
.posterDropzone{ aspect-ratio:4/4.7; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; overflow:hidden; border:1px dashed rgba(0,0,0,.18); border-radius:13px; background:#f3f5f8; cursor:pointer; text-align:center; transition:.18s ease; }
.posterDropzone:hover{ border-color:rgba(0,0,0,.35); background:#eef1f4; }
.posterDropzone input{ display:none; }
.posterDropzone img{ width:100%; height:100%; object-fit:cover; }
.posterDropzone strong{ font-size:12px; }
.posterDropzone small{ color:rgba(22,33,30,.42); font-size:10px; line-height:1.5; }
.uploadIcon{ display:grid; place-items:center; width:44px; height:44px; border-radius:13px; background:white; color:#111; box-shadow:0 5px 16px rgba(0,0,0,.08); }
.posterFile{ display:flex; align-items:center; gap:7px; margin-top:10px; color:rgba(22,33,30,.56); font-size:10px; }
.posterFile span{ min-width:0; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.posterFile button{ display:grid; place-items:center; padding:4px; border-radius:6px; color:#8c4d4d; }
.eventSummary{ display:grid; gap:11px; }
.eventSummary > p{ color:rgba(17,17,17,.48); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.08em; }
.eventSummary h3{ margin-bottom:3px; font-size:15px; overflow-wrap:anywhere; }
.eventSummary div{ display:flex; align-items:center; gap:9px; color:rgba(22,33,30,.53); font-size:11px; }
.eventSummary svg{ flex:0 0 auto; color:#111; }
.createEventButton{
  width:100%; display:flex; align-items:center; justify-content:center; gap:8px; height:38px; border-radius:999px; background:#050505; color:#fff; font-size:13px; font-weight:500; box-shadow:0 10px 22px rgba(0,0,0,.12); transition:.18s ease;
}
.spin{ animation:spin .8s linear infinite; }
@keyframes spin{ to{ transform:rotate(360deg); } }
.createEventButton:hover:not(:disabled){ background:#eef1f4; color:#111; transform:translateY(-1px); box-shadow:0 12px 26px rgba(0,0,0,.16); }
.createEventButton:disabled{ opacity:.68; cursor:not-allowed; }
.approvalNote{ margin:0 5px; color:rgba(22,33,30,.42); font-size:10px; text-align:center; }
.formNotice{ padding:11px 13px; border-radius:11px; font-size:11px; line-height:1.4; }
.formNotice.success{ background:#e4f6ed; color:#24634f; }
.formNotice.error{ background:#fceaea; color:#8b3f3f; }
@keyframes createEventDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:900px){
  .createEventLayout{ grid-template-columns:1fr; }
  .createEventSidebar{ position:static; grid-template-columns:minmax(220px,280px) 1fr; align-items:start; }
  .createEventButton,.approvalNote,.formNotice{ grid-column:1/-1; }
}
@media (max-width:720px){
  .createEventPage{ width:calc(100% - 28px); padding:28px 14px; }
  .createEventHero{ margin:-10px -14px 26px; padding:24px 14px 22px; align-items:flex-start; }
  .heroNote{ display:none; }
  .posterCard,.eventSummary{ padding:18px; border-radius:14px; }
  .eventTypeGrid{ display:flex; width:100%; }
  .eventTypeCard{ flex:0 0 auto; }
  .fieldGrid{ grid-template-columns:1fr; }
  .formField.full{ grid-column:auto; }
  .createEventSidebar{ grid-template-columns:1fr; }
  .createEventButton,.approvalNote,.formNotice{ grid-column:auto; }
}
`;
