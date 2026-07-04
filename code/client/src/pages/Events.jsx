import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import { getEvents } from "../api";
import dateIcon from "../assets/date.png";
import timeIcon from "../assets/time.png";
import locationIcon from "../assets/location.png";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getEvents();
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
  }, [search, loading]);

  const filteredEvents = events.filter((event) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return [event.title, event.venue, event.created_by_name, event.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query));
  });

  return (
    <main className="eventsPage">
      <style>{css}</style>

      <section className="eventsShell">
        <label className="eventSearch">
          <Search size={15} strokeWidth={2} />
          <input
            placeholder="Search events"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

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
                    <div className="eventTopLine">
                      <div className="eventIdentity">
                        <h2>{event.title}</h2>
                        <p>Hosted by {event.created_by_name || "-"}</p>
                      </div>
                    </div>

                    <div className="eventMetaLine">
                      <span>
                        <img src={dateIcon} alt="" />
                        {formatDate(event.event_date)}
                      </span>
                      <span>
                        <img src={timeIcon} alt="" />
                        {formatTime(event.event_time)}
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

                  <div className="eventActionColumn">
                    <Link
                      to={`/events/${event.id}`}
                      state={{ eventTitle: event.title }}
                      className="viewEventLink"
                    >
                      View Event
                    </Link>
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

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "-";
  return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const css = `
.eventsPage{
  min-height:calc(100vh - 72px);
  background:#fbfbfa;
  color:#111111;
  font-family:"Google Sans";
  padding:26px 28px 34px;
  animation:eventsDissolve .22s ease both;
}

.eventsShell{
  width:min(960px, 100%);
  margin:0 auto;
}

.eventSearch{
  height:36px;
  width:min(528px, 100%);
  margin-bottom:20px;
  padding:0 10px;
  display:flex;
  align-items:center;
  gap:8px;
  border-radius:7px;
  background:#eef1f4;
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
  border-top:1px solid rgba(0,0,0,.08);
  transition:opacity .18s ease;
}

.eventList.refreshing{
  opacity:.62;
}

.eventItem{
  display:grid;
  grid-template-columns:58px minmax(0, 1fr) 136px;
  gap:14px;
  padding:18px 0;
  border-bottom:1px solid rgba(0,0,0,.08);
}

.posterColumn{
  padding-top:2px;
}

.eventPoster{
  width:48px;
  height:48px;
  border-radius:50%;
  object-fit:cover;
  display:grid;
  place-items:center;
  background:#ecebe7;
  color:#111111;
  font-size:18px;
  font-weight:500;
}

.eventBody{
  min-width:0;
}

.eventTopLine{
  display:flex;
  justify-content:space-between;
  gap:14px;
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
  font-size:15px;
  line-height:1.2;
  font-weight:520;
  letter-spacing:0;
}

.eventIdentity p{
  margin:4px 0 0;
  color:rgba(17,17,17,.52);
  font-size:13px;
  line-height:1.35;
}

.eventMetaLine{
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:8px 16px;
  margin-top:7px;
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
  max-width:680px;
  margin:10px 0 0;
  color:#111111;
  font-size:13px;
  line-height:1.55;
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

.eventActionColumn{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:10px;
}

.eventTags .slotsOpen{
  background:rgba(34,197,94,.16);
  color:#15803d;
  animation:eventSlotPulse 1.8s ease-in-out infinite;
}

.eventTags .slotsFull{
  background:rgba(215,38,61,.10);
  color:#b91c1c;
  animation:eventSlotFullPulse 1.8s ease-in-out infinite;
}

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
  .eventItem{
    grid-template-columns:48px minmax(0, 1fr);
  }

  .eventActionColumn{
    grid-column:2;
    flex-direction:row;
    align-items:center;
    justify-content:space-between;
  }
}

@media (max-width:560px){
  .eventsPage{
    padding:18px 16px 28px;
  }

  .eventItem{
    grid-template-columns:42px minmax(0, 1fr);
    gap:11px;
    padding:16px 0;
  }

  .eventPoster{
    width:40px;
    height:40px;
    font-size:16px;
  }

  .eventTopLine{
    display:block;
  }

  .eventActionColumn{
    gap:8px;
  }

  .viewEventLink{
    padding:0 10px;
  }
}
`;
