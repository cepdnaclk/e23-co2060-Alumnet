import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Home,
  Users,
  Calendar,
  User,
  Mail,
  LogOut,
  GraduationCap,
  PlusSquare,
  ClipboardCheck,
  Pencil,
  MessageCircle,
  Bell,
} from "lucide-react";

import logo from "../assets/alumnet-logo.png";
import { getProfile, getMyNotifications, markNotificationAsRead } from "../api";
import { supabase } from "../supabase";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [role, setRole] = useState("");
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    try {
      if (token) {
        const decoded = jwtDecode(token);
        setRole(decoded?.role || "");
      } else {
        setRole("");
      }
    } catch {
      setRole("");
    }
  }, [token]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!token) {
          setProfile(null);
          return;
        }

        const data = await getProfile(token);
        setProfile(data);
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, [token, location.pathname]);

  useEffect(() => {
    let subscription;

    const loadNotifications = async () => {
      try {
        if (!token || !profile?.id) return;

        const data = await getMyNotifications(token);
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);

        subscription = supabase
          .channel("public:notifications")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${profile.id}`,
            },
            (payload) => {
              console.log("Live Notification Received!", payload);
              setNotifications((prev) => [payload.new, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
          )
          .subscribe((status) => {
            console.log("Supabase Realtime Status:", status);
          });
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [token, profile?.id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isStudent = role === "student";
  const isAlumni = role === "alumni";
  const isAdmin = role === "university_admin" || role === "system_admin";

  const homePath = token ? "/home" : "/";

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.is_read) {
        await markNotificationAsRead(token, notif.id);

        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setShowNotifications(false);

      if (notif.type === "MENTOR_REQUEST") navigate("/mentor-requests");
      else if (notif.type === "REQUEST_UPDATE") navigate("/my-mentors");
      else if (notif.type === "EVENT_UPDATE" || notif.type === "EVENT_REGISTRATION") navigate("/my-events");

    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <>
      <style>{css}</style>

      <aside className="sidebar">
        <div>
          <div className="sidebarHeader">
            <button className="logoBtn" onClick={() => navigate(homePath)}>
              <img src={logo} alt="Alumnet" className="logo" />
            </button>

            {token && (
              <div className="notifWrapper">
                <button
                  className="bellBtn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  type="button"
                >
                  <Bell size={20} strokeWidth={1.9} />
                  {unreadCount > 0 && <span className="notifBadge">{unreadCount}</span>}
                </button>

                {showNotifications && (
                  <div className="notifDropdown">
                    <div className="notifHeader">
                      <h3>Notifications</h3>
                    </div>
                    <div className="notifList">
                      {notifications.length === 0 ? (
                        <div className="notifEmpty">No new notifications</div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`notifItem ${!notif.is_read ? "unread" : ""}`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="notifTitle">{notif.title}</div>
                            <div className="notifMessage">{notif.message}</div>
                            <div className="notifTime">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {token && (
            <button
              className="profileMini"
              onClick={() => navigate("/profile")}
              type="button"
            >
              {profile?.avatar_url ? (
                <img
                  src={`${profile.avatar_url}${
                    profile.avatar_url.includes("?") ? "&" : "?"
                  }t=${Date.now()}`}
                  alt="avatar"
                  className="profileMiniAvatar"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextSibling;
                    if (fallback) fallback.style.display = "grid";
                  }}
                />
              ) : null}

              <div
                className="profileMiniAvatarFallback"
                style={{ display: profile?.avatar_url ? "none" : "grid" }}
              >
                {profile?.full_name?.slice(0, 1)?.toUpperCase() || "U"}
              </div>

              <div className="profileMiniText">
                <div className="profileMiniName">
                  {profile?.full_name || "User"}
                </div>
                <div className="profileMiniRole">
                  {isStudent
                    ? "Student"
                    : isAlumni
                    ? "Alumni"
                    : role === "university_admin"
                    ? "University Admin"
                    : role === "system_admin"
                    ? "System Admin"
                    : role}
                </div>
              </div>
            </button>
          )}

          <nav className="navLinks">
            <NavLink
              to={homePath}
              className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
            >
              <Home size={17} strokeWidth={1.9} />
              Home
            </NavLink>

            <NavLink
              to="/directory"
              className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
            >
              <Users size={17} strokeWidth={1.9} />
              Directory
            </NavLink>

            <NavLink
              to="/chat"
              className={({ isActive }) =>
                `navItem ${isActive ? "active" : ""}`
              }
            >
              <MessageCircle size={17} strokeWidth={1.9} />
              Chat
            </NavLink>

            <NavLink
              to="/events"
              className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
            >
              <Calendar size={17} strokeWidth={1.9} />
              Events
            </NavLink>

            <div className="navGroupLabel">My Account</div>

            <NavLink
              to="/profile"
              className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
            >
              <User size={17} strokeWidth={1.9} />
              My Profile
            </NavLink>

            <NavLink
              to="/edit-profile"
              className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
            >
              <Pencil size={17} strokeWidth={1.9} />
              Edit Profile
            </NavLink>

            {isStudent && (
              <>
                <NavLink
                  to="/my-requests"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <Mail size={17} strokeWidth={1.9} />
                  My Requests
                </NavLink>

                <NavLink
                  to="/my-mentors"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <GraduationCap size={17} strokeWidth={1.9} />
                  My Mentors
                </NavLink>

                <NavLink
                  to="/my-events"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <Calendar size={17} strokeWidth={1.9} />
                  My Events
                </NavLink>
              </>
            )}

            {isAlumni && (
              <>
                <NavLink
                  to="/mentor-requests"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <Mail size={17} strokeWidth={1.9} />
                  Mentor Requests
                </NavLink>

                <NavLink
                  to="/my-mentees"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <GraduationCap size={17} strokeWidth={1.9} />
                  My Mentees
                </NavLink>

                <NavLink
                  to="/create-event"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <PlusSquare size={17} strokeWidth={1.9} />
                  Create Event
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <ClipboardCheck size={17} strokeWidth={1.9} />
                  Admin Dashboard
                </NavLink>

                <NavLink
                  to="/admin-events"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <ClipboardCheck size={17} strokeWidth={1.9} />
                  Event Approvals
                </NavLink>

                <NavLink
                  to="/create-event"
                  className={({ isActive }) => `navItem ${isActive ? "active" : ""}`}
                >
                  <PlusSquare size={17} strokeWidth={1.9} />
                  Create Event
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {token && (
          <button className="logoutBtn" onClick={handleLogout} type="button">
            <LogOut size={17} strokeWidth={1.9} />
            Log Out
          </button>
        )}
      </aside>
    </>
  );
};

export default Navbar;

const css = `
.sidebar{
  position:fixed;
  left:18px;
  top:18px;
  bottom:18px;
  width:238px;
  background:rgba(250,249,246,0.78);
  border:1px solid rgba(0,0,0,0.06);
  border-radius:28px;
  padding:18px 14px 14px;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  font-family:"Google Sans", Arial, sans-serif;
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  box-shadow:0 10px 30px rgba(0,0,0,0.04);
  z-index:100;
}

.logoBtn{
  display:flex;
  align-items:center;
  gap:10px;
  width:100%;
  padding:6px 6px 14px;
  margin-bottom:6px;
  color:#111111;
  text-align:left;
}

.logo{
  width:100px;
  height:30px;
  object-fit:contain;
}

.profileMini{
  display:flex;
  align-items:center;
  gap:10px;
  width:100%;
  padding:10px;
  border-radius:18px;
  background:rgba(255,255,255,0.72);
  border:1px solid rgba(0,0,0,0.05);
  margin-bottom:14px;
  cursor:pointer;
  text-align:left;
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
}

.profileMini:hover{
  transform:translateY(-1px);
  box-shadow:0 8px 18px rgba(0,0,0,0.04);
}

.profileMiniAvatar,
.profileMiniAvatarFallback{
  width:42px;
  height:42px;
  border-radius:50%;
  object-fit:cover;
  flex-shrink:0;
}

.profileMiniAvatarFallback{
  display:grid;
  place-items:center;
  background:#ecebe7;
  color:#111111;
  font-size:14px;
}

.profileMiniText{
  min-width:0;
}

.profileMiniName{
  font-size:13px;
  color:#111111;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.profileMiniRole{
  font-size:12px;
  color:rgba(17,17,17,0.52);
  margin-top:2px;
}

.navLinks{
  display:flex;
  flex-direction:column;
  gap:2px;
}

.navGroupLabel{
  margin:10px 8px 6px;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:0.08em;
  color:rgba(17,17,17,0.42);
}

.navItem{
  display:flex;
  align-items:center;
  gap:10px;
  text-decoration:none;
  color:#111111;
  padding:10px 12px;
  border-radius:14px;
  font-size:14px;
  font-weight:400;
  font-family:"Google Sans", Arial, sans-serif;
  transition:transform .18s ease, background .18s ease, box-shadow .18s ease, color .18s ease, border-color .18s ease;
  border:1px solid transparent;
}

.navItem:hover{
  background:rgba(255,255,255,0.68);
  transform:translateY(-1px);
}

.navItem.active{
  background:rgba(255,255,255,0.68);
  color:#111111;
  border:1px solid rgba(0,0,0,0.06);
  box-shadow:0 8px 18px rgba(0,0,0,0.035);
}

.logoutBtn{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  width:100%;
  border:none;
  background:rgba(255,255,255,0.72);
  color:#111111;
  padding:12px;
  border-radius:999px;
  cursor:pointer;
  font-weight:400;
  font-size:14px;
  font-family:"Google Sans", Arial, sans-serif;
  border:1px solid rgba(0,0,0,0.06);
  transition:transform .18s ease, box-shadow .18s ease, opacity .18s ease, background .18s ease;
}

.logoutBtn:hover{
  transform:translateY(-1px);
  box-shadow:0 10px 20px rgba(0,0,0,0.05);
  background:rgba(255,255,255,0.9);
}

.sidebarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.logoBtn {
  margin-bottom: 0 !important; /* Override previous margin */
  padding: 0 !important;
}

.notifWrapper {
  position: relative;
}

.bellBtn {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #111;
  position: relative;
  transition: all 0.2s ease;
}

.bellBtn:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.notifBadge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #e63946;
  color: white;
  font-size: 10px;
  font-weight: bold;
  height: 16px;
  min-width: 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid #faf9f6;
}

.notifDropdown {
  position: absolute;
  top: 0;
  left: calc(100% + 14px); /* Pushes it outside the sidebar to the right */
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  z-index: 999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 400px;
}

.notifHeader {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.notifHeader h3 {
  margin: 0;
  font-size: 14px;
  color: #111;
}

.notifList {
  overflow-y: auto;
  padding: 8px 0;
}

.notifEmpty {
  padding: 24px;
  text-align: center;
  color: rgba(17, 17, 17, 0.5);
  font-size: 13px;
}

.notifItem {
  padding: 12px 20px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: background 0.2s ease;
}

.notifItem:hover {
  background: rgba(0, 0, 0, 0.02);
}

.notifItem.unread {
  background: rgba(0, 102, 255, 0.04);
  border-left-color: #0066ff;
}

.notifTitle {
  font-size: 13px;
  font-weight: 600;
  color: #111;
  margin-bottom: 4px;
}

.notifMessage {
  font-size: 12px;
  color: rgba(17, 17, 17, 0.7);
  line-height: 1.4;
  margin-bottom: 6px;
}

.notifTime {
  font-size: 10px;
  color: rgba(17, 17, 17, 0.4);
}

@media (max-width:900px){
  .sidebar{
    width:212px;
    left:12px;
    top:12px;
    bottom:12px;
  }

  .navItem{
    font-size:13px;
  }
}
`;