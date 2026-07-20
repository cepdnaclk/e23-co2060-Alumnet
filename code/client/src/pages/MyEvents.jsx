import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import { getMyRegisteredEvents } from "../api";
import dateIcon from "../assets/date.png";
import timeIcon from "../assets/time.png";
import locationIcon from "../assets/location.png";
import viewIcon from "../assets/view.png";
import { formatAppDateTime, formatEventDate, formatEventTime, isEventDayPast } from "../utils/dateTime";

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
                <th style={{ width: "27%" }}>Event</th>
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
                <th style={{ width: "16%" }}>
                  <span className="tableHeaderIcon">
                    <img src={locationIcon} alt="" />
                    Venue
                  </span>
                </th>
                <th style={{ width: "14%" }}>Joined</th>
                <th style={{ width: "9%" }}>Status</th>
                <th className="tableActionHeader" style={{ width: "11%" }}>Action</th>
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
                      {formatEventDate(event.event_date)}
                    </span>
                  </td>
                  <td>
                    <span className="eventTableValue">
                      {formatEventTime(event.event_time)}
                    </span>
                  </td>
                  <td>
                    <span className="eventTableValue">
                      {event.venue || "-"}
                    </span>
                  </td>
                  <td>
                    <span className="eventTableValue">
                      {formatAppDateTime(event.registered_at)}
                    </span>
                  </td>
                  <td>
                    <span className={`eventStatus ${isEventDayPast(event) ? "past" : "upcoming"}`}>
                      {isEventDayPast(event) ? "Past" : "Upcoming"}
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

const css = `
.eventTableValue{
  display:inline-flex;
  align-items:center;
  min-width:0;
  color:#111111;
  overflow-wrap:anywhere;
}
.eventStatus{
  display:inline-flex;
  align-items:center;
  min-height:26px;
  padding:0 10px;
  border-radius:999px;
  font-size:12px;
  font-weight:600;
}
.eventStatus.upcoming{
  background:#e7f7ed;
  color:#087333;
}
.eventStatus.past{
  background:#eef0f3;
  color:#62666d;
}
`;
