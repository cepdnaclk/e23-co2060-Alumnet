import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import { getEvents } from "../api";
import dateIcon from "../assets/date.png";
import timeIcon from "../assets/time.png";
import locationIcon from "../assets/location.png";
import { formatEventDate as formatDate, formatEventTime as formatTime, getEventDateValue } from "../utils/dateTime";

export default function Events() {
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [timingFilter, setTimingFilter] = useState("");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [showPast, setShowPast] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getEvents(token);
      setEvents(data);
    } catch (e) {
      setErr(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (loading) return;

    setSearching(true);
    const timeout = window.setTimeout(() => setSearching(false), 180);

    return () => window.clearTimeout(timeout);
  }, [search, timingFilter, categoryFilters, showPast, loading]);

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();
    const matchesDate = showPast
      ? Boolean(event.is_past)
      : matchesTimingFilter(event, timingFilter);
    if (!matchesDate) return false;
    if (!showPast && categoryFilters.length && !categoryFilters.includes(event.event_type)) return false;
    if (!query) return true;

    return [event.title, event.venue, event.created_by_name, event.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <main className="eventsPage">
      <style>{css}</style>

      <section className="eventsShell">
        <div className="eventFilters">
          <label className="eventSearch">
            <Search size={15} strokeWidth={2} />
            <input
              placeholder="Search events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <div className="filterControls">
            <FilterDropdown
              label="Filter by timing"
              options={TIMING_OPTIONS}
              selected={timingFilter}
              onChange={(value) => { setTimingFilter(value); setShowPast(false); }}
              disabled={showPast}
            />
            <FilterDropdown
              label="Filter by category"
              options={CATEGORY_OPTIONS}
              selected={categoryFilters}
              onChange={setCategoryFilters}
              multiple
              disabled={showPast}
            />
            <button
              type="button"
              className={`pastFilter${showPast ? " active" : ""}`}
              onClick={() => setShowPast((current) => !current)}
            >
              Past
            </button>
          </div>
        </div>

        {err && <div className="eventState error">{err}</div>}

        {loading ? (
          <LoadingScreen text="Loading events..." />
        ) : filteredEvents.length === 0 ? (
          <div className="eventState">No approved events yet.</div>
        ) : (
          <div className={`eventList ${searching ? "refreshing" : ""}`}>
            {filteredEvents.map((event) => {
              const registered = Number(event.registered_count || 0);
              const slots = Number(event.available_slots || 0);
              const remaining = Math.max(slots - registered, 0);

              return (
                <article key={event.id} className="eventItem">
                  <div className="eventCardHeader">
                    <div className="eventIdentity">
                      <h2>{event.title}</h2>
                      <p>Hosted by {event.created_by_name || "-"}</p>
                    </div>

                    <div className="eventHeaderActions">
                      <Link
                        to={`/events/${event.id}`}
                        state={{ eventTitle: event.title }}
                        className="viewEventLink"
                      >
                        View Event
                      </Link>
                      {event.is_registered && (
                        <span className="alreadyJoined">Already joined</span>
                      )}
                      {event.is_past && <span className="archivedEvent">Past</span>}
                    </div>
                  </div>

                  <div className="eventContent">
                  <div className="posterColumn">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="eventPoster" />
                    ) : (
                      <div className="eventPoster fallback">
                        {event.title?.slice(0, 1)?.toUpperCase() || "E"}
                      </div>
                    )}
                  </div>

                  <div className="eventBody">
                    <div className="eventMetaLine">
                      <span>
                        <img src={dateIcon} alt="" />
                        {formatDate(event.event_date)}
                      </span>
                      <span>
                        <img src={timeIcon} alt="" />
                        {formatTime(event.event_time)}{event.ending_time ? ` – ${formatTime(event.ending_time)}` : ""}
                      </span>
                      <span>
                        <img src={locationIcon} alt="" />
                        {event.venue || "-"}
                      </span>
                    </div>

                    {event.description && <p className="eventDescription">{event.description}</p>}

                    <div className="eventTags">
                      <span>{registered} / {slots} registered</span>
                      <span className={remaining > 0 ? "slotsOpen" : "slotsFull"}>
                        {remaining > 0 ? `${remaining} slots left` : "Event full"}
                      </span>
                    </div>
                  </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

const TIMING_OPTIONS = [
  { value: "", label: "All upcoming" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const CATEGORY_OPTIONS = [
  { value: "lecture", label: "Lectures" },
  { value: "workshop", label: "Workshops" },
  { value: "conference", label: "Conferences" },
  { value: "competition", label: "Competitions" },
  { value: "other", label: "Other" },
];

function FilterDropdown({ label, options, selected, onChange, disabled = false, multiple = false }) {
  const selectedValues = multiple ? selected : [selected];
  const selectedOption = options.find((option) => option.value === selected);
  const summary = multiple
    ? (selected.length ? `${label} (${selected.length})` : label)
    : (selected ? selectedOption?.label || label : label);
  const selectOption = (value) => {
    if (!multiple) { onChange(value); return; }
    onChange(selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]);
  };

  return (
    <details name="event-filter-dropdown" className={`filterDropdown${disabled ? " disabled" : ""}`}>
      <summary onClick={(event) => disabled && event.preventDefault()} aria-disabled={disabled}>{summary}<ChevronDown size={14} /></summary>
      <div className="filterMenu">
        {options.map((option) => (
          <label key={option.value}>
            <input type={multiple ? "checkbox" : "radio"} name={label} checked={selectedValues.includes(option.value)} onChange={() => selectOption(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

function matchesTimingFilter(event, filter) {
  if (event.is_past) return false;
  if (!filter) return true;
  const date = event.event_date;
  if (!date) return false;

  const [year, month, day] = getEventDateValue(date).split("-").map(Number);
  const eventDate = startOfDay(new Date(year, month - 1, day));
  if (Number.isNaN(eventDate.getTime())) return false;

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  if (filter === "today") return isSameDay(eventDate, today);
  if (filter === "tomorrow") return isSameDay(eventDate, tomorrow);

  if (filter === "week") {
    const weekStart = startOfWeek(today);
    const weekEnd = addDays(weekStart, 7);
    return eventDate >= weekStart && eventDate < weekEnd;
  }

  if (filter === "month") {
    return eventDate.getFullYear() === today.getFullYear() && eventDate.getMonth() === today.getMonth();
  }

  return false;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

const css = `
.eventsPage{
  position:relative;
  min-height:100vh;
  background:transparent;
  color:#111111;
  font-family:"Google Sans";
  padding:24px 22px 34px;
  animation:eventsDissolve .22s ease both;
  overflow-x:hidden;
}

.eventsShell{
  width:min(1340px, 100%);
  margin:0 auto;
  border-radius:22px;
  padding:28px 34px 30px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.84);
  box-shadow:0 28px 72px rgba(0,0,0,.22);
}

.eventFilters{
  display:grid;
  grid-template-columns:minmax(260px, 1fr) auto;
  align-items:center;
  gap:12px;
  margin-bottom:22px;
}

.filterControls{
  display:flex;
  align-items:center;
  justify-content:flex-end;
  gap:8px;
}

.filterDropdown{
  position:relative;
}

.filterDropdown summary,
.pastFilter{
  height:32px;
  box-sizing:border-box;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  min-width:154px;
  padding:0 12px;
  border:1px solid rgba(0,0,0,.08);
  border-radius:999px;
  background:#fff;
  color:#111;
  font-family:"Google Sans";
  font-size:13px;
  line-height:1;
  cursor:pointer;
  list-style:none;
  box-shadow:0 10px 24px rgba(0,0,0,.12),0 2px 7px rgba(0,0,0,.05);
  transition:transform .18s ease,box-shadow .18s ease,background .18s ease,color .18s ease;
}

.filterDropdown summary::-webkit-details-marker{display:none}
.filterDropdown[open] summary svg{transform:rotate(180deg)}
.filterDropdown summary svg{transition:transform .18s ease}
.filterDropdown summary:hover,.pastFilter:hover{transform:translateY(-1px);box-shadow:0 12px 26px rgba(0,0,0,.16)}
.filterDropdown.disabled summary{opacity:.45;cursor:not-allowed;box-shadow:none;transform:none}
.filterDropdown.disabled .filterMenu{display:none}
.pastFilter{
  min-width:auto;
  justify-content:center;
  gap:0;
  border-color:#9aabc1;
  background:#dce5f0;
  color:#405a7b;
  font-weight:600;
  box-shadow:0 10px 24px rgba(64,90,123,.19),0 2px 7px rgba(0,0,0,.05);
}
.pastFilter:hover{background:#cfdae8;box-shadow:0 12px 26px rgba(64,90,123,.25)}
.pastFilter.active{background:#536f94;color:#fff;border-color:#536f94;box-shadow:0 10px 24px rgba(64,90,123,.32)}

.filterMenu{
  position:absolute;
  z-index:20;
  top:calc(100% + 8px);
  right:0;
  width:210px;
  padding:9px;
  border:1px solid rgba(0,0,0,.06);
  border-radius:13px;
  background:#fff;
  box-shadow:0 18px 40px rgba(26,38,65,.16);
}

.filterMenu label{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:8px;color:#333;font-size:13px;cursor:pointer}
.filterMenu label:hover{background:#f3f5f8}
.filterMenu input{width:17px;height:17px;margin:0;accent-color:#5f78df;cursor:pointer}
.filterMenu span{white-space:nowrap}

.eventSearch{
  height:36px;
  width:100%;
  padding:0 12px;
  display:flex;
  align-items:center;
  gap:8px;
  border-radius:999px;
  border:1px solid rgba(0,0,0,.05);
  background:#f3f5f8;
  color:rgba(17,17,17,.48);
}

.eventSearch input{
  width:100%;
  min-width:0;
  border:0;
  outline:0;
  background:transparent;
  color:#111111;
  font:inherit;
  font-size:14px;
}

.eventSearch input::placeholder{
  color:rgba(17,17,17,.44);
}

.eventState{
  padding:28px 4px;
  border-top:1px solid rgba(0,0,0,.08);
  color:rgba(17,17,17,.52);
  font-size:14px;
  text-align:center;
}

.eventState.error{
  margin-bottom:14px;
  border:0;
  border-radius:7px;
  background:rgba(215,38,61,.10);
  color:#b91c1c;
}

.eventList{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  border-top:1px solid rgba(0,0,0,.08);
  transition:opacity .18s ease;
  margin:0 -34px -30px;
  overflow:hidden;
}

.eventList.refreshing{
  opacity:.62;
}

.eventItem{
  min-width:0;
  padding:18px 20px 20px;
  border-bottom:1px solid rgba(0,0,0,.08);
}

.eventItem:nth-child(odd){
  border-right:1px solid rgba(0,0,0,.10);
}

.eventItem:nth-child(4n + 2),
.eventItem:nth-child(4n + 3){
  background:#fafbfc;
}

.eventCardHeader{
  min-height:42px;
  display:grid;
  grid-template-columns:minmax(0, 1fr) auto;
  align-items:start;
  gap:12px;
  margin-bottom:14px;
}

.eventHeaderActions{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:8px;
}

.eventContent{
  display:grid;
  grid-template-columns:minmax(120px, 32%) minmax(0, 1fr);
  gap:12px;
  min-width:0;
}

.posterColumn{
  min-width:0;
}

.eventPoster{
  width:100%;
  aspect-ratio:1054 / 1492;
  height:auto;
  border-radius:10px;
  object-fit:contain;
  display:grid;
  place-items:center;
  background:#f3f5f8;
  color:#111111;
  font-size:30px;
  font-weight:500;
  border:1px solid rgba(0,0,0,.06);
}

.eventBody{
  min-width:0;
}

.eventIdentity{
  min-width:0;
}

.eventIdentity h2{
  min-width:0;
  margin:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#111111;
  font-size:16px;
  line-height:1.2;
  font-weight:500;
  letter-spacing:0;
}

.eventIdentity p{
  margin:4px 0 0;
  color:rgba(17,17,17,.52);
  font-size:13px;
  line-height:1.35;
}

.eventMetaLine{
  display:grid;
  gap:8px;
  margin-top:0;
  color:#2b59c3;
  font-size:12px;
  line-height:1.4;
}

.eventMetaLine span{
  display:inline-flex;
  align-items:center;
  gap:5px;
  min-width:0;
}

.eventMetaLine img{
  width:14px;
  height:14px;
  object-fit:contain;
  display:block;
  flex:0 0 auto;
}

.eventDescription{
  margin:12px 0 0;
  color:#111111;
  font-size:13px;
  line-height:1.5;
  display:-webkit-box;
  -webkit-line-clamp:4;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.eventTags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-top:10px;
}

.eventTags span{
  max-width:170px;
  min-width:0;
  padding:4px 9px;
  border-radius:7px;
  border:1px solid rgba(0,0,0,.08);
  background:#eef1f4;
  color:rgba(17,17,17,.64);
  font-size:12px;
  line-height:1.1;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.eventTags .slotsOpen{
  background:rgba(34,197,94,.16);
  color:#15803d;
  animation:eventSlotPulse 1.8s ease-in-out infinite;
}

.eventTags .slotsOpen,
.eventTags .slotsFull{
  display:inline-flex;
  align-items:center;
  gap:6px;
}

.eventTags .slotsOpen::before,
.eventTags .slotsFull::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  flex:0 0 auto;
}

.eventTags .slotsOpen::before{
  background:#22c55e;
}

.eventTags .slotsFull{
  background:rgba(215,38,61,.10);
  color:#b91c1c;
  animation:eventSlotFullPulse 1.8s ease-in-out infinite;
}

.eventTags .slotsFull::before{
  background:#d7263d;
}

.alreadyJoined{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  min-height:22px;
  padding:0 9px;
  border-radius:999px;
  border:1px solid rgba(47,95,245,.14);
  background:rgba(47,95,245,.10);
  color:#244ee4;
  font-size:12px;
  line-height:1;
  white-space:nowrap;
}

.alreadyJoined::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  background:#2f5ff5;
  flex:0 0 auto;
}
.archivedEvent{ display:inline-flex; align-items:center; min-height:22px; padding:0 9px; border-radius:999px; background:#eef0f3; color:#62666d; font-size:12px; white-space:nowrap; }

.viewEventLink{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  height:30px;
  padding:0 12px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-size:13px;
  line-height:1;
  box-shadow:0 10px 22px rgba(0,0,0,.12);
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease;
}

.viewEventLink:hover{
  background:#eef1f4;
  color:#111111;
  transform:translateY(-1px);
  box-shadow:0 12px 26px rgba(0,0,0,.16);
}

@keyframes eventsDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@keyframes eventSlotPulse{
  0%, 100%{ box-shadow:0 6px 16px rgba(21,128,61,.10); }
  50%{ box-shadow:0 7px 22px rgba(21,128,61,.28); }
}

@keyframes eventSlotFullPulse{
  0%, 100%{ box-shadow:0 6px 16px rgba(185,28,28,.10); }
  50%{ box-shadow:0 7px 22px rgba(185,28,28,.26); }
}

@media (max-width:820px){
  .eventFilters{
    grid-template-columns:1fr;
  }

  .filterControls{
    justify-content:flex-start;
    flex-wrap:wrap;
  }

  .eventList{
    grid-template-columns:1fr;
  }

  .eventItem:nth-child(odd){
    border-right:0;
  }

  .eventItem:nth-child(even){
    background:#fafbfc;
  }

  .eventItem:nth-child(odd){
    background:#ffffff;
  }
}

@media (max-width:560px){
  .eventsPage{
    padding:10px 14px 36px;
  }

  .eventsShell{
    border-radius:18px;
    padding:20px 14px 24px;
  }

  .filterControls{display:grid;grid-template-columns:1fr 1fr}
  .filterDropdown summary{min-width:0;width:100%;gap:8px}
  .pastFilter{grid-column:1/-1;width:max-content}
  .filterMenu{left:0;right:auto;width:max(190px,100%)}

  .eventList{
    margin:0 -14px -24px;
  }

  .eventItem{
    padding:16px 24px;
  }

  .eventCardHeader{
    grid-template-columns:1fr;
    gap:10px;
  }

  .eventHeaderActions{
    align-items:flex-start;
  }

  .eventContent{
    grid-template-columns:1fr;
    gap:12px;
  }

  .eventPoster{
    aspect-ratio:1054 / 1492;
    font-size:24px;
  }

  .viewEventLink{
    width:max-content;
    padding:0 10px;
  }
}
`;
