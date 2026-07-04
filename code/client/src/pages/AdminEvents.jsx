import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import SegmentedFilter from "../components/SegmentedFilter";
import { approveEvent, getAdminEvents, rejectEvent } from "../api";
import rejectedIcon from "../assets/rejected.png";
import tickIcon from "../assets/tick.png";
import viewIcon from "../assets/view.png";

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

  const filterOptions = [
    { label: "All", value: "all", count: counts.all },
    { label: "Pending", value: "pending", count: counts.pending },
    { label: "Approved", value: "approved", count: counts.approved },
    { label: "Rejected", value: "rejected", count: counts.rejected },
  ];

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
      setSuccessMsg(`"${event.title}" was ${status}.`);
      await loadEvents();
    } catch (e) {
      setErr(e.message || `Failed to mark event as ${status}`);
    }
  };

  if (loading) return <LoadingScreen text="Loading event approvals..." />;

  return (
    <AccountListShell>
      <style>{css}</style>
      {err && <div className="accountListError">{err}</div>}
      {successMsg && <div className="accountListState successState">{successMsg}</div>}

      {events.length === 0 ? (
        <div className="accountListState">No events submitted yet.</div>
      ) : (
        <>
          <div className="accountListToolbar">
            <SegmentedFilter
              label="Filter events by status"
              value={statusFilter}
              options={filterOptions}
              onChange={setStatusFilter}
            />
          </div>

          {filteredEvents.length === 0 ? (
            <div className="accountListState">No events in this view.</div>
          ) : (
            <div className="accountTableWrap">
              <table className="accountTable adminEventsTable">
                <thead>
                  <tr>
                    <th style={{ width: "32%" }}>Event</th>
                    <th style={{ width: "14%" }}>Host</th>
                    <th style={{ width: "15%" }}>Schedule</th>
                    <th style={{ width: "12%" }}>Status</th>
                    <th className="tableActionHeader" style={{ width: "27%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <div className="tableEvent">
                          {event.image_url ? (
                            <img src={event.image_url} alt={event.title} className="tableThumb" />
                          ) : (
                            <div className="tableThumb">
                              {event.title?.slice(0, 1)?.toUpperCase() || "E"}
                            </div>
                          )}
                          <div>
                            <div className="tableName">
                              <span>{event.title || "Untitled event"}</span>
                            </div>
                            <div className="tableMeta">{event.venue || "No venue"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="adminSoftTag">{event.created_by_name || "Alumnet"}</span>
                      </td>
                      <td>
                        <div className="eventScheduleCell">
                          <span>{formatDate(event.event_date)}</span>
                          <small>{formatTime(event.event_time)}</small>
                        </div>
                      </td>
                      <td>
                        <span className={`eventStatusPill ${event.approval_status}`}>
                          {event.approval_status}
                        </span>
                      </td>
                      <td className="tableActionCell">
                        <div className="tableActions adminEventActions">
                          <Link
                            className="accountIconButton view"
                            to={`/events/${event.id}`}
                            state={{ eventTitle: event.title }}
                            title="View event"
                            aria-label={`View ${event.title}`}
                          >
                            <img src={viewIcon} alt="" />
                          </Link>
                          <Link
                            className="accountIconButton edit"
                            to={`/events/${event.id}/edit`}
                            title="Edit event"
                            aria-label={`Edit ${event.title}`}
                          >
                            <Pencil size={15} strokeWidth={2.2} />
                          </Link>
                          {event.approval_status === "pending" && (
                            <>
                              <button
                                className="accountIconButton labeled accept"
                                type="button"
                                title="Approve event"
                                aria-label={`Approve ${event.title}`}
                                onClick={() => changeStatus(event, "approved")}
                              >
                                <img src={tickIcon} alt="" />
                                <span>Approve</span>
                              </button>
                              <button
                                className="accountIconButton labeled reject"
                                type="button"
                                title="Reject event"
                                aria-label={`Reject ${event.title}`}
                                onClick={() => changeStatus(event, "rejected")}
                              >
                                <img src={rejectedIcon} alt="" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AccountListShell>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(`1970-01-01T${value}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const css = `
.adminEventsTable{
  min-width:0;
}

.eventScheduleCell{
  display:grid;
  gap:3px;
}

.eventScheduleCell span{
  color:#111111;
}

.eventScheduleCell small{
  color:rgba(17,17,17,.52);
  font-size:12px;
}

.adminSoftTag,
.eventStatusPill{
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-height:23px;
  border-radius:999px;
  padding:0 9px;
  font-size:12px;
  white-space:nowrap;
}

.adminSoftTag{
  max-width:160px;
  overflow:hidden;
  text-overflow:ellipsis;
  background:#eef1f4;
  color:rgba(17,17,17,.66);
}

.eventStatusPill{
  text-transform:capitalize;
}

.eventStatusPill::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  flex:0 0 auto;
}

.eventStatusPill.pending{ background:#fef3c7; color:#a16207; }
.eventStatusPill.pending::before{ background:#f59e0b; }
.eventStatusPill.approved{ background:#d8f8e4; color:#047a31; }
.eventStatusPill.approved::before{ background:#22c55e; }
.eventStatusPill.rejected{ background:#fee8e8; color:#b42318; }
.eventStatusPill.rejected::before{ background:#d7263d; }

.accountIconButton.edit{
  background:#eef1f4;
  color:#3f4752;
}

.adminEventActions{
  gap:7px;
}
`;
