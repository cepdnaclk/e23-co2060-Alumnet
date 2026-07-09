import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  GraduationCap,
  HandHeart,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  UserCheck,
  UsersRound,
} from "lucide-react";

import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import { getEvents, getProfile } from "../api";

const COLORS = {
  blue: "rgba(207, 231, 247, 0.86)",
  sage: "rgba(217, 244, 229, 0.82)",
  peach: "rgba(246, 232, 238, 0.88)",
  cream: "rgba(255, 240, 189, 0.78)",
  lavender: "rgba(226, 220, 255, 0.80)",
  pink: "rgba(246, 232, 238, 0.92)",
  yellow: "rgba(255, 240, 189, 0.82)",
  plum: "#305f73",
  ink: "#111111",
  offWhite: "rgba(255,255,255,.70)",
  softWhite: "rgba(255,255,255,.78)",
};

export default function Dashboard() {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  const currentUser = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  const role = currentUser?.role || "";
  const isAdmin =
    role === "university_admin" || role === "system_admin";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const [profileData, eventsData] = await Promise.all([
          getProfile(token),
          getEvents(token),
        ]);

        setProfile(profileData);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (e) {
        setErr(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const firstName =
    profile?.full_name?.trim()?.split(/\s+/)?.[0] || "there";

  const cards = useMemo(() => {
    if (isAdmin) {
      return [
        {
          title: "Admin Dashboard",
          text: "View platform activity and manage Alumnet administration.",
          to: "/admin",
          icon: ShieldCheck,
          color: COLORS.blue,
        },
        {
          title: "User Verifications",
          text: "Review pending users and approve eligible university members.",
          to: "/admin-users",
          icon: UserCheck,
          color: COLORS.sage,
        },
        {
          title: "Event Approvals",
          text: "Review submitted events before they appear to the community.",
          to: "/admin-events",
          icon: CalendarDays,
          color: COLORS.peach,
        },
        {
          title: "Events",
          text: "View university events and community announcements.",
          to: "/events",
          icon: CalendarDays,
          color: COLORS.yellow,
        },
        {
          title: "Create Event",
          text: "Create new events for the Alumnet community.",
          to: "/create-event",
          icon: CalendarDays,
          color: COLORS.lavender,
        },
        {
          title: "Profile",
          text: "Review your account information and admin profile.",
          to: "/profile",
          icon: CircleUserRound,
          color: COLORS.pink,
        },
      ];
    }

    const requestCard =
      role === "alumni"
        ? {
            title: "Mentor Requests",
            text: "Review students who want to connect with you for guidance.",
            to: "/mentor-requests",
            icon: HandHeart,
            color: COLORS.cream,
          }
        : {
            title: "My Requests",
            text: "Follow the progress of mentorship requests you have sent.",
            to: "/my-requests",
            icon: HandHeart,
            color: COLORS.cream,
          };

    const connectionCard =
      role === "alumni"
        ? {
            title: "My Mentees",
            text: "View the students currently connected with you.",
            to: "/my-mentees",
            icon: UsersRound,
            color: COLORS.lavender,
          }
        : {
            title: "My Mentors",
            text: "Find the alumni mentors currently connected with you.",
            to: "/my-mentors",
            icon: GraduationCap,
            color: COLORS.lavender,
          };

    return [
      {
        title: "My Profile",
        text: "View your account details and how your profile appears.",
        to: "/profile",
        icon: CircleUserRound,
        color: COLORS.blue,
      },
      {
        title: "Alumni Directory",
        text: "Search alumni by department, batch, profession and skills.",
        to: "/directory",
        icon: Search,
        color: COLORS.sage,
      },
      requestCard,
      connectionCard,
      {
        title: "Chat",
        text: "Continue conversations with your connected mentors or mentees.",
        to: "/chat",
        icon: MessageCircle,
        color: COLORS.pink,
      },
      {
        title: "Events",
        text: "Discover university events, sessions and community activities.",
        to: "/events",
        icon: CalendarDays,
        color: COLORS.yellow,
      },
    ];
  }, [role, isAdmin]);

  return (
    <AccountListShell>
      <style>{responsiveCss}</style>

      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <LoadingScreen text="Loading dashboard..." />
      ) : (
        <div className="dashboard-root" style={dashboard}>
          <section className="dashboard-welcome" style={welcomeCard}>
            <div style={profileHero}>
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  style={avatar}
                />
              ) : (
                <div style={avatarFallback}>
                  {profile?.full_name?.slice(0, 1)?.toUpperCase() || "U"}
                </div>
              )}

              <h1 className="dashboard-welcome-title" style={welcomeTitle}>
                Hi, {firstName}!
              </h1>

              <p className="dashboard-welcome-text" style={welcomeText}>
                Find alumni, build meaningful mentorships, stay connected and
                discover what is happening next.
              </p>
            </div>
          </section>

          <div className="dashboard-main-layout" style={mainLayout}>
            <main className="dashboard-main-content">
              <div style={sectionHeader}>
                <p
                  className="dashboard-section-text"
                  style={sectionText}
                >
                  Explore your Alumnet space - connect with alumni, manage
                  mentorships, follow events and stay involved.
                </p>
              </div>

              <div className="dashboard-card-grid" style={cardGrid}>
                {cards.map((card) => (
                  <DashboardCard key={card.title} {...card} />
                ))}
              </div>

              <section className="dashboard-flow-card" style={flowCard}>
                <h2
                  className="dashboard-flow-title"
                  style={flowTitle}
                >
                  How Alumnet helps you
                </h2>

                <div
                  className="dashboard-flow-grid"
                  style={flowGrid}
                >
                  <FlowItem
                    number="01"
                    title="Discover"
                    text="Search alumni and find people with relevant experience."
                  />

                  <FlowItem
                    number="02"
                    title="Connect"
                    text="Send mentorship requests and build academic guidance links."
                  />

                  <FlowItem
                    number="03"
                    title="Engage"
                    text="Follow events and stay active in the university community."
                  />
                </div>
              </section>
            </main>

            <aside className="dashboard-side-column" style={sideColumn}>
              <EventCalendar
                events={events}
                calendarDate={calendarDate}
                setCalendarDate={setCalendarDate}
              />

              <UpcomingEvents events={events} />
            </aside>
          </div>
        </div>
      )}
    </AccountListShell>
  );
}

