import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import { getMyRegisteredEvents } from "../api";
import dateIcon from "../assets/date.png";
import timeIcon from "../assets/time.png";
import locationIcon from "../assets/location.png";
import viewIcon from "../assets/view.png";

export default function MyEvents() {
  const token = localStorage.getItem("token");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getMyRegisteredEvents(token);
        setEvents(data);
      } catch (e) {
        setErr(e.message || "Failed to load registered events");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  return (
    <AccountListShell>
      {err && <div className="accountListError">{err}</div>}

      {loading ? (
        <LoadingScreen text="Loading events..." />
      ) : events.length === 0 ? (
        <div className="accountListState">You have not joined any events yet.</div>
      ) : (
        <div className="accountTableWrap">
          <table className="accountTable wide">
            <thead>
              <tr>
                <th style={{ width: "32%" }}>Event</th>
                <th style={{ width: "12%" }}>
                  <span className="tableHeaderIcon">
                    <img src={dateIcon} alt="" />
                    Date
                  </span>
                </th>
                <th style={{ width: "11%" }}>
                  <span className="tableHeaderIcon">
                    <img src={timeIcon} alt="" />
                    Time
                  </span>
                </th>
                <th style={{ width: "18%" }}>
                  <span className="tableHeaderIcon">
                    <img src={locationIcon} alt="" />
                    Venue
                  </span>
                </th>
                <th style={{ width: "15%" }}>Joined</th>
                <th className="tableActionHeader" style={{ width: "12%" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
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
                          <span>{event.title}</span>
                        </div>
                        <div className="tableMeta">
                          Hosted by {event.created_by_name || "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="eventTableValue">
                      {formatDate(event.event_date)}
                    </span>
                  </td>
                  <td>
                    <span className="eventTableValue">
                      {formatTime(event.event_time)}
                    </span>
                  </td>
                  <td>
                    <span className="eventTableValue">
                      {event.venue || "-"}
                    </span>
                  </td>
                  <td>
                    <span className="eventTableValue">
                      {formatDateTime(event.registered_at)}
                    </span>
                  </td>
                  <td className="tableActionCell">
                    <div className="tableActions">
                      <Link
                        to={`/events/${event.id}`}
                        state={{ eventTitle: event.title, fromMyEvents: true }}
                        className="accountIconButton view"
                        title="View event"
                        aria-label={`View ${event.title}`}
                      >
                        <img src={viewIcon} alt="" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{css}</style>
    </AccountListShell>
  );
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
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

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

const css = `
.eventTableValue{
  display:inline-flex;
  align-items:center;
  min-width:0;
  color:#111111;
  overflow-wrap:anywhere;
}
`;
