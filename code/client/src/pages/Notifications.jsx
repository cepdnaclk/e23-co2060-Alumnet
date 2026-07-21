import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Bell,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

import PageShell from "../components/PageShell";
import {
  deleteNotification,
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api";

export default function Notifications() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [role, setRole] = useState("");

  useEffect(() => {
    try {
      setRole(token ? jwtDecode(token)?.role || "" : "");
    } catch {
      setRole("");
    }
  }, [token]);

  useEffect(() => {
    const loadNotifs = async () => {
      try {
        setLoading(true);
        const data = await getMyNotifications(token);
        setNotifications(data || []);
      } catch (e) {
        console.error("Failed to load notifications:", e);
      } finally {
        setLoading(false);
      }
    };
    loadNotifs();
  }, [token]);

  const handleMarkRead = async (e, id) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(token, id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(token, id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error("Failed to delete notification:", e);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await markNotificationAsRead(token, notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
        );
      } catch (e) {
        console.error("Failed to mark read on navigate:", e);
      }
    }

    const isAdmin = role === "university_admin" || role === "system_admin";
    const isAlumni = role === "alumni";

    if (notif.type === "MENTOR_REQUEST") navigate("/mentor-requests");
    else if (notif.type === "REQUEST_UPDATE") navigate("/my-mentors");
    else if (notif.type?.startsWith("EVENT_REMINDER:")) {
      const eventId = notif.type.split(":")[1];
      navigate(eventId ? `/events/${eventId}` : "/my-events");
    } else if (notif.type?.startsWith("NEW_EVENT:")) {
      const eventId = notif.type.split(":")[1];
      navigate(eventId ? `/events/${eventId}` : "/events");
    } else if (notif.type === "NEW_EVENT" || notif.title === "New Event Added") {
      navigate("/events");
    } else if (notif.type === "EVENT_UPDATE" || notif.type === "EVENT_REGISTRATION") {
      if (isAdmin) navigate("/admin-events");
      else if (isAlumni) navigate("/my-created-events");
      else navigate("/my-events");
    }
  };

  const getNotificationIcon = (type, title) => {
    if (type?.includes("EVENT") || title?.toLowerCase().includes("event")) {
      return <Calendar size={20} className="icon-blue" />;
    }
    if (type === "MENTOR_REQUEST") {
      return <Users size={20} className="icon-indigo" />;
    }
    if (type === "REQUEST_UPDATE") {
      return <UserCheck size={20} className="icon-green" />;
    }
    return <Bell size={20} className="icon-slate" />;
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const hasUnread = notifications.some((n) => !n.is_read);

  const getRoleSubtitle = () => {
    if (role === "student") return "Student alert hub: Mentorship updates and campus event alerts.";
    if (role === "alumni") return "Alumni alert hub: Mentorship inquiries and event registrations.";
    if (role?.includes("admin")) return "Administrative hub: System verifications and event approvals.";
    return "Manage your account alerts and updates.";
  };

  return (
    <PageShell title="Notifications" subtitle={getRoleSubtitle()}>
      <style>{notifPageCss}</style>

      <div className="notif-top-bar">
        <div className="notif-filter-tabs">
          <button
            className={`notif-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notif-tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Unread ({notifications.filter((n) => !n.is_read).length})
          </button>
          <button
            className={`notif-tab ${filter === "read" ? "active" : ""}`}
            onClick={() => setFilter("read")}
          >
            Read ({notifications.filter((n) => n.is_read).length})
          </button>
        </div>

        {hasUnread && (
          <button className="mark-all-btn" onClick={handleMarkAllRead}>
            <CheckCircle size={16} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="notif-empty-state">Loading notifications...</div>
      ) : filteredNotifs.length === 0 ? (
        <div className="notif-empty-state">No notifications found for this view.</div>
      ) : (
        <div className="notif-list-container">
          {filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`notif-card ${notif.is_read ? "read" : "unread"}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notif-icon-wrap">
                {getNotificationIcon(notif.type, notif.title)}
              </div>

              <div className="notif-content-area">
                <div className="notif-title-row">
                  {!notif.is_read && <span className="notif-unread-dot" />}
                  <h3 className="notif-card-title">{notif.title}</h3>
                </div>
                <p className="notif-card-message">{notif.message}</p>
                <div className="notif-timestamp">
                  <Clock size={12} style={{ display: "inline", marginRight: 4 }} />
                  {new Date(notif.created_at).toLocaleString()}
                </div>
              </div>

              <div className="notif-action-area">
                {!notif.is_read && (
                  <button
                    className="notif-btn notif-btn-read"
                    onClick={(e) => handleMarkRead(e, notif.id)}
                    title="Mark as Read"
                  >
                    <CheckCircle2 size={16} />
                    <span>Read</span>
                  </button>
                )}
                <button
                  className="notif-btn notif-btn-delete"
                  onClick={(e) => handleDelete(e, notif.id)}
                  title="Delete Notification"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

const notifPageCss = `
.notif-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.notif-filter-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.notif-tab {
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.7);
  color: rgba(17, 17, 17, 0.68);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  font-family: "Google Sans";
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.notif-tab:hover {
  background: #ffffff;
  color: #111111;
  border-color: rgba(0, 0, 0, 0.15);
}

.notif-tab.active {
  background: #111111;
  color: #ffffff;
  border-color: #111111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.mark-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid rgba(37, 99, 235, 0.2);
  background: #ffffff;
  color: #2563eb;
  font-size: 13.5px;
  font-weight: 600;
  font-family: "Google Sans";
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.18s ease;
}

.mark-all-btn:hover {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
  transform: translateY(-1px);
}

.notif-list-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notif-card {
  padding: 18px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.notif-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.06);
  background: #ffffff;
  border-color: rgba(41, 91, 184, 0.2);
}

.notif-card.read {
  opacity: 0.75;
  background: rgba(255, 255, 255, 0.5);
}

.notif-card.read:hover {
  opacity: 1;
}

.notif-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.icon-blue { color: #2563eb; }
.icon-indigo { color: #4f46e5; }
.icon-green { color: #16a34a; }
.icon-slate { color: #475569; }

.notif-content-area {
  flex: 1;
  min-width: 0;
}

.notif-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notif-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(37, 99, 235, 0.6);
}

.notif-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111111;
}

.notif-card-message {
  margin: 0 0 10px 0;
  font-size: 13.5px;
  color: rgba(17, 17, 17, 0.72);
  line-height: 1.5;
}

.notif-timestamp {
  display: flex;
  align-items: center;
  font-size: 11.5px;
  color: rgba(17, 17, 17, 0.45);
  font-weight: 500;
}

.notif-action-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.notif-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: "Google Sans";
}

.notif-btn-read {
  border: 1px solid rgba(37, 99, 235, 0.2);
  background: rgba(37, 99, 235, 0.05);
  color: #2563eb;
}

.notif-btn-read:hover {
  background: #2563eb;
  color: #ffffff;
}

.notif-btn-delete {
  border: 1px solid rgba(220, 38, 38, 0.15);
  background: rgba(220, 38, 38, 0.04);
  color: #dc2626;
}

.notif-btn-delete:hover {
  background: #dc2626;
  color: #ffffff;
}

.notif-empty-state {
  padding: 60px 20px;
  text-align: center;
  color: rgba(17, 17, 17, 0.5);
  font-size: 15px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  border: 1px dashed rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  .notif-top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .mark-all-btn {
    width: 100%;
    justify-content: center;
  }

  .notif-card {
    flex-direction: column;
    padding: 16px;
  }
  
  .notif-action-area {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(0,0,0,0.05);
  }

  .notif-btn span {
    display: inline;
  }
}
`;