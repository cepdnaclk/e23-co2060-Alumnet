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
  blue: "rgba(184, 196, 220, 0.68)",
  sage: "rgba(171, 200, 184, 0.68)",
  peach: "rgba(233, 173, 140, 0.68)",
  cream: "rgba(217, 203, 167, 0.70)",
  lavender: "rgba(197, 191, 210, 0.70)",
  pink: "rgba(230, 177, 207, 0.68)",
  yellow: "rgba(234, 223, 119, 0.72)",
  plum: "#4b304b",
  ink: "#111111",
  offWhite: "#f7f4ee",
  softWhite: "#fbfaf7",
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
  const isAdmin = role === "university_admin" || role === "system_admin";

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

  const firstName = profile?.full_name?.trim()?.split(/\s+/)?.[0] || "there";

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
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <LoadingScreen text="Loading dashboard..." />
      ) : (
        <div style={dashboard}>
          <section style={welcomeCard}>
            <div style={profileHero}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={avatar} />
              ) : (
                <div style={avatarFallback}>
                  {profile?.full_name?.slice(0, 1)?.toUpperCase() || "U"}
                </div>
              )}

              <h1 style={welcomeTitle}>Hi, {firstName}!</h1>

              <p style={welcomeText}>
                Find alumni, build meaningful mentorships, stay connected and
                discover what is happening next.
              </p>
            </div>
          </section>

          <div style={mainLayout}>
            <main>
              <div style={sectionHeader}>
                <p style={sectionText}>
                  Explore your Alumnet space — connect with alumni, manage
                  mentorships, follow events and stay involved.
                </p>
              </div>

              <div style={cardGrid}>
                {cards.map((card) => (
                  <DashboardCard key={card.title} {...card} />
                ))}
              </div>

              <section style={flowCard}>
                <h2 style={flowTitle}>How Alumnet helps you</h2>

                <div style={flowGrid}>
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

            <aside style={sideColumn}>
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
      style={{
        ...dashboardCard,
        background: `linear-gradient(135deg, ${color}, rgba(255,255,255,0.38))`,
      }}
    >
      <div style={cardTop}>
        <div style={iconBox}>
          <Icon size={22} strokeWidth={1.7} />
        </div>
        <div style={arrowBox}>
          <ArrowRight size={16} strokeWidth={1.8} />
        </div>
      </div>

      <div>
        <h3 style={cardTitle}>{title}</h3>
        <p style={cardText}>{text}</p>
      </div>
    </Link>
  );
}

