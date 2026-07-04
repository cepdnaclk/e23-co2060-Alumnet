import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Bell,
  Calendar,
  ChevronDown,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  Pencil,
  PlusSquare,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import logo from "../assets/alumnet-logo.png";
import {
  getChatContacts,
  getMyNotifications,
  getProfile,
  markNotificationAsRead,
} from "../api";
import { supabase } from "../supabase";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [role, setRole] = useState("");
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    try {
      setRole(token ? jwtDecode(token)?.role || "" : "");
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

        setProfile(await getProfile(token));
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
              setNotifications((prev) => [payload.new, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [token, profile?.id]);

  const loadChatUnread = useCallback(async () => {
    try {
      if (!token) {
        setChatUnreadCount(0);
        return;
      }

      const contacts = await getChatContacts(token);
      const count = contacts.reduce(
        (sum, contact) => sum + Number(contact.unread_count || 0),
        0
      );
      setChatUnreadCount(count);
    } catch (err) {
      console.error("Failed to load chat unread count", err);
    }
  }, [token]);

  useEffect(() => {
    loadChatUnread();
  }, [loadChatUnread, location.pathname]);

  useEffect(() => {
    const handleChatUnreadChange = () => loadChatUnread();
    const handleFocus = () => loadChatUnread();
    const interval = window.setInterval(loadChatUnread, 8000);

    window.addEventListener("alumnet:chat-unread-changed", handleChatUnreadChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("alumnet:chat-unread-changed", handleChatUnreadChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadChatUnread]);

  useEffect(() => {
    if (!menuOpen && !showNotifications) return undefined;

    const handleOutsideClick = (event) => {
      const target = event.target;
      const clickedNotification = notificationRef.current?.contains(target);
      const clickedProfileMenu = profileMenuRef.current?.contains(target);

      if (!clickedNotification) setShowNotifications(false);
      if (!clickedProfileMenu) setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [menuOpen, showNotifications]);

  const isStudent = role === "student";
  const isAlumni = role === "alumni";
  const isAdmin = role === "university_admin" || role === "system_admin";
  const mentorRoute = isStudent ? "/my-mentors" : "/my-mentees";
  const mentorText = isStudent ? "My Mentors" : "My Mentees";
  const requestRoute = isStudent ? "/my-requests" : "/mentor-requests";

  const handleLogout = () => {
    localStorage.removeItem("token");
    setMenuOpen(false);
    navigate("/login");
  };

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
      else if (notif.type === "EVENT_UPDATE" || notif.type === "EVENT_REGISTRATION") {
        if (isAdmin) {
          navigate("/admin-events");
        } else {
          navigate("/my-events");
        }
      }
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  return (
    <>
      <style>{css}</style>
      <header className="appTopNav">
        <button className="appBrandBtn" type="button" onClick={() => navigate("/home")}>
          <img src={logo} alt="Alumnet" />
        </button>

        <nav className="appCenterNav">
          <Link to="/directory">Directory</Link>
          <Link to="/events">Events</Link>
        </nav>

        <div className="appNavTools">
          <button className="appToolBtn" type="button" onClick={() => navigate("/directory")}>
            <Search size={17} strokeWidth={2} />
          </button>

          <div className="notifWrapper" ref={notificationRef}>
            <button
              className="appToolBtn"
              type="button"
              onClick={() => {
                setShowNotifications((open) => !open);
                setMenuOpen(false);
              }}
            >
              <Bell size={17} strokeWidth={2} />
              {unreadCount > 0 && <span className="notifBadge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="notifDropdown">
                <div className="notifHeader">Notifications</div>
                <div className="notifList">
                  {notifications.length === 0 ? (
                    <div className="notifEmpty">No new notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        className={`notifItem ${!notif.is_read ? "unread" : ""}`}
                        type="button"
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <span className="notifTitle">{notif.title}</span>
                        <span className="notifMessage">{notif.message}</span>
                        <span className="notifTime">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="appToolBtn" type="button" onClick={() => navigate("/chat")}>
            <MessageCircle size={17} strokeWidth={2} />
            {chatUnreadCount > 0 && (
              <span className="chatBadge">
                {chatUnreadCount > 9 ? "9+" : chatUnreadCount}
              </span>
            )}
          </button>

          <div className="profileMenuWrap" ref={profileMenuRef}>
            <button
              className="profileTool"
              type="button"
              onClick={() => {
                setMenuOpen((open) => !open);
                setShowNotifications(false);
              }}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" />
              ) : (
                <UserRound size={16} strokeWidth={2} />
              )}
              <ChevronDown size={14} strokeWidth={2} />
            </button>

            {menuOpen && (
              <div className="profileDropdown">
                {isAdmin ? (
                  <>
                    <Link to="/events" onClick={() => setMenuOpen(false)}>
                      <Calendar size={14} strokeWidth={2} />
                      Events
                    </Link>
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      <LayoutDashboard size={14} strokeWidth={2} />
                      Admin Dashboard
                    </Link>
                    <Link to="/admin-events" onClick={() => setMenuOpen(false)}>
                      <ClipboardCheck size={14} strokeWidth={2} />
                      Event Approvals
                    </Link>
                    <Link to="/admin-users" onClick={() => setMenuOpen(false)}>
                      <Users size={14} strokeWidth={2} />
                      User Verifications
                    </Link>
                    <Link to="/create-event" onClick={() => setMenuOpen(false)}>
                      <PlusSquare size={14} strokeWidth={2} />
                      Create Event
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <UserRound size={14} strokeWidth={2} />
                      My Profile
                    </Link>
                    <Link to="/edit-profile" onClick={() => setMenuOpen(false)}>
                      <Pencil size={14} strokeWidth={2} />
                      Edit Profile
                    </Link>
                    <Link
                      to={isStudent ? "/my-events" : "/my-created-events"}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Calendar size={14} strokeWidth={2} />
                      {isStudent ? "My Events" : "Created Events"}
                    </Link>
                    {(isStudent || isAlumni) && (
                      <Link to={mentorRoute} onClick={() => setMenuOpen(false)}>
                        <Users size={14} strokeWidth={2} />
                        {mentorText}
                      </Link>
                    )}
                    {(isStudent || isAlumni) && (
                      <Link to={requestRoute} onClick={() => setMenuOpen(false)}>
                        <Mail size={14} strokeWidth={2} />
                        My Requests
                      </Link>
                    )}
                    {isAlumni && (
                      <Link to="/create-event" onClick={() => setMenuOpen(false)}>
                        <PlusSquare size={14} strokeWidth={2} />
                        Create Event
                      </Link>
                    )}
                  </>
                )}
                <button className="dropdownLogout" type="button" onClick={handleLogout}>
                  <LogOut size={14} strokeWidth={2} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

const css = `
.appTopNav{
  height:64px;
  display:grid;
  grid-template-columns:1fr auto 1fr;
  align-items:center;
  gap:24px;
  padding:0 60px;
  position:sticky;
  top:0;
  z-index:2147483000;
  font-family:"Google Sans";
  background:transparent;
}

.appBrandBtn{
  justify-self:start;
  width:122px;
  display:inline-flex;
  align-items:center;
  transition:opacity .18s ease, transform .18s ease;
}

.appBrandBtn:hover{
  opacity:.72;
  transform:translateY(-1px);
}

.appBrandBtn img{
  width:100%;
  height:auto;
  display:block;
}

.appCenterNav{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:40px;
  font-size:14px;
}

.appCenterNav a{
  text-decoration:none;
  color:#111111;
  transition:opacity .18s ease, transform .18s ease;
}

.appCenterNav a:hover{
  opacity:.68;
  transform:translateY(-1px);
}

.appNavTools{
  justify-self:end;
  display:flex;
  align-items:center;
  gap:12px;
}

.appToolBtn,
.profileTool{
  position:relative;
  min-width:38px;
  height:38px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  background:#ffffff;
  border:1px solid rgba(255,255,255,.86);
  color:#111111;
  box-shadow:0 10px 24px rgba(0,0,0,.18), 0 2px 7px rgba(0,0,0,.08);
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
}

.appToolBtn:hover,
.profileTool:hover{
  transform:translateY(-1px);
  background:#ffffff;
  box-shadow:0 14px 30px rgba(0,0,0,.22), 0 3px 9px rgba(0,0,0,.10);
}

.profileTool{
  gap:7px;
  padding:0 9px;
}

.profileTool img{
  width:22px;
  height:22px;
  border-radius:50%;
  object-fit:cover;
  border:1px solid rgba(255,255,255,.58);
}

.profileMenuWrap,
.notifWrapper{
  position:relative;
}

.profileDropdown,
.notifDropdown{
  position:fixed;
  top:68px;
  z-index:2147483001;
  border-radius:14px;
  background:#ffffff;
  border:1px solid rgba(0,0,0,.08);
  box-shadow:0 24px 58px rgba(0,0,0,.18);
  animation:dropdownFade .16s ease both;
}

.profileDropdown{
  right:60px;
  width:202px;
  padding:8px;
  display:grid;
  gap:3px;
}

.profileDropdown a,
.dropdownLogout{
  display:flex;
  align-items:center;
  gap:8px;
  padding:9px 10px;
  border-radius:10px;
  text-decoration:none;
  color:#111111;
  font-size:13px;
  font-family:"Google Sans";
  transition:background .18s ease;
}

.profileDropdown a:hover,
.dropdownLogout:hover{
  background:rgba(0,0,0,.04);
}

.dropdownLogout{
  width:100%;
  border:0;
  background:#050505;
  color:#ffffff;
  justify-content:center;
  margin-top:4px;
  box-shadow:0 8px 18px rgba(0,0,0,.18);
}

.dropdownLogout:hover{
  background:#050505;
  transform:translateY(-1px);
}

.notifBadge,
.chatBadge{
  position:absolute;
  top:-4px;
  right:-4px;
  min-width:18px;
  height:18px;
  padding:0 4px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  background:#D7263D;
  color:#ffffff;
  font-size:10px;
  font-weight:500;
  border:0;
  box-shadow:0 6px 14px rgba(215,38,61,.24);
}

.notifDropdown{
  right:104px;
  width:320px;
  overflow:hidden;
}

.notifHeader{
  padding:14px 16px;
  border-bottom:1px solid rgba(0,0,0,.06);
  font-size:14px;
  color:#111111;
}

.notifList{
  max-height:340px;
  overflow-y:auto;
  padding:6px;
}

.notifEmpty{
  padding:20px 12px;
  text-align:center;
  color:rgba(17,17,17,.54);
  font-size:13px;
}

.notifItem{
  width:100%;
  display:grid;
  gap:4px;
  text-align:left;
  border:0;
  border-radius:10px;
  background:transparent;
  padding:10px;
  font-family:"Google Sans";
  transition:background .18s ease;
}

.notifItem:hover,
.notifItem.unread{
  background:rgba(0,0,0,.04);
}

.notifTitle{
  color:#111111;
  font-size:13px;
  font-weight:500;
}

.notifMessage{
  color:rgba(17,17,17,.62);
  font-size:12px;
  line-height:1.35;
}

.notifTime{
  color:rgba(17,17,17,.42);
  font-size:11px;
}

@keyframes dropdownFade{
  from{ opacity:0; transform:translateY(-4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:900px){
  .appTopNav{
    grid-template-columns:1fr auto;
    height:auto;
    padding:14px 20px 8px;
  }

  .appCenterNav{
    grid-column:1 / -1;
    order:3;
    justify-content:flex-start;
    gap:22px;
    overflow-x:auto;
    padding-top:12px;
  }
}

@media (max-width:640px){
  .appTopNav{
    padding:12px 16px 8px;
  }

  .appBrandBtn{
    width:108px;
  }

  .appNavTools{
    gap:7px;
  }

  .appToolBtn,
  .profileTool{
    min-width:35px;
    height:35px;
  }

  .profileDropdown{
    right:16px;
    top:62px;
  }

  .notifDropdown{
    right:16px;
    top:62px;
    width:min(320px, calc(100vw - 32px));
  }
}
`;
