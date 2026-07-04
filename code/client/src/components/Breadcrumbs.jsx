import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAlumniProfile, getEventById } from "../api";

export default function Breadcrumbs() {
  const location = useLocation();
  const [alumniName, setAlumniName] = useState(location.state?.alumniName || "");
  const [eventTitle, setEventTitle] = useState(location.state?.eventTitle || "");

  const path = location.pathname;
  const alumniId = getAlumniId(path);
  const eventId = getEventId(path);

  useEffect(() => {
    let cancelled = false;

    const loadAlumniName = async () => {
      if (!alumniId) {
        setAlumniName("");
        return;
      }

      if (location.state?.alumniName) {
        setAlumniName(location.state.alumniName);
        return;
      }

      try {
        const profile = await getAlumniProfile(alumniId);
        if (!cancelled) setAlumniName(profile.full_name || "Alumni Profile");
      } catch {
        if (!cancelled) setAlumniName("Alumni Profile");
      }
    };

    loadAlumniName();

    return () => {
      cancelled = true;
    };
  }, [alumniId, location.state]);

  useEffect(() => {
    let cancelled = false;

    const loadEventTitle = async () => {
      if (!eventId) {
        setEventTitle("");
        return;
      }

      if (location.state?.eventTitle) {
        setEventTitle(location.state.eventTitle);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const event = await getEventById(token, eventId);
        if (!cancelled) setEventTitle(event.title || "Event Details");
      } catch {
        if (!cancelled) setEventTitle("Event Details");
      }
    };

    loadEventTitle();

    return () => {
      cancelled = true;
    };
  }, [eventId, location.state]);

  const crumbs = useMemo(
    () => buildCrumbs(path, alumniName, alumniId, eventTitle),
    [path, alumniName, alumniId, eventTitle]
  );

  if (crumbs.length === 0) return null;

  return (
    <>
      <style>{css}</style>
      <nav className="appBreadcrumbs" aria-label="Breadcrumb">
        <ol>
          {crumbs.map((crumb, index) => {
            const isCurrent = index === crumbs.length - 1;

            return (
              <li key={`${crumb.label}-${index}`}>
                {index > 0 && <span className="breadcrumbSeparator">/</span>}
                {crumb.to && !isCurrent ? (
                  <Link to={crumb.to}>{crumb.label}</Link>
                ) : (
                  <span className={isCurrent ? "current" : ""}>{crumb.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

function getAlumniId(path) {
  const directoryMatch = path.match(/^\/directory\/([^/]+)$/);
  if (directoryMatch) return directoryMatch[1];

  const requestMatch = path.match(/^\/request-mentorship\/([^/]+)$/);
  if (requestMatch) return requestMatch[1];

  return "";
}

function getEventId(path) {
  const eventMatch = path.match(/^\/events\/([^/]+)$/);
  if (eventMatch) return eventMatch[1];

  return "";
}

function buildCrumbs(path, alumniName, alumniId, eventTitle) {
  if (path === "/home") return [{ label: "Home" }];
  if (path === "/profile") return [{ label: "Profile" }];
  if (path === "/edit-profile") {
    return [
      { label: "Profile", to: "/profile" },
      { label: "Edit Profile" },
    ];
  }
  if (path === "/directory") return [{ label: "Directory" }];
  if (path.startsWith("/directory/")) {
    return [
      { label: "Directory", to: "/directory" },
      { label: alumniName || "Alumni Profile" },
    ];
  }
  if (path.startsWith("/request-mentorship/")) {
    return [
      { label: "Directory", to: "/directory" },
      {
        label: alumniName || "Alumni Profile",
        to: alumniId ? `/directory/${alumniId}` : "/directory",
      },
      { label: "Request Mentorship" },
    ];
  }
  if (path === "/chat") return [{ label: "Chat" }];
  if (path === "/events") return [{ label: "Events" }];
  if (path.startsWith("/events/")) {
    return [
      { label: "Events", to: "/events" },
      { label: eventTitle || "Event Details" },
    ];
  }
  if (path === "/create-event") {
    return [
      { label: "Events", to: "/events" },
      { label: "Create Event" },
    ];
  }
  if (path === "/my-events") {
    return [
      { label: "Events", to: "/events" },
      { label: "My Events" },
    ];
  }
  if (path === "/my-created-events") {
    return [
      { label: "Events", to: "/events" },
      { label: "My Created Events" },
    ];
  }
  if (path === "/my-requests") return [{ label: "My Requests" }];
  if (path === "/mentor-requests") return [{ label: "Mentor Requests" }];
  if (path === "/my-mentors") return [{ label: "My Mentors" }];
  if (path === "/my-mentees") return [{ label: "My Mentees" }];
  if (path === "/admin") return [{ label: "Admin Dashboard" }];
  if (path === "/admin-users") {
    return [
      { label: "Admin Dashboard", to: "/admin" },
      { label: "User Verifications" },
    ];
  }
  if (path === "/admin-events") {
    return [
      { label: "Admin Dashboard", to: "/admin" },
      { label: "Event Approvals" },
    ];
  }

  return [];
}

const css = `
.appBreadcrumbs{
  width:100%;
  padding:8px 28px;
  font-family:"Google Sans";
  color:rgba(17,17,17,.58);
  font-size:13px;
  line-height:1;
  position:sticky;
  top:72px;
  z-index:90;
  background:rgba(255,255,255,.68);
  border-bottom:1px solid rgba(0,0,0,.06);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
}

.appBreadcrumbs ol{
  width:min(1180px, 100%);
  margin:0 auto;
  display:flex;
  align-items:center;
  flex-wrap:wrap;
  gap:0;
  list-style:none;
  padding:0;
}

.appBreadcrumbs li{
  display:inline-flex;
  align-items:center;
  min-width:0;
}

.appBreadcrumbs a,
.appBreadcrumbs span{
  color:rgba(17,17,17,.48);
  text-decoration:none;
  font-size:13px;
  line-height:1;
}

.appBreadcrumbs a{
  transition:color .18s ease;
}

.appBreadcrumbs a:hover{
  color:rgba(17,17,17,.72);
}

.appBreadcrumbs .current{
  color:#111111;
  font-weight:600;
}

.breadcrumbSeparator{
  margin:0 9px;
  color:rgba(17,17,17,.28) !important;
}

@media (max-width:640px){
  .appBreadcrumbs{
    padding:8px 16px;
    top:116px;
  }
}
`;