function DashboardCard({ title, text, to, icon: Icon, color }) {
  return (
    <Link
      to={to}
      className="dashboard-action-card"
      style={{
        ...dashboardCard,
        background: `linear-gradient(
          135deg,
          ${color},
          rgba(255,255,255,0.38)
        )`,
      }}
    >
      <div style={cardTop}>
        <div className="dashboard-icon-box" style={iconBox}>
          <Icon size={22} strokeWidth={1.7} />
        </div>

        <div style={arrowBox}>
          <ArrowRight size={16} strokeWidth={1.8} />
        </div>
      </div>

      <div>
        <h3 className="dashboard-card-title" style={cardTitle}>
          {title}
        </h3>

        <p className="dashboard-card-text" style={cardText}>
          {text}
        </p>
      </div>
    </Link>
  );
}

function EventCalendar({
  events,
  calendarDate,
  setCalendarDate,
}) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthName = calendarDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventMap = useMemo(() => {
    const map = {};

    events.forEach((event) => {
      const date = parseEventDate(event?.event_date);

      if (!date) return;

      if (
        date.getFullYear() === year &&
        date.getMonth() === month
      ) {
        const day = date.getDate();

        if (!map[day]) map[day] = [];

        map[day].push(event);
      }
    });

    return map;
  }, [events, year, month]);

  const cells = [
    ...Array(mondayOffset).fill(null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) => index + 1
    ),
  ];

  const today = new Date();

  return (
    <section
      className="dashboard-calendar-card"
      style={calendarCard}
    >
      <div style={calendarHeader}>
        <div>
          <div style={smallLabel}>Event calendar</div>

          <h3
            className="dashboard-calendar-title"
            style={calendarTitle}
          >
            {monthName}
          </h3>
        </div>

        <div style={calendarActions}>
          <button
            type="button"
            style={calendarButton}
            onClick={() =>
              setCalendarDate(
                new Date(year, month - 1, 1)
              )
            }
            aria-label="Previous month"
          >
            <ChevronLeft size={15} />
          </button>

          <button
            type="button"
            style={calendarButton}
            onClick={() =>
              setCalendarDate(
                new Date(year, month + 1, 1)
              )
            }
            aria-label="Next month"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="dashboard-week-row" style={weekRow}>
        {["M", "T", "W", "T", "F", "S", "S"].map(
          (day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          )
        )}
      </div>

      <div
        className="dashboard-calendar-grid"
        style={calendarGrid}
      >
        {cells.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`blank-${index}`}
                className="dashboard-day-cell"
                style={dayCell}
              />
            );
          }

          const dayEvents = eventMap[day] || [];
          const hasEvent = dayEvents.length > 0;

          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

          return (
            <div
              key={day}
              className="dashboard-day-cell"
              title={dayEvents
                .map((event) => event.title)
                .join(", ")}
              style={{
                ...dayCell,
                ...(hasEvent ? eventDayCell : {}),
                ...(isToday ? todayCell : {}),
              }}
            >
              <span>{day}</span>

              {hasEvent && (
                <span style={eventDot}>
                  {dayEvents.length}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <Link to="/events" style={calendarLink}>
        View all events
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}

function UpcomingEvents({ events }) {
  const upcoming = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return events
      .filter((event) => {
        const date = parseEventDate(event?.event_date);

        return date && date >= today;
      })
      .sort(
        (a, b) =>
          parseEventDate(a.event_date) -
          parseEventDate(b.event_date)
      )
      .slice(0, 3);
  }, [events]);

  return (
    <section
      className="dashboard-upcoming-card"
      style={upcomingCard}
    >
      <div style={upcomingHeader}>
        <div>
          <div style={smallLabel}>Coming up</div>

          <h3
            className="dashboard-upcoming-title"
            style={upcomingTitle}
          >
            Upcoming events
          </h3>
        </div>

        <CalendarDays size={20} strokeWidth={1.6} />
      </div>

      {upcoming.length === 0 ? (
        <p style={emptyText}>No upcoming events yet.</p>
      ) : (
        <div style={eventList}>
          {upcoming.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="dashboard-event-item"
              style={eventItem}
            >
              <div style={eventDateBox}>
                <span>{formatMonth(event.event_date)}</span>
                <strong>{formatDay(event.event_date)}</strong>
              </div>

              <div style={eventInfo}>
                <div style={eventTitle}>
                  {event.title}
                </div>

                <div style={eventMeta}>
                  {event.event_time && (
                    <span style={eventMetaLine}>
                      <Clock3 size={12} />
                      {formatTime(event.event_time)}
                    </span>
                  )}

                  {event.venue && (
                    <span style={eventMetaLine}>
                      <MapPin size={12} />
                      {event.venue}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function FlowItem({ number, title, text }) {
  return (
    <div className="dashboard-flow-item" style={flowItem}>
      <span style={flowNumber}>{number}</span>

      <h3 style={flowItemTitle}>{title}</h3>

      <p style={flowText}>{text}</p>
    </div>
  );
}

function parseEventDate(value) {
  if (!value) return null;

  const dateOnly = String(value).split("T")[0];

  const [year, month, day] = dateOnly
    .split("-")
    .map(Number);

  if ([year, month, day].every(Number.isFinite)) {
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? null
    : parsed;
}

function formatMonth(value) {
  const date = parseEventDate(value);

  return date
    ? date
        .toLocaleDateString("en-US", {
          month: "short",
        })
        .toUpperCase()
    : "";
}

function formatDay(value) {
  const date = parseEventDate(value);

  return date ? date.getDate() : "";
}

function formatTime(value) {
  const [hours, minutes] = String(value).split(":");

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes || 0),
    0,
    0
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const responsiveCss = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

.accountListShell:has(.dashboard-root) {
  background: transparent;
  border: 0;
  box-shadow: none;
  padding: 22px 34px 34px;
  overflow: visible;
}

.dashboard-root,
.dashboard-root * {
  box-sizing: border-box;
}

.dashboard-main-content {
  min-width: 0;
}

.dashboard-side-column {
  min-width: 0;
}

.dashboard-action-card {
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}

.dashboard-action-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 60px rgba(39,91,130,.14) !important;
}

.dashboard-calendar-card,
.dashboard-upcoming-card,
.dashboard-flow-card,
.dashboard-welcome,
.dashboard-action-card {
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

@media (max-width: 1180px) {
  .dashboard-main-layout {
    grid-template-columns:
      minmax(0, 1fr) 300px !important;
    gap: 24px !important;
  }

  .dashboard-card-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr)) !important;
  }
}

@media (max-width: 900px) {
  .dashboard-main-layout {
    grid-template-columns: 1fr !important;
  }

  .dashboard-side-column {
    display: grid !important;
    grid-template-columns:
      repeat(2, minmax(0, 1fr)) !important;
    gap: 18px !important;
  }
}

@media (max-width: 640px) {
  .dashboard-root {
    width: 100%;
    gap: 18px !important;
  }

  .dashboard-welcome {
    width: 100%;
    padding: 24px 18px !important;
    border-radius: 8px !important;
  }

  .dashboard-welcome-title {
    font-size: clamp(42px, 14vw, 64px) !important;
    line-height: .9 !important;
  }

  .dashboard-welcome-text {
    max-width: 300px !important;
    font-size: 13px !important;
    line-height: 1.55 !important;
  }

  .dashboard-main-layout {
    width: 100%;
    display: flex !important;
    flex-direction: column !important;
    gap: 18px !important;
  }

  .dashboard-main-content {
    display: contents;
  }

  .dashboard-main-content > div:first-child {
    order: 1;
  }

  .dashboard-card-grid {
    order: 2;
    width: 100%;
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }

  .dashboard-flow-card {
    order: 3;
  }

  .dashboard-side-column {
    order: 4;
    width: 100%;
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 14px !important;
  }

  .dashboard-section-text {
    padding: 13px 15px !important;
    border-radius: 15px !important;
    font-size: 13px !important;
  }

  .dashboard-action-card {
    width: 100%;
    min-height: 145px !important;
    padding: 17px !important;
    border-radius: 8px !important;
  }

  .dashboard-card-title {
    font-size: 16px !important;
  }

  .dashboard-card-text {
    font-size: 12px !important;
    line-height: 1.5 !important;
  }

  .dashboard-icon-box {
    width: 40px !important;
    height: 40px !important;
    border-radius: 8px !important;
  }

  .dashboard-calendar-card,
  .dashboard-upcoming-card {
    width: 100%;
    max-width: 100%;
    padding: 17px !important;
    border-radius: 8px !important;
    overflow: hidden;
  }

  .dashboard-calendar-title,
  .dashboard-upcoming-title {
    font-size: 17px !important;
  }

  .dashboard-week-row {
    gap: 2px !important;
    margin-top: 16px !important;
  }

  .dashboard-calendar-grid {
    width: 100%;
    gap: 2px !important;
    margin-top: 6px !important;
  }

  .dashboard-day-cell {
    width: 100%;
    min-width: 0;
    font-size: 11px !important;
  }

  .dashboard-event-item {
    grid-template-columns:
      44px minmax(0, 1fr) !important;
  }

  .dashboard-flow-card {
    width: 100%;
    margin-top: 0 !important;
    padding: 18px !important;
    border-radius: 8px !important;
  }

  .dashboard-flow-title {
    font-size: 34px !important;
  }

  .dashboard-flow-grid {
    grid-template-columns: 1fr !important;
    gap: 10px !important;
  }

  .dashboard-flow-item {
    padding: 15px !important;
  }
}

@media (max-width: 380px) {
  .dashboard-welcome {
    padding: 22px 14px !important;
  }

  .dashboard-welcome-title {
    font-size: 38px !important;
  }

  .dashboard-welcome-text {
    font-size: 12px !important;
  }

  .dashboard-calendar-card,
  .dashboard-upcoming-card {
    padding: 14px !important;
  }

  .dashboard-calendar-grid,
  .dashboard-week-row {
    gap: 1px !important;
  }

  .dashboard-day-cell {
    font-size: 10px !important;
  }

  .dashboard-action-card {
    min-height: 135px !important;
  }
}
`;

const dashboard = {
  display: "flex",
  flexDirection: "column",
  gap: 30,
};

const welcomeCard = {
  padding: "52px 32px 46px",
  borderRadius: 24,
  background:
    "linear-gradient(180deg, rgba(255,255,255,.34), rgba(255,255,255,.12))",
  border: "1px solid rgba(255,255,255,.58)",
  boxShadow: "0 22px 58px rgba(39,91,130,.10)",
};

const profileHero = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  gap: 8,
};

const avatar = {
  width: 78,
  height: 78,
  borderRadius: "50%",
  objectFit: "cover",
  background: "#ffffff",
  boxShadow: "0 16px 34px rgba(39,91,130,.18)",
};

const avatarFallback = {
  width: 78,
  height: 78,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#ffffff",
  color: "#111111",
  boxShadow: "0 16px 34px rgba(39,91,130,.18)",
  fontSize: 30,
  fontWeight: 700,
};

const welcomeTitle = {
  margin: "8px 0 0",
  color: COLORS.ink,
  fontFamily: '"Instrument Serif", serif',
  fontSize: "clamp(48px, 7vw, 92px)",
  lineHeight: .9,
  fontWeight: 400,
  letterSpacing: "-.055em",
};

const welcomeText = {
  maxWidth: 650,
  margin: "8px auto 0",
  color: "rgba(17,17,17,.68)",
  fontSize: 17,
  lineHeight: 1.5,
  letterSpacing: "-.02em",
};

const mainLayout = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 340px",
  gap: 34,
  alignItems: "start",
};

const sectionHeader = {
  marginBottom: 22,
};

const sectionText = {
  margin: 0,
  padding: "17px 20px",
  borderRadius: 16,
  background:
    "linear-gradient(90deg, rgba(255,255,255,.74), rgba(246,232,238,.56), rgba(207,231,247,.58))",
  border: "1px solid rgba(255,255,255,.62)",
  color: "rgba(17,17,17,.66)",
  fontSize: 15,
  lineHeight: 1.55,
  boxShadow: "0 14px 32px rgba(39,91,130,.08)",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
};

const dashboardCard = {
  minHeight: 174,
  borderRadius: 8,
  padding: 20,
  color: COLORS.ink,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,.70)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 18px 42px rgba(39,91,130,.10)",
  backdropFilter: "blur(14px)",
  backgroundBlendMode: "soft-light",
};

const cardTop = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const iconBox = {
  width: 43,
  height: 43,
  borderRadius: 8,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,.70)",
  color: "rgba(17,17,17,.72)",
  boxShadow:
    "inset 0 0 0 1px rgba(255,255,255,.35)",
};

const arrowBox = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,.70)",
};

const cardTitle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: COLORS.ink,
};

const cardText = {
  margin: "8px 0 0",
  fontSize: 13,
  lineHeight: 1.55,
  color: "rgba(17,17,17,.56)",
};

const sideColumn = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const calendarCard = {
  padding: 20,
  borderRadius: 8,
  background: COLORS.offWhite,
  border: "1px solid rgba(255,255,255,.66)",
  boxShadow: "0 18px 42px rgba(39,91,130,.10)",
};

const calendarHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const smallLabel = {
  color: "rgba(17,17,17,.45)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".08em",
  fontWeight: 700,
};

const calendarTitle = {
  margin: "5px 0 0",
  fontSize: 20,
  fontWeight: 700,
  color: COLORS.ink,
};

const calendarActions = {
  display: "flex",
  gap: 6,
};

const calendarButton = {
  width: 29,
  height: 29,
  borderRadius: "50%",
  border: "1px solid rgba(0,0,0,.08)",
  background: "rgba(255,255,255,.82)",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const weekRow = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 6,
  marginTop: 18,
  color: "rgba(17,17,17,.38)",
  fontSize: 11,
  textAlign: "center",
};

const calendarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  gap: 6,
  marginTop: 8,
};

const dayCell = {
  position: "relative",
  aspectRatio: "1 / 1",
  minWidth: 0,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  color: "rgba(17,17,17,.60)",
};

const eventDayCell = {
  background: "#fff",
  color: COLORS.ink,
  fontWeight: 700,
  boxShadow: `inset 0 0 0 2px ${COLORS.yellow}`,
};

const todayCell = {
  boxShadow: "inset 0 0 0 2px #111111",
};

const eventDot = {
  position: "absolute",
  top: -4,
  right: -2,
  minWidth: 15,
  height: 15,
  borderRadius: 999,
  background: "#fff",
  color: "#d32f2f",
  display: "grid",
  placeItems: "center",
  fontSize: 8,
  fontWeight: 800,
  boxShadow: "0 3px 8px rgba(17,17,17,.12)",
};

const calendarLink = {
  marginTop: 18,
  minHeight: 38,
  borderRadius: 999,
  background: "#111111",
  color: "#fff",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  fontSize: 12,
  fontWeight: 700,
};

const upcomingCard = {
  padding: 20,
  borderRadius: 8,
  background: COLORS.softWhite,
  border: "1px solid rgba(255,255,255,.66)",
  boxShadow: "0 18px 42px rgba(39,91,130,.10)",
};

const upcomingHeader = {
  display: "flex",
  justifyContent: "space-between",
  color: COLORS.ink,
};

const upcomingTitle = {
  margin: "5px 0 0",
  fontSize: 20,
  fontWeight: 700,
};

const eventList = {
  display: "flex",
  flexDirection: "column",
  gap: 9,
  marginTop: 15,
};

const eventItem = {
  display: "grid",
  gridTemplateColumns: "46px minmax(0, 1fr)",
  gap: 10,
  padding: 9,
  borderRadius: 8,
  background: "rgba(255,255,255,.76)",
  color: COLORS.ink,
  textDecoration: "none",
};

const eventDateBox = {
  borderRadius: 8,
  background: "rgba(246, 232, 238, 0.92)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
  fontSize: 9,
  fontWeight: 700,
};

const eventInfo = {
  minWidth: 0,
};

const eventTitle = {
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const eventMeta = {
  marginTop: 5,
  display: "flex",
  flexDirection: "column",
  gap: 3,
  color: "rgba(17,17,17,.48)",
  fontSize: 11,
};

const eventMetaLine = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const emptyText = {
  margin: "18px 0 0",
  color: "rgba(17,17,17,.48)",
  fontSize: 13,
};

const flowCard = {
  marginTop: 34,
  padding: 24,
  borderRadius: 8,
  background: COLORS.softWhite,
  border: "1px solid rgba(255,255,255,.66)",
  boxShadow: "0 18px 42px rgba(39,91,130,.10)",
};

const flowTitle = {
  margin: 0,
  fontFamily: '"Instrument Serif", serif',
  fontSize: 38,
  lineHeight: .96,
  fontWeight: 400,
  letterSpacing: "-.05em",
  color: COLORS.ink,
};

const flowGrid = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
};

const flowItem = {
  padding: 17,
  borderRadius: 8,
  background: "rgba(255,255,255,.72)",
  border: "1px solid rgba(255,255,255,.68)",
};

const flowNumber = {
  color: COLORS.plum,
  fontSize: 12,
  fontWeight: 800,
};

const flowItemTitle = {
  margin: "12px 0 0",
  fontSize: 16,
  fontWeight: 700,
};

const flowText = {
  margin: "7px 0 0",
  color: "rgba(17,17,17,.52)",
  fontSize: 13,
  lineHeight: 1.5,
};

const errorBox = {
  marginBottom: 14,
  padding: "12px 14px",
  borderRadius: 12,
  background: "#fee8e8",
  color: "#b42318",
  fontSize: 13,
};
