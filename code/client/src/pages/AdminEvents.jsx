import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Eye, Pencil, X } from "lucide-react";
import { Link } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import { approveEvent, getAdminEvents, rejectEvent } from "../api";

export default function AdminEvents() {
  const token = localStorage.getItem("token");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      setEvents(await getAdminEvents(token));
    } catch (e) {
      setErr(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const changeStatus = async (event, status) => {
    try {
      setErr("");
      setSuccessMsg("");
      if (status === "approved") await approveEvent(token, event.id);
      else await rejectEvent(token, event.id);
      setSuccessMsg(`“${event.title}” was ${status}.`);
      await loadEvents();
    } catch (e) {
      setErr(e.message || `Failed to mark event as ${status}`);
    }
  };

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

  if (loading) return <LoadingScreen text="Loading event approvals..." />;

  return (
    <main className="adminEventsPage">
      <style>{css}</style>

      {(err || successMsg) && (
        <div className={`eventAdminAlert ${err ? "error" : "success"}`}>
          {err || successMsg}
        </div>
      )}

      <section className="eventAdminPanel">
        <div className="eventPanelToolbar">
          <div>
            <h1>Event Approvals</h1>
            <p>{filteredEvents.length} events shown from {events.length} total events</p>
          </div>

          <div className="eventFilterTabs" aria-label="Filter events by status">
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

        <div className="eventTableShell">
          <table className="eventAdminTable">
            <thead>
              <tr>
                <th>Event</th>
                <th>Host</th>
                <th>Schedule</th>
                <th>Status</th>
                <th className="eventActionsHead">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="eventEmptyRow">No events in this view.</div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="eventIdentityCell">
                        {event.image_url ? (
                          <img src={event.image_url} alt="" />
                        ) : (
                          <span>{event.title?.slice(0, 1)?.toUpperCase() || "E"}</span>
                        )}
                        <div className="eventIdentityCopy">
                          <strong>{event.title || "Untitled event"}</strong>
                          <small>{event.venue || "No venue"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="eventSoftTag">{event.created_by_name || "Alumnet"}</span>
                    </td>
                    <td>
                      <div className="eventScheduleCell">
                        <span>{formatDate(event.event_date)}</span>
                        <small>{formatTime(event.event_time)}</small>
                      </div>
                    </td>
                    <td>
                      <span className={`eventStatusTag ${event.approval_status}`}>
                        {event.approval_status}
                      </span>
                    </td>
                    <td>
                      <div className="eventRowActions">
                        <Link
                          className="eventRoundAction view"
                          to={`/events/${event.id}`}
                          state={{ eventTitle: event.title }}
                          title="View event"
                          aria-label={`View ${event.title}`}
                        >
                          <Eye size={14} strokeWidth={2.2} />
                        </Link>
                        <Link
                          className="eventRoundAction edit"
                          to={`/events/${event.id}/edit`}
                          title="Edit event"
                          aria-label={`Edit ${event.title}`}
                        >
                          <Pencil size={13} strokeWidth={2.2} />
                        </Link>
                        {event.approval_status === "pending" && (
                          <>
                            <button
                              className="eventRoundAction approve"
                              type="button"
                              title="Approve event"
                              onClick={() => changeStatus(event, "approved")}
                            >
                              <Check size={14} strokeWidth={2.4} />
                            </button>
                            <button
                              className="eventRoundAction reject"
                              type="button"
                              title="Reject event"
                              onClick={() => changeStatus(event, "rejected")}
                            >
                              <X size={14} strokeWidth={2.4} />
                            </button>
                          </>
                        )}
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
.adminEventsPage{
  min-height:100vh;
  width:100%;
  background:#fbfbfa;
  color:#111111;
  font-family:"Google Sans", Arial, sans-serif;
  padding:30px max(24px, calc((100% - 1180px) / 2)) 70px;
  animation:eventAdminDissolve .22s ease both;
}

.eventAdminAlert{ margin:0 0 14px; padding:10px 12px; border-radius:8px; font-size:13px; }
.eventAdminAlert.error{ background:#fee8e8; color:#b42318; }
.eventAdminAlert.success{ background:#d8f8e4; color:#047a31; }

.eventAdminPanel{ border-top:1px solid rgba(0,0,0,.08); padding-top:16px; }
.eventPanelToolbar{ display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px; }
.eventPanelToolbar h1{ margin:0; font-size:15px; line-height:1.25; font-weight:600; }
.eventPanelToolbar p{ margin:4px 0 0; color:rgba(17,17,17,.46); font-size:12px; }

.eventFilterTabs{ display:inline-flex; gap:5px; padding:4px; border-radius:999px; background:#eef1f4; }
.eventFilterTabs button{ display:inline-flex; align-items:center; gap:6px; height:27px; padding:0 10px; border:0; border-radius:999px; background:transparent; color:rgba(17,17,17,.62); font-size:12px; font-family:inherit; cursor:pointer; }
.eventFilterTabs button.active{ background:#050505; color:#fff; box-shadow:0 8px 18px rgba(0,0,0,.12); }

.eventTableShell{ overflow:auto; border:1px solid rgba(0,0,0,.06); border-radius:8px; background:rgba(255,255,255,.48); }
.eventAdminTable{ width:100%; min-width:780px; border-collapse:collapse; }
.eventAdminTable th{ height:38px; padding:0 12px; color:rgba(17,17,17,.52); font-size:12px; font-weight:600; text-align:left; background:#fbfbfa; border-bottom:1px solid rgba(0,0,0,.06); white-space:nowrap; }
.eventAdminTable td{ padding:10px 12px; border-bottom:1px solid rgba(0,0,0,.06); font-size:13px; vertical-align:middle; }
.eventAdminTable tbody tr:hover{ background:rgba(238,241,244,.42); }
.eventActionsHead{ text-align:right !important; }

.eventIdentityCell{ display:flex; align-items:center; gap:9px; min-width:250px; }
.eventIdentityCell img,.eventIdentityCell>span{ width:34px; height:34px; border-radius:50%; flex:0 0 auto; }
.eventIdentityCell img{ object-fit:cover; }
.eventIdentityCell>span{ display:grid; place-items:center; background:#eef1f4; color:#111; font-size:12px; }
.eventIdentityCopy,.eventScheduleCell{ display:grid; gap:3px; min-width:0; }
.eventIdentityCopy strong{ color:#111; font-size:13px; font-weight:500; }
.eventIdentityCopy small,.eventScheduleCell small{ color:rgba(17,17,17,.52); font-size:12px; }
.eventScheduleCell>span{ color:rgba(17,17,17,.72); font-size:12px; }

.eventSoftTag,.eventStatusTag{ display:inline-flex; align-items:center; min-height:23px; border-radius:999px; padding:0 9px; font-size:12px; white-space:nowrap; }
.eventSoftTag{ max-width:180px; overflow:hidden; text-overflow:ellipsis; background:#eef1f4; color:rgba(17,17,17,.66); }
.eventStatusTag{ text-transform:capitalize; }
.eventStatusTag.pending{ background:#fef3c7; color:#a16207; }
.eventStatusTag.approved{ background:#d8f8e4; color:#047a31; }
.eventStatusTag.rejected{ background:#fee8e8; color:#b42318; }

.eventRowActions{ display:flex; justify-content:flex-end; gap:7px; min-width:133px; }
.eventRoundAction{ width:28px; height:28px; display:inline-grid; place-items:center; padding:0; border:0; border-radius:999px; text-decoration:none; cursor:pointer; transition:transform .16s ease, box-shadow .16s ease; }
.eventRoundAction.edit{ background:#eef1f4; color:#3f4752; }
.eventRoundAction.view{ background:#e8f0fe; color:#315fa8; }
.eventRoundAction.approve{ background:#d8f8e4; color:#047a31; }
.eventRoundAction.reject{ background:#fee8e8; color:#b42318; }
.eventRoundAction:hover{ transform:translateY(-1px); box-shadow:0 10px 20px rgba(0,0,0,.12); }
.eventEmptyRow{ padding:26px 0; text-align:center; color:rgba(17,17,17,.46); font-size:13px; }

@keyframes eventAdminDissolve{ from{ opacity:0; transform:translateY(4px); } to{ opacity:1; transform:translateY(0); } }
@media (max-width:860px){
  .eventPanelToolbar{ align-items:flex-start; flex-direction:column; }
  .eventFilterTabs{ width:100%; overflow:auto; }
}
`;
