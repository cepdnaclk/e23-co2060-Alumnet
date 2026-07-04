import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LoadingScreen from "../components/LoadingScreen";
import { getEventById, registerForEvent } from "../api";
import dateIcon from "../assets/date.png";
import timeIcon from "../assets/time.png";
import locationIcon from "../assets/location.png";
import speakerIcon from "../assets/speaker.png";
import registerIcon from "../assets/register.png";

export default function EventDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  let role = "";
  try {
    role = token ? jwtDecode(token).role : "";
  } catch {
    role = "";
  }
  const isStudent = role === "student";

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadEvent = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getEventById(token, id);
      setEvent(data);
    } catch (e) {
      setErr(e.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleJoin = async () => {
    try {
      setErr("");
      await registerForEvent(token, id);
      const updated = await getEventById(token, id);
      setEvent(updated);
    } catch (e) {
      setErr(e.message || "Failed to join event");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingScreen text="Loading event details..." />;
  }

  if (err) {
    return (
      <main className="eventDetailsPage">
        <div className="eventMessage error">{err}</div>
        <EventDetailsStyles />
      </main>
    );
  }

  if (!event) {
    return (
      <main className="eventDetailsPage">
        <div className="eventMessage">Event not found.</div>
        <EventDetailsStyles />
      </main>
    );
  }

  const registered = Number(event.registered_count || 0);
  const slots = Number(event.available_slots || 0);
  const remaining = Math.max(slots - registered, 0);

  return (
    <main className="eventDetailsPage">
      <section className="eventDetailsGrid">
        <aside className="eventPosterPanel">
          {event.image_url ? (
            <img className="eventPosterImage" src={event.image_url} alt={event.title} />
          ) : (
            <div className="eventPosterFallback">{event.title?.charAt(0) || "E"}</div>
          )}
        </aside>

        <section className="eventInfoPanel" aria-label="Event details">
          <div className="eventHeadingRow">
            <div>
              <h1>{event.title}</h1>
              <p>By {event.created_by_name || "Alumnet"}</p>
              <span className={`eventApprovalStatus ${event.approval_status}`}>
                {event.approval_status}
              </span>
            </div>

            {isStudent && (event.is_registered ? (
              <button className="joinEventBtn disabled" disabled>
                Already Joined
              </button>
            ) : (
              <button
                className="joinEventBtn"
                onClick={handleJoin}
                disabled={remaining <= 0}
              >
                {remaining <= 0 ? "Event Full" : "Join Event"}
              </button>
            ))}
          </div>

          <div className="eventMetaList">
            <EventMeta icon={dateIcon} label="Date" value={formatDate(event.event_date)} />
            <EventMeta icon={timeIcon} label="Time" value={formatTime(event.event_time)} />
            <EventMeta icon={locationIcon} label="Location" value={event.venue || "-"} />
            <EventMeta icon={speakerIcon} label="Speaker" value={event.speaker || "-"} />
            <EventMeta
              icon={registerIcon}
              label="Registered"
              value={`${registered} / ${slots}`}
              status={remaining > 0 ? "available" : "full"}
            />
          </div>

          <div className="eventTextBlock">
            <h2>Details</h2>
            <p>{event.description || "No event details have been added yet."}</p>
          </div>

          <div className="eventTextBlock">
            <h2>Links</h2>
            {event.zoom_link ? (
              <a className="eventLink" href={event.zoom_link} target="_blank" rel="noreferrer">
                Join Zoom Session
              </a>
            ) : (
              <p>No links provided.</p>
            )}
          </div>

        </section>
      </section>

      <EventDetailsStyles />
    </main>
  );
}

function EventMeta({ icon, label, value, status = "" }) {
  return (
    <div className={`eventMetaRow ${status}`}>
      <span className="eventMetaIcon">{icon && <img src={icon} alt="" />}</span>
      <span className="eventMetaLabel">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EventDetailsStyles() {
  return (
    <style>{`
      .eventDetailsPage {
        width: 100%;
        min-height: calc(100vh - 116px);
        margin: 0 auto;
        padding: 34px 0 70px;
        background: #fbfbfa;
        color: #050505;
        font-family: "Google Sans", Arial, sans-serif;
      }

      .eventDetailsGrid {
        width: min(1124px, calc(100% - 48px));
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(280px, 410px) minmax(0, 1fr);
        gap: 34px;
        align-items: start;
      }

      .eventPosterPanel {
        min-height: 430px;
        border-radius: 18px;
        overflow: hidden;
        background: #fbfbfa;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
      }

      .eventPosterImage,
      .eventPosterFallback {
        width: 100%;
        height: 100%;
        min-height: 430px;
        display: grid;
        place-items: center;
      }

      .eventPosterImage {
        object-fit: contain;
      }

      .eventPosterFallback {
        background: #eef1f4;
        color: #111;
        font-size: 84px;
        font-weight: 700;
      }

      .eventInfoPanel {
        padding-top: 2px;
      }

      .eventHeadingRow {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        align-items: flex-start;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .eventHeadingRow h1 {
        margin: 0;
        font-size: 18px;
        line-height: 1.2;
        font-weight: 500;
        letter-spacing: 0;
      }

      .eventHeadingRow p {
        margin: 5px 0 0;
        color: rgba(17, 17, 17, 0.48);
        font-size: 13px;
        line-height: 1.2;
      }

      .eventApprovalStatus {
        display: inline-flex;
        align-items: center;
        min-height: 24px;
        margin-top: 10px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 12px;
        text-transform: capitalize;
      }

      .eventApprovalStatus.pending { background: #fef3c7; color: #a16207; }
      .eventApprovalStatus.approved { background: #d8f8e4; color: #047a31; }
      .eventApprovalStatus.rejected { background: #fee8e8; color: #b42318; }

      .eventMetaList {
        margin-top: 12px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }

      .eventMetaRow {
        display: grid;
        grid-template-columns: 24px 132px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        min-height: 0;
        padding: 7px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        font-size: 13px;
      }

      .eventMetaIcon {
        width: 22px;
        height: 22px;
        display: inline-grid;
        place-items: center;
      }

      .eventMetaIcon img {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }

      .eventMetaLabel {
        color: rgba(17, 17, 17, 0.5);
      }

      .eventMetaRow strong {
        min-width: 0;
        color: #050505;
        font-size: 13px;
        font-weight: 500;
        overflow-wrap: anywhere;
      }

      .eventMetaRow.available strong {
        color: #047a31;
      }

      .eventMetaRow.full strong {
        color: #b42318;
      }

      .eventTextBlock {
        margin-top: 20px;
      }

      .eventTextBlock h2 {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.3;
        font-weight: 600;
      }

      .eventTextBlock p {
        margin: 0;
        color: #111;
        font-size: 13px;
        line-height: 1.55;
      }

      .eventLink {
        display: inline-flex;
        align-items: center;
        min-height: 30px;
        border-radius: 999px;
        padding: 0 12px;
        background: #eef1f4;
        color: #050505;
        text-decoration: none;
        font-size: 13px;
        box-shadow: 0 10px 22px rgba(0, 0, 0, 0.1);
        transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
      }

      .eventLink:hover {
        background: #111;
        color: #fff;
        transform: translateY(-1px);
      }

      .joinEventBtn {
        flex: 0 0 auto;
        min-width: 104px;
        height: 30px;
        border: 0;
        border-radius: 999px;
        padding: 0 12px;
        background: #111;
        color: #fff;
        font-size: 13px;
        font-weight: 500;
        font-family: "Google Sans", Arial, sans-serif;
        cursor: pointer;
        box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
        transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
      }

      .joinEventBtn:hover:not(:disabled) {
        background: #eef1f4;
        color: #111;
        transform: translateY(-1px);
        box-shadow: 0 12px 26px rgba(0, 0, 0, 0.16);
      }

      .joinEventBtn:disabled,
      .joinEventBtn.disabled {
        opacity: 0.58;
        cursor: not-allowed;
        transform: none;
      }

      .joinEventBtn.disabled {
        background: #2563eb;
        color: #fff;
        opacity: 1;
        box-shadow: 0 10px 22px rgba(37, 99, 235, 0.18);
      }

      .eventMessage {
        padding: 14px 16px;
        border-radius: 14px;
        background: #f2f3f4;
        color: #111;
        font-size: 14px;
      }

      .eventMessage.error {
        background: #fee8e8;
        color: #9f1d1d;
      }

      @media (max-width: 860px) {
        .eventDetailsPage {
          padding-top: 18px;
        }

        .eventDetailsGrid {
          width: min(100% - 28px, 620px);
        }

        .eventDetailsGrid {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .eventPosterPanel,
        .eventPosterImage,
        .eventPosterFallback {
          min-height: 340px;
        }

        .eventHeadingRow {
          flex-direction: column;
          gap: 12px;
        }

        .eventMetaRow {
          grid-template-columns: 24px 98px minmax(0, 1fr);
        }

        .joinEventBtn {
          align-self: flex-start;
        }
      }
    `}</style>
  );
}
