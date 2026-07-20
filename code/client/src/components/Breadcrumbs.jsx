import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getAlumniProfile, getEventById, getStudentProfile } from "../api";

export default function Breadcrumbs() {
  const location = useLocation();
  const [alumniName, setAlumniName] = useState(location.state?.alumniName || "");
  const [studentName, setStudentName] = useState(location.state?.studentName || "");
  const [eventTitle, setEventTitle] = useState(location.state?.eventTitle || "");
  const [chatName, setChatName] = useState("");

  const path = location.pathname;
  const alumniId = getAlumniId(path);
  const studentId = getStudentId(path);
  const eventId = getEventId(path);
  const fromMyCreatedEvents = Boolean(location.state?.fromMyCreatedEvents);
  const fromMyEvents = Boolean(location.state?.fromMyEvents);
  const fromMyMentors = Boolean(location.state?.fromMyMentors);
  const fromMentorRequests = Boolean(location.state?.fromMentorRequests);
  const fromMyMentees = Boolean(location.state?.fromMyMentees);

  useEffect(() => {
    if (path !== "/chat") {
      setChatName("");
      return undefined;
    }

    const handleChatSelection = (event) => {
      setChatName(event.detail?.name || "");
    };

    window.addEventListener("alumnet:chat-selection-changed", handleChatSelection);
    return () => {
      window.removeEventListener("alumnet:chat-selection-changed", handleChatSelection);
    };
  }, [path]);

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

    const loadStudentName = async () => {
      if (!studentId) {
        setStudentName("");
        return;
      }

      if (location.state?.studentName) {
        setStudentName(location.state.studentName);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const profile = await getStudentProfile(token, studentId);
        if (!cancelled) setStudentName(profile.full_name || "Student Profile");
      } catch {
        if (!cancelled) setStudentName("Student Profile");
      }
    };

    loadStudentName();

    return () => {
      cancelled = true;
    };
  }, [studentId, location.state]);

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
    () =>
      buildCrumbs(
        path,
        alumniName,
        alumniId,
        studentName,
        studentId,
        eventTitle,
        chatName,
        fromMyCreatedEvents,
        fromMyEvents,
        fromMyMentors,
        fromMentorRequests,
        fromMyMentees
      ),
    [
      path,
      alumniName,
      alumniId,
      studentName,
      studentId,
      eventTitle,
      chatName,
      fromMyCreatedEvents,
      fromMyEvents,
      fromMyMentors,
      fromMentorRequests,
      fromMyMentees,
    ]
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

  const endMatch = path.match(/^\/end-mentorship\/([^/]+)$/);
  if (endMatch) return endMatch[1];

  return "";
}

function getStudentId(path) {
  const studentMatch = path.match(/^\/students\/([^/]+)$/);
  if (studentMatch) return studentMatch[1];

  return "";
}

function getEventId(path) {
  const eventMatch = path.match(/^\/events\/([^/]+)(?:\/edit)?$/);
  if (eventMatch) return eventMatch[1];

  return "";
}

