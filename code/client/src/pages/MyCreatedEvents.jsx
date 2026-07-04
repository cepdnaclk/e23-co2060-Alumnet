import { useEffect, useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { getMyCreatedEvents } from "../api";

export default function MyCreatedEvents() {
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setErr("");
        setEvents(await getMyCreatedEvents(token));
      } catch (e) {
        setErr(e.message || "Failed to load your events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [token]);

  const counts = useMemo(
    () => ({
      all: events.length,
      pending: events.filter((event) => event.approval_status === "pending").length,
      approved: events.filter((event) => event.approval_status === "approved").length,
      rejected: events.filter((event) => event.approval_status === "rejected").length,
    }),
    [events]
  );

  const filteredEvents = useMemo(
    () =>
      statusFilter === "all"
        ? events
        : events.filter((event) => event.approval_status === statusFilter),
    [events, statusFilter]
  );

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return new Date(`1970-01-01T${value}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <LoadingScreen text="Loading your events..." />;

  return (
    <main className="myCreatedEventsPage">
      <style>{css}</style>

      {err && <div className="myEventsAlert">{err}</div>}

      <section className="myEventsPanel">
        <div className="myEventsToolbar">
          <div>
            <h1>My Created Events</h1>
            <p>{filteredEvents.length} events shown from {events.length} total events</p>
          </div>

          <div className="myEventsFilters" aria-label="Filter events by status">
            {[
              ["all", "All"],
              ["pending", "Pending"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={statusFilter === value ? "active" : ""}
                onClick={() => setStatusFilter(value)}
              >
                {label} <span>{counts[value]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="myEventsTableShell">
          <table className="myEventsTable">
            <thead>
              <tr>
                <th>Event</th>
                <th>Schedule</th>
                <th>Registrations</th>
                <th>Status</th>
                <th className="myEventsActionsHead">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="myEventsEmpty">No events in this view.</div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="myEventIdentity">
                        {event.image_url ? (
                          <img src={event.image_url} alt="" />
                        ) : (
                          <span>{event.title?.slice(0, 1)?.toUpperCase() || "E"}</span>
                        )}
                        <div className="myEventIdentityCopy">
                          <strong>{event.title || "Untitled event"}</strong>
                          <small>{event.venue || "No venue"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="myEventSchedule">
                        <span>{formatDate(event.event_date)}</span>
                        <small>{formatTime(event.event_time)}</small>
                      </div>
                    </td>
                    <td>
                      <span className="myEventRegistrationTag">
                        {Number(event.registered_count || 0)} / {Number(event.available_slots || 0)}
                      </span>
                    </td>
                    <td>
                      <span className={`myEventStatus ${event.approval_status}`}>
                        {event.approval_status}
                      </span>
                    </td>
                    <td>
                      <div className="myEventActions">
                        <Link
                          className="myEventView"
                          to={`/events/${event.id}`}
                          state={{ eventTitle: event.title }}
                          title="View event"
                          aria-label={`View ${event.title}`}
                        >
                          <Eye size={14} strokeWidth={2.2} />
                        </Link>
                        <Link
                          className="myEventEdit"
                          to={`/events/${event.id}/edit`}
                          title="Edit event"
                          aria-label={`Edit ${event.title}`}
                        >
                          <Pencil size={13} strokeWidth={2.2} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const css = `
.myCreatedEventsPage{
  min-height:100vh;
  width:100%;
  background:#fbfbfa;
  color:#111111;
  font-family:"Google Sans", Arial, sans-serif;
  padding:30px max(24px, calc((100% - 1180px) / 2)) 70px;
  animation:myEventsDissolve .22s ease both;
}

.myEventsAlert{ margin:0 0 14px; padding:10px 12px; border-radius:8px; background:#fee8e8; color:#b42318; font-size:13px; }
.myEventsPanel{ border-top:1px solid rgba(0,0,0,.08); padding-top:16px; }
.myEventsToolbar{ display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px; }
.myEventsToolbar h1{ margin:0; font-size:15px; line-height:1.25; font-weight:600; }
.myEventsToolbar p{ margin:4px 0 0; color:rgba(17,17,17,.46); font-size:12px; }

.myEventsFilters{ display:inline-flex; gap:5px; padding:4px; border-radius:999px; background:#eef1f4; }
.myEventsFilters button{ display:inline-flex; align-items:center; gap:6px; height:27px; padding:0 10px; border:0; border-radius:999px; background:transparent; color:rgba(17,17,17,.62); font-size:12px; font-family:inherit; cursor:pointer; }
.myEventsFilters button.active{ background:#050505; color:#fff; box-shadow:0 8px 18px rgba(0,0,0,.12); }

.myEventsTableShell{ overflow:auto; border:1px solid rgba(0,0,0,.06); border-radius:8px; background:rgba(255,255,255,.48); }
.myEventsTable{ width:100%; min-width:720px; border-collapse:collapse; }
.myEventsTable th{ height:38px; padding:0 12px; color:rgba(17,17,17,.52); font-size:12px; font-weight:600; text-align:left; background:#fbfbfa; border-bottom:1px solid rgba(0,0,0,.06); white-space:nowrap; }
.myEventsTable td{ padding:10px 12px; border-bottom:1px solid rgba(0,0,0,.06); font-size:13px; vertical-align:middle; }
.myEventsTable tbody tr:hover{ background:rgba(238,241,244,.42); }
.myEventsActionsHead{ text-align:right !important; }

.myEventIdentity{ display:flex; align-items:center; gap:9px; min-width:270px; }
.myEventIdentity img,.myEventIdentity>span{ width:34px; height:34px; border-radius:50%; flex:0 0 auto; }
.myEventIdentity img{ object-fit:cover; }
.myEventIdentity>span{ display:grid; place-items:center; background:#eef1f4; color:#111; font-size:12px; }
.myEventIdentityCopy,.myEventSchedule{ display:grid; gap:3px; min-width:0; }
.myEventIdentityCopy strong{ color:#111; font-size:13px; font-weight:500; }
.myEventIdentityCopy small,.myEventSchedule small{ color:rgba(17,17,17,.52); font-size:12px; }
.myEventSchedule>span{ color:rgba(17,17,17,.72); font-size:12px; }

.myEventRegistrationTag,.myEventStatus{ display:inline-flex; align-items:center; min-height:23px; border-radius:999px; padding:0 9px; font-size:12px; white-space:nowrap; }
.myEventRegistrationTag{ background:#eef1f4; color:rgba(17,17,17,.66); }
.myEventStatus{ text-transform:capitalize; }
.myEventStatus.pending{ background:#fef3c7; color:#a16207; }
.myEventStatus.approved{ background:#d8f8e4; color:#047a31; }
.myEventStatus.rejected{ background:#fee8e8; color:#b42318; }

.myEventActions{ display:flex; justify-content:flex-end; gap:7px; }
.myEventEdit,.myEventView{ width:28px; height:28px; display:inline-grid; place-items:center; border-radius:999px; text-decoration:none; transition:transform .16s ease, box-shadow .16s ease; }
.myEventEdit{ background:#eef1f4; color:#3f4752; }
.myEventView{ background:#e8f0fe; color:#315fa8; }
.myEventEdit:hover,.myEventView:hover{ transform:translateY(-1px); box-shadow:0 10px 20px rgba(0,0,0,.12); }
.myEventsEmpty{ padding:26px 0; text-align:center; color:rgba(17,17,17,.46); font-size:13px; }

@keyframes myEventsDissolve{ from{ opacity:0; transform:translateY(4px); } to{ opacity:1; transform:translateY(0); } }
@media (max-width:860px){
  .myEventsToolbar{ align-items:flex-start; flex-direction:column; }
  .myEventsFilters{ width:100%; overflow:auto; }
}
`;