function EventCalendar({ events, calendarDate, setCalendarDate }) {
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

      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = date.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(event);
      }
    });

    return map;
  }, [events, year, month]);

  const cells = [
    ...Array(mondayOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();

  return (
    <section style={calendarCard}>
      <div style={calendarHeader}>
        <div>
          <div style={smallLabel}>Event calendar</div>
          <h3 style={calendarTitle}>{monthName}</h3>
        </div>

        <div style={calendarActions}>
          <button
            type="button"
            style={calendarButton}
            onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            style={calendarButton}
            onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
            aria-label="Next month"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div style={weekRow}>
        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div style={calendarGrid}>
        {cells.map((day, index) => {
          if (!day) return <div key={`blank-${index}`} style={dayCell} />;

          const dayEvents = eventMap[day] || [];
          const hasEvent = dayEvents.length > 0;

          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

          return (
            <div
              key={day}
              title={dayEvents.map((event) => event.title).join(", ")}
              style={{
                ...dayCell,
                ...(hasEvent ? eventDayCell : {}),
                ...(isToday ? todayCell : {}),
              }}
            >
              <span>{day}</span>
              {hasEvent && <span style={eventDot}>{dayEvents.length}</span>}
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
        (a, b) => parseEventDate(a.event_date) - parseEventDate(b.event_date)
      )
      .slice(0, 3);
  }, [events]);

  return (
    <section style={upcomingCard}>
      <div style={upcomingHeader}>
        <div>
          <div style={smallLabel}>Coming up</div>
          <h3 style={upcomingTitle}>Upcoming events</h3>
        </div>
        <CalendarDays size={20} strokeWidth={1.6} />
      </div>

      {upcoming.length === 0 ? (
        <p style={emptyText}>No upcoming events yet.</p>
      ) : (
        <div style={eventList}>
          {upcoming.map((event) => (
            <Link key={event.id} to={`/events/${event.id}`} style={eventItem}>
              <div style={eventDateBox}>
                <span>{formatMonth(event.event_date)}</span>
                <strong>{formatDay(event.event_date)}</strong>
              </div>

              <div style={eventInfo}>
                <div style={eventTitle}>{event.title}</div>

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
    <div style={flowItem}>
      <span style={flowNumber}>{number}</span>
      <h3 style={flowItemTitle}>{title}</h3>
      <p style={flowText}>{text}</p>
    </div>
  );
}

function parseEventDate(value) {
  if (!value) return null;

  const dateOnly = String(value).split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);

  if ([year, month, day].every(Number.isFinite)) {
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatMonth(value) {
  const date = parseEventDate(value);
  return date
    ? date.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
    : "";
}

function formatDay(value) {
  const date = parseEventDate(value);
  return date ? date.getDate() : "";
}

function formatTime(value) {
  const [hours, minutes] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes || 0), 0, 0);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const dashboard = {
  display: "flex",
  flexDirection: "column",
  gap: 34,
};

const welcomeCard = {
  padding: "34px 32px",
  borderRadius: 28,
  background: "#fafbfc",
  border: "1px solid rgba(0,0,0,.06)",
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
  background: "#ecebe7",
  boxShadow: "0 10px 24px rgba(0,0,0,.14)",
};

const avatarFallback = {
  width: 78,
  height: 78,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#ecebe7",
  color: "#111111",
  boxShadow: "0 10px 24px rgba(0,0,0,.14)",
  fontSize: 30,
  fontWeight: 700,
};

const welcomeTitle = {
  margin: "8px 0 0",
  color: COLORS.ink,
  fontSize: 26,
  lineHeight: 1.15,
  fontWeight: 650,
  letterSpacing: "-.03em",
};

const welcomeText = {
  maxWidth: 680,
  margin: "2px auto 0",
  color: "rgba(17,17,17,.54)",
  fontSize: 14,
  lineHeight: 1.65,
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
  padding: "14px 18px",
  borderRadius: 18,
  background:
    "linear-gradient(90deg, rgba(232,177,207,.25), rgba(171,200,184,.25), rgba(234,223,119,.22))",
  color: "rgba(17,17,17,.58)",
  fontSize: 14,
  lineHeight: 1.55,
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 18,
};

const dashboardCard = {
  minHeight: 165,
  borderRadius: 22,
  padding: 18,
  color: COLORS.ink,
  textDecoration: "none",
  border: "1px solid rgba(255,255,255,.55)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 18px 38px rgba(17,17,17,.055)",
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
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,.58)",
  color: "rgba(17,17,17,.72)",
  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.35)",
};

const arrowBox = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "rgba(255,255,255,.58)",
};

const cardTitle = {
  margin: 0,
  fontSize: 17,
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
  borderRadius: 24,
  background: COLORS.offWhite,
  border: "1px solid rgba(0,0,0,.06)",
  boxShadow: "0 14px 32px rgba(17,17,17,.045)",
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
  fontSize: 18,
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
  background: "#fff",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const weekRow = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 6,
  marginTop: 18,
  color: "rgba(17,17,17,.38)",
  fontSize: 11,
  textAlign: "center",
};

const calendarGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 6,
  marginTop: 8,
};

const dayCell = {
  position: "relative",
  aspectRatio: "1 / 1",
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
  borderRadius: 24,
  background: COLORS.softWhite,
  border: "1px solid rgba(0,0,0,.06)",
  boxShadow: "0 14px 32px rgba(17,17,17,.035)",
};

const upcomingHeader = {
  display: "flex",
  justifyContent: "space-between",
  color: COLORS.ink,
};

const upcomingTitle = {
  margin: "5px 0 0",
  fontSize: 18,
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
  borderRadius: 15,
  background: "#fff",
  color: COLORS.ink,
  textDecoration: "none",
};

const eventDateBox = {
  borderRadius: 12,
  background: "rgba(230, 177, 207, 0.72)",
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
  borderRadius: 24,
  background: COLORS.softWhite,
  border: "1px solid rgba(0,0,0,.06)",
};

const flowTitle = {
  margin: 0,
  fontSize: 21,
  fontWeight: 700,
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
  borderRadius: 18,
  background: "#fff",
  border: "1px solid rgba(0,0,0,.05)",
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