function buildCrumbs(
  path,
  alumniName,
  alumniId,
  studentName,
  studentId,
  eventTitle,
  chatName,
  fromMyCreatedEvents,
  fromMyEvents,
  fromMyMentors,
  fromMentorRequests,
  fromMyMentees
) {
  if (path === "/home") return [{ label: "Home" }];
  if (path === "/profile") return [{ label: "Profile" }];
  if (path === "/settings") return [{ label: "Settings" }];
  if (path === "/settings/email-notifications") {
    return [
      { label: "Settings", to: "/settings" },
      { label: "Notification Preferences" },
    ];
  }
  if (path === "/edit-profile") {
    return [
      { label: "Settings", to: "/settings" },
      { label: "Edit Profile" },
    ];
  }
  if (path === "/directory") return [{ label: "Directory" }];
  if (path.startsWith("/directory/")) {
    if (fromMyMentors) {
      return [
        { label: "My Mentors", to: "/my-mentors" },
        { label: alumniName || "Alumni Profile" },
      ];
    }

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
  if (path.startsWith("/end-mentorship/")) {
    return [
      { label: "My Mentors", to: "/my-mentors" },
      {
        label: alumniName || "Alumni Profile",
        to: alumniId ? `/directory/${alumniId}` : "/my-mentors",
      },
      { label: "End Mentorship" },
    ];
  }
  if (path.startsWith("/students/")) {
    if (fromMyMentees) {
      return [
        { label: "My Mentees", to: "/my-mentees" },
        { label: studentName || "Student Profile" },
      ];
    }

    if (fromMentorRequests) {
      return [
        { label: "Received Requests", to: "/mentor-requests" },
        { label: studentName || "Student Profile" },
      ];
    }

    return [{ label: studentName || "Student Profile" }];
  }
  if (path === "/chat") {
    return chatName
      ? [{ label: "Chat", to: "/chat" }, { label: chatName }]
      : [{ label: "Chat" }];
  }
  if (path === "/events") return [{ label: "Events" }];
  if (path.startsWith("/events/")) {
    if (fromMyEvents) {
      return [
        { label: "Events", to: "/events" },
        { label: "My Events", to: "/my-events" },
        ...(path.endsWith("/edit")
          ? [
              { label: eventTitle || "Event Details", to: path.replace(/\/edit$/, "") },
              { label: "Edit Event" },
            ]
          : [{ label: eventTitle || "Event Details" }]),
      ];
    }

    if (fromMyCreatedEvents) {
      return [
        { label: "Events", to: "/events" },
        { label: "My Events", to: "/my-created-events" },
        ...(path.endsWith("/edit")
          ? [
              { label: eventTitle || "Event Details", to: path.replace(/\/edit$/, "") },
              { label: "Edit Event" },
            ]
          : [{ label: eventTitle || "Event Details" }]),
      ];
    }

    return [
      { label: "Events", to: "/events" },
      ...(path.endsWith("/edit")
        ? [
            { label: eventTitle || "Event Details", to: path.replace(/\/edit$/, "") },
            { label: "Edit Event" },
          ]
        : [{ label: eventTitle || "Event Details" }]),
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
      { label: "My Events" },
    ];
  }
  if (path === "/my-requests") return [{ label: "My Requests" }];
  if (path === "/mentor-requests") return [{ label: "Received Requests" }];
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
  padding:0 60px 10px;
  font-family:"Google Sans";
  color:rgba(17,17,17,.58);
  font-size:13px;
  line-height:1;
  position:relative;
  z-index:1;
  background:transparent;
  display:flex;
  justify-content:center;
}

.appBreadcrumbs ol{
  width:fit-content;
  max-width:min(1260px, 100%);
  margin:0 auto;
  display:inline-flex;
  align-items:center;
  flex-wrap:wrap;
  gap:0;
  list-style:none;
  padding:0;
  border-radius:999px;
  background:transparent;
  box-shadow:none;
}

.appBreadcrumbs li{
  display:inline-flex;
  align-items:center;
  min-width:0;
}

.appBreadcrumbs a,
.appBreadcrumbs span{
  display:inline-flex;
  align-items:center;
  min-height:22px;
  color:rgba(17,17,17,.70);
  text-decoration:none;
  font-size:12px;
  line-height:1;
  white-space:nowrap;
}

.appBreadcrumbs a{
  padding:0 2px;
  transition:color .18s ease, opacity .18s ease;
}

.appBreadcrumbs a:hover{
  color:#111111;
}

.appBreadcrumbs .current{
  min-height:24px;
  padding:0 9px;
  border-radius:999px;
  background:#ffffff;
  color:#111111;
  font-weight:500;
  box-shadow:0 10px 24px rgba(0,0,0,.16), 0 2px 7px rgba(0,0,0,.08);
}

.breadcrumbSeparator{
  margin:0 7px;
  color:rgba(17,17,17,.34) !important;
}

@media (max-width:640px){
  .appBreadcrumbs{
    padding:0 16px 10px;
  }

  .appBreadcrumbs ol{
    max-width:100%;
    overflow-x:auto;
    flex-wrap:nowrap;
  }
}
`;
