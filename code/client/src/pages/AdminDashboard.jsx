import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import {
  getAdminEventStats,
  getAdminPendingUsers,
  getAdminStats,
  getEvents,
  getPendingEvents,
} from "../api";
import alumniIcon from "../assets/class.png";
import studentIcon from "../assets/student.png";
import approvedIcon from "../assets/status/verified.png";
import pendingIcon from "../assets/status/pending.png";
import rejectedIcon from "../assets/status/rejected.png";
import dateIcon from "../assets/date.png";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalStudents: 0,
    verified: 0,
    rejected: 0,
    pending: 0,
  });
  const [eventStats, setEventStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [pendingUsers, setPendingUsers] = useState(0);
  const [pendingEvents, setPendingEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setErr("");
        const [
          statsResult,
          usersResult,
          eventsResult,
          approvedEventsResult,
          eventStatsResult,
        ] = await Promise.allSettled([
          getAdminStats(token),
          getAdminPendingUsers(token),
          getPendingEvents(token),
          getEvents(),
          getAdminEventStats(token),
        ]);

        const dashboardErrors = [];
        const pendingEventsData =
          eventsResult.status === "fulfilled" ? eventsResult.value : [];
        const approvedEventsData =
          approvedEventsResult.status === "fulfilled" ? approvedEventsResult.value : [];

        if (statsResult.status === "fulfilled") {
          setStats(statsResult.value);
        } else {
          dashboardErrors.push(statsResult.reason?.message || "Failed to load user stats");
        }

        if (usersResult.status === "fulfilled") {
          setPendingUsers(usersResult.value.length);
        } else {
          dashboardErrors.push(usersResult.reason?.message || "Failed to load pending users");
        }

        if (eventsResult.status === "fulfilled") {
          setPendingEvents(pendingEventsData.length);
        } else {
          dashboardErrors.push(eventsResult.reason?.message || "Failed to load pending events");
        }

        if (eventStatsResult.status === "fulfilled") {
          setEventStats(eventStatsResult.value);
        } else {
          setEventStats({
            total: approvedEventsData.length + pendingEventsData.length,
            approved: approvedEventsData.length,
            pending: pendingEventsData.length,
            rejected: 0,
          });
        }

        if (dashboardErrors.length) setErr(dashboardErrors.join(" | "));
      } catch (e) {
        setErr(e.message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (loading) {
    return <LoadingScreen text="Loading admin dashboard..." />;
  }

  return (
    <main className="adminDashboardPage">
      <style>{css}</style>

      {err && <div className="adminAlert error">{err}</div>}

      <section className="statsPanels" aria-label="Admin stats">
        <StatsPanel
          title="User Verifications"
          subtitle="Review pending student and alumni accounts"
          actionCount={pendingUsers}
          onAction={() => navigate("/admin-users")}
          rows={[
            { icon: alumniIcon, label: "Alumni", value: stats.totalAlumni },
            { icon: studentIcon, label: "Students", value: stats.totalStudents },
            { icon: approvedIcon, label: "Approved", value: stats.verified },
            { icon: pendingIcon, label: "Pending", value: stats.pending },
            { icon: rejectedIcon, label: "Rejected", value: stats.rejected },
          ]}
        />

        <StatsPanel
          title="Event Approvals"
          subtitle="Approve, reject, or edit submitted events"
          actionCount={pendingEvents}
          onAction={() => navigate("/admin-events")}
          rows={[
            { icon: dateIcon, label: "Total Events", value: eventStats.total },
            { icon: approvedIcon, label: "Approved", value: eventStats.approved },
            { icon: pendingIcon, label: "Pending", value: eventStats.pending },
            { icon: rejectedIcon, label: "Rejected", value: eventStats.rejected },
          ]}
        />
      </section>
    </main>
  );
}

function StatsPanel({ title, subtitle, rows, actionCount, onAction }) {
  return (
    <button className="statsPanel" type="button" onClick={onAction}>
      <div className="statsHeader">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className="actionCount">{actionCount}</span>
      </div>

      <table className="statsTable">
        <thead>
          <tr>
            <th>Type</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>
                <span className="statsName">
                  <img src={row.icon} alt="" />
                  {row.label}
                </span>
              </td>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </button>
  );
}

const css = `
.adminDashboardPage{
  min-height:100vh;
  width:100%;
  background:#fbfbfa;
  color:#111111;
  font-family:"Google Sans", Arial, sans-serif;
  padding:34px max(24px, calc((100% - 1180px) / 2)) 70px;
  animation:adminDissolve .22s ease both;
}

.adminAlert{
  margin:0 0 16px;
  padding:10px 12px;
  border-radius:8px;
  font-size:13px;
}

.adminAlert.error{
  background:#fee8e8;
  color:#b42318;
}

.statsPanels{
  display:grid;
  grid-template-columns:repeat(2, minmax(0, 1fr));
  gap:18px;
}

.statsPanel{
  display:block;
  width:100%;
  padding:18px 20px 20px;
  border-radius:8px;
  background:#ffffff;
  border:1px solid rgba(0,0,0,.06);
  color:#111111;
  text-align:left;
  box-shadow:0 12px 28px rgba(0,0,0,.05);
  transition:transform .18s ease, box-shadow .18s ease, background .18s ease;
}

.statsPanel:hover{
  transform:translateY(-2px);
  background:#fdfdfc;
  box-shadow:0 18px 40px rgba(0,0,0,.09);
}

.statsHeader{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  margin-bottom:16px;
}

.statsHeader h2{
  margin:0;
  color:#111111;
  font-size:15px;
  line-height:1.25;
  font-weight:600;
}

.statsHeader p{
  margin:5px 0 0;
  color:rgba(17,17,17,.52);
  font-size:12px;
  line-height:1.45;
}

.statsTable{
  width:100%;
  border-collapse:collapse;
}

.statsTable th{
  height:34px;
  color:rgba(17,17,17,.48);
  font-size:12px;
  font-weight:600;
  text-align:left;
  border-bottom:1px solid rgba(0,0,0,.06);
}

.statsTable th:last-child,
.statsTable td:last-child{
  text-align:right;
}

.statsTable td{
  height:42px;
  border-bottom:1px solid rgba(0,0,0,.05);
  color:#111111;
  font-size:13px;
}

.statsTable tr:last-child td{
  border-bottom:0;
}

.statsName{
  display:inline-flex;
  align-items:center;
  gap:9px;
}

.statsName img{
  width:17px;
  height:17px;
  object-fit:contain;
}

.statsTable td:last-child{
  color:#111111;
  font-weight:600;
}

.actionCount{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:34px;
  height:30px;
  padding:0 11px;
  border-radius:999px;
  background:#050505;
  color:#ffffff;
  font-size:13px;
  font-weight:500;
}

@keyframes adminDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:920px){
  .statsPanels{
    grid-template-columns:1fr;
  }
}
`;
