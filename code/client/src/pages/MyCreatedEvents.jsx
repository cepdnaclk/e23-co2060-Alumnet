import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import SegmentedFilter from "../components/SegmentedFilter";
import { getMyCreatedEvents } from "../api";
import viewIcon from "../assets/view.png";
import { formatEventDate as formatDate, formatEventTime as formatTime } from "../utils/dateTime";

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
      past: events.filter((event) => event.is_past).length,
      pending: events.filter((event) => !event.is_past && event.approval_status === "pending").length,
      approved: events.filter((event) => !event.is_past && event.approval_status === "approved").length,
      rejected: events.filter((event) => !event.is_past && event.approval_status === "rejected").length,
    }),
    [events]
  );

  const filteredEvents = useMemo(
    () =>
      statusFilter === "all"
        ? events
        : statusFilter === "past"
          ? events.filter((event) => event.is_past)
          : events.filter((event) => !event.is_past && event.approval_status === statusFilter),
    [events, statusFilter]
  );

  const filterOptions = [
    { label: "All", value: "all", count: counts.all },
    { label: "Pending", value: "pending", count: counts.pending },
    { label: "Approved", value: "approved", count: counts.approved },
    { label: "Rejected", value: "rejected", count: counts.rejected },
    { label: "Archived", value: "past", count: counts.past },
  ];

  if (loading) return <LoadingScreen text="Loading your events..." />;

  return (
    <AccountListShell>
      {err && <div className="accountListError">{err}</div>}

      {events.length === 0 ? (
        <div className="accountListState">No created events yet.</div>
      ) : (
        <>
          <div className="accountListToolbar">
            <SegmentedFilter
              label="Filter created events by status"
              value={statusFilter}
              options={filterOptions}
              onChange={setStatusFilter}
            />
          </div>

          {filteredEvents.length === 0 ? (
            <div className="accountListState">No events in this view.</div>
          ) : (
            <div className="accountTableWrap">
              <table className="accountTable wide">
                <thead>
                  <tr>
                    <th style={{ width: "38%" }}>Event</th>
                    <th style={{ width: "17%" }}>Schedule</th>
                    <th style={{ width: "15%" }}>Registrations</th>
                    <th style={{ width: "13%" }}>Status</th>
                    <th className="tableActionHeader" style={{ width: "17%" }}>Action</th>
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
                        <div className="eventScheduleCell">
                          <span>{formatDate(event.event_date)}</span>
                          <small>{formatTime(event.event_time)}{event.ending_time ? ` – ${formatTime(event.ending_time)}` : ""}</small>
                        </div>
                      </td>
                      <td>
                        <span className="eventRegistrationTag">
                          {Number(event.registered_count || 0)} / {Number(event.available_slots || 0)}
                        </span>
                      </td>
                      <td>
                        <span className={`eventStatusPill ${event.is_past ? "past" : event.approval_status}`}>
                          {event.is_past ? "Past" : event.approval_status}
                        </span>
                      </td>
                      <td className="tableActionCell">
                        <div className="tableActions">
                          <Link
                            className="accountIconButton view"
                            to={`/events/${event.id}`}
                            state={{
                              eventTitle: event.title,
                              fromMyCreatedEvents: true,
                            }}
                            title="View event"
                            aria-label={`View ${event.title}`}
                          >
                            <img src={viewIcon} alt="" />
                          </Link>
                          <Link
                            className="accountIconButton edit"
                            to={`/events/${event.id}/edit`}
                            state={{
                              eventTitle: event.title,
                              fromMyCreatedEvents: true,
                            }}
                            title="Edit event"
                            aria-label={`Edit ${event.title}`}
                          >
                            <Pencil size={15} strokeWidth={2.2} />
                          </Link>
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

      <style>{css}</style>
    </AccountListShell>
  );
}

const css = `
.createdEventsTable{
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

.eventRegistrationTag,
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

.eventRegistrationTag{
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

.eventStatusPill.pending{
  background:#fef3c7;
  color:#a16207;
}

.eventStatusPill.pending::before{
  background:#f59e0b;
}

.eventStatusPill.approved{
  background:#d8f8e4;
  color:#047a31;
}

.eventStatusPill.approved::before{
  background:#22c55e;
}

.eventStatusPill.rejected{
  background:#fee8e8;
  color:#b42318;
}

.eventStatusPill.rejected::before{
  background:#d7263d;
}

.eventStatusPill.past{
  background:#e5e7eb;
  color:#4b5563;
}

.eventStatusPill.past::before{
  background:#6b7280;
}

.accountIconButton.edit{
  background:#eef1f4;
  color:#3f4752;
}
`;
