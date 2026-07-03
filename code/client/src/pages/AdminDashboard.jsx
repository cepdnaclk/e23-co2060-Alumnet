import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import {
  getAdminStats,
  getAdminPendingUsers,
  verifyUserStatus,
  getPendingEvents,
  approveEvent,
  rejectEvent,
} from "../api";
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalStudents: 0,
    verified: 0,
    rejected: 0,
    pending: 0,
  });
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "all") return true;
    return u.role === roleFilter;
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setErr("");
      const [statsResult, usersResult, eventsResult] = await Promise.allSettled([
        getAdminStats(token),
        getAdminPendingUsers(token),
        getPendingEvents(token),
      ]);

      const loadErrors = [];

      if (statsResult.status === "fulfilled") {
        setStats(statsResult.value);
      } else {
        loadErrors.push(`Stats: ${statsResult.reason?.message || "failed to load"}`);
      }

      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        loadErrors.push(`Users: ${usersResult.reason?.message || "failed to load"}`);
      }

      if (eventsResult.status === "fulfilled") {
        setEvents(eventsResult.value);
      } else {
        loadErrors.push(`Events: ${eventsResult.reason?.message || "failed to load"}`);
      }

      if (loadErrors.length) {
        setErr(loadErrors.join(" | "));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      setErr("");
      setSuccessMsg("");
      await verifyUserStatus(token, id, status);
      setSuccessMsg(`User successfully ${status === "verified" ? "approved" : "rejected"}.`);
      // Reload stats and users
      const [statsData, usersData] = await Promise.all([
        getAdminStats(token),
        getAdminPendingUsers(token),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (e) {
      setErr(e.message || "Failed to update user status");
    }
  };

  const handleEventApproval = async (id, action) => {
    try {
      setErr("");
      setSuccessMsg("");
      if (action === "approve") {
        await approveEvent(token, id);
        setSuccessMsg("Event successfully approved.");
      } else {
        await rejectEvent(token, id);
        setSuccessMsg("Event successfully rejected.");
      }
      // Reload stats and events
      const [statsData, eventsData] = await Promise.all([
        getAdminStats(token),
        getPendingEvents(token),
      ]);
      setStats(statsData);
      setEvents(eventsData);
    } catch (e) {
      setErr(e.message || "Failed to moderate event");
    }
  };

  return (
    <PageShell title="Admin Dashboard" subtitle="Manage Alumnet verification & moderated scale">
      <style>{dashboardCss}</style>

      {err && <div className="alert alert-error">{err}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {loading ? (
        <div className="loadingContainer">
          <div className="spinner"></div>
          <div>Loading admin console...</div>
        </div>
      ) : (
        <div className="adminDashboardContainer">
          {/* Stats Grid */}
          <div className="statsGrid">
            <div className="statCard alumni">
              <div className="statIcon">
                <GraduationCap size={24} />
              </div>
              <div className="statDetails">
                <h3>Total Alumni</h3>
                <p className="statCount">{stats.totalAlumni}</p>
              </div>
            </div>

            <div className="statCard student">
              <div className="statIcon">
                <Users size={24} />
              </div>
              <div className="statDetails">
                <h3>Total Students</h3>
                <p className="statCount">{stats.totalStudents}</p>
              </div>
            </div>

            <div className="statCard verified">
              <div className="statIcon">
                <CheckCircle2 size={24} />
              </div>
              <div className="statDetails">
                <h3>Approved Users</h3>
                <p className="statCount">{stats.verified}</p>
              </div>
            </div>

            <div className="statCard rejected">
              <div className="statIcon">
                <XCircle size={24} />
              </div>
              <div className="statDetails">
                <h3>Rejected Users</h3>
                <p className="statCount">{stats.rejected}</p>
              </div>
            </div>

            <div className="statCard pending">
              <div className="statIcon">
                <AlertCircle size={24} />
              </div>
              <div className="statDetails">
                <h3>Pending Users</h3>
                <p className="statCount">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="sectionsGrid">
            {/* User Verification Section */}
            <div className="dashboardSectionCard">
              <div className="sectionHeader">
                <ShieldCheck size={20} className="sectionIcon blue" />
                <h2>Users Pending Verification</h2>
                <span className="badge">{users.length}</span>
              </div>

              {users.length === 0 ? (
                <div className="emptyState">
                  <p>No new account sign-ups pending verification.</p>
                </div>
              ) : (
                <>
                  <div className="filterToggleContainer">
                    <button
                      className={`filterToggleBtn ${roleFilter === "all" ? "active" : ""}`}
                      onClick={() => setRoleFilter("all")}
                    >
                      All ({users.length})
                    </button>
                    <button
                      className={`filterToggleBtn ${roleFilter === "alumni" ? "active" : ""}`}
                      onClick={() => setRoleFilter("alumni")}
                    >
                      Alumni ({users.filter((u) => u.role === "alumni").length})
                    </button>
                    <button
                      className={`filterToggleBtn ${roleFilter === "student" ? "active" : ""}`}
                      onClick={() => setRoleFilter("student")}
                    >
                      Students ({users.filter((u) => u.role === "student").length})
                    </button>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className="emptyState">
                      <p>No pending {roleFilter === "alumni" ? "Alumni" : "Student"} registrations.</p>
                    </div>
                  ) : (
                    <div className="listScrollable">
                      {filteredUsers.map((u) => (
                        <div key={u.id} className="verificationRow">
                          <div className="userMeta">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="avatar" className="rowAvatar" />
                            ) : (
                              <div className="rowAvatarFallback">
                                {u.full_name?.slice(0, 1)?.toUpperCase() || "U"}
                              </div>
                            )}
                            <div className="userInfo">
                              <span className="userName">{u.full_name}</span>
                              <span className="userEmail">{u.email}</span>
                              <span className="userRole">
                                Role: {u.role === "alumni" ? "Alumni" : "Student"}
                              </span>
                            </div>
                          </div>

                          <div className="actionsContainer">
                            <button
                              className="btn btn-action btn-approve"
                              onClick={() => handleVerify(u.id, "verified")}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-action btn-reject"
                              onClick={() => handleVerify(u.id, "rejected")}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Event Approval Section */}
            <div className="dashboardSectionCard">
              <div className="sectionHeader">
                <CalendarCheck size={20} className="sectionIcon green" />
                <h2>Upcoming Event Approvals</h2>
                <span className="badge">{events.length}</span>
              </div>

              {events.length === 0 ? (
                <div className="emptyState">
                  <p>No upcoming events submitted for moderation.</p>
                </div>
              ) : (
                <div className="listScrollable">
                  {events.map((e) => (
                    <div key={e.id} className="eventModRow">
                      <div className="eventInfo">
                        <span className="eventTitle">{e.title}</span>
                        <div className="eventDetailsGrid">
                          <span className="detailLabel">Date:</span>
                          <span className="detailValue">{e.event_date}</span>
                          <span className="detailLabel">Time:</span>
                          <span className="detailValue">{e.event_time}</span>
                          <span className="detailLabel">Venue:</span>
                          <span className="detailValue">{e.venue}</span>
                          <span className="detailLabel">By:</span>
                          <span className="detailValue">{e.created_by_name}</span>
                        </div>
                        {e.description && (
                          <p className="eventDescription">{e.description}</p>
                        )}
                      </div>

                      <div className="actionsContainer align-start">
                        <button
                          className="btn btn-action btn-approve"
                          onClick={() => handleEventApproval(e.id, "approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-action btn-reject"
                          onClick={() => handleEventApproval(e.id, "reject")}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: 20,
};

const card = {
  padding: 20,
  borderRadius: 16,
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(0,0,0,0.06)",
  backdropFilter: "blur(6px)",
};

const name = {
  margin: 0,
  fontSize: 15,
  fontWeight: 500,
  color: "#111111",
};

const meta = {
  marginTop: 6,
  fontSize: 14,
  color: "rgba(17,17,17,0.72)",
  wordBreak: "break-word",
};

const verifyBtn = {
  marginTop: 14,
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(0,0,0,0.08)",
  background: "rgba(255, 255, 255, 0.76)",
  color: "#111111",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 400,
  fontFamily: '"Google Sans"',
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
};
const dashboardCss = `
.adminDashboardContainer {
  display: flex;
  flex-direction: column;
  gap: 28px;
  font-family: "Google Sans", Arial, sans-serif;
  margin-top: 14px;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.statCard {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.statCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.statIcon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alumni .statIcon {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.student .statIcon {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.verified .statIcon {
  background: rgba(16, 185, 129, 0.12);
  color: rgb(16, 185, 129);
}

.rejected .statIcon {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.pending .statIcon {
  background: rgba(245, 158, 11, 0.1);
  color: rgb(245, 158, 11);
}

.statDetails h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: rgba(17, 17, 17, 0.54);
}

.statCount {
  margin: 4px 0 0;
  font-size: 24px;
  font-weight: 600;
  color: #111;
}

.sectionsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1100px) {
  .sectionsGrid {
    grid-template-columns: 1fr;
  }
}

.dashboardSectionCard {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 24px;
  padding: 24px;
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.sectionHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.sectionIcon {
  flex-shrink: 0;
}

.sectionIcon.blue {
  color: rgb(59, 130, 246);
}

.sectionIcon.green {
  color: rgb(16, 185, 129);
}

.sectionHeader h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #111;
  flex-grow: 1;
}

.badge {
  background: rgba(0, 0, 0, 0.05);
  color: rgba(17, 17, 17, 0.7);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
}

.emptyState {
  padding: 40px 20px;
  text-align: center;
  color: rgba(17, 17, 17, 0.44);
  font-size: 14px;
}

.listScrollable {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;
}

/* Custom minimal scrollbar */
.listScrollable::-webkit-scrollbar {
  width: 4px;
}
.listScrollable::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 4px;
}

.verificationRow, .eventModRow {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.04);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: background 0.15s ease;
}

.verificationRow:hover, .eventModRow:hover {
  background: rgba(255, 255, 255, 0.9);
}

.userMeta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.rowAvatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.rowAvatarFallback {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ecebe7;
  color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 15px;
}

.userInfo {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.userName {
  font-size: 14px;
  font-weight: 500;
  color: #111;
}

.userEmail {
  font-size: 12px;
  color: rgba(17, 17, 17, 0.54);
  word-break: break-all;
  margin-top: 1px;
}

.userRole {
  font-size: 11px;
  background: rgba(0, 0, 0, 0.04);
  color: rgba(17, 17, 17, 0.62);
  align-self: flex-start;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 5px;
}

.actionsContainer {
  display: flex;
  gap: 8px;
}

.actionsContainer.align-start {
  margin-top: 4px;
}

.btn {
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  border-radius: 999px;
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-action {
  padding: 6px 14px;
  border: 1px solid transparent;
}

.btn-approve {
  background: #dcfce7;
  color: #166534;
  border-color: rgba(22, 101, 52, 0.08);
}

.btn-approve:hover {
  background: #bbf7d0;
  transform: translateY(-1px);
}

.btn-reject {
  background: #fee2e2;
  color: #991b1b;
  border-color: rgba(153, 27, 27, 0.08);
}

.btn-reject:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

.eventInfo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.eventTitle {
  font-size: 14px;
  font-weight: 500;
  color: #111;
}

.eventDetailsGrid {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 10px;
  row-gap: 4px;
  font-size: 12px;
}

.detailLabel {
  color: rgba(17, 17, 17, 0.44);
}

.detailValue {
  color: rgba(17, 17, 17, 0.72);
}

.eventDescription {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(17, 17, 17, 0.6);
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.02);
  padding: 8px 12px;
  border-radius: 8px;
}

.alert {
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 13px;
  margin-bottom: 8px;
  font-weight: 500;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid rgba(153, 27, 27, 0.1);
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid rgba(22, 101, 52, 0.1);
}

.loadingContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 0;
  color: rgba(17, 17, 17, 0.54);
  font-size: 14px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(0, 0, 0, 0.06);
  border-top-color: #111;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.filterToggleContainer {
  display: flex;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 16px;
  gap: 4px;
}

.filterToggleBtn {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: rgba(17, 17, 17, 0.6);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.filterToggleBtn:hover {
  color: #111;
}

.filterToggleBtn.active {
  background: #ffffff;
  color: #111;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}
`;
