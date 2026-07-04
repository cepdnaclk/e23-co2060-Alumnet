import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import { getAdminPendingUsers, getAdminStats, verifyUserStatus } from "../api";

export default function AdminUsers() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ pending: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((user) => {
    if (roleFilter === "all") return true;
    return user.role === roleFilter;
  });

  const alumniCount = users.filter((user) => user.role === "alumni").length;
  const studentCount = users.filter((user) => user.role === "student").length;

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErr("");
      const [statsData, usersData] = await Promise.all([
        getAdminStats(token),
        getAdminPendingUsers(token),
      ]);
      setStats(statsData);
      setUsers(usersData);
    } catch (e) {
      setErr(e.message || "Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      setErr("");
      setSuccessMsg("");
      await verifyUserStatus(token, id, status);
      setSuccessMsg(`User successfully ${status === "verified" ? "approved" : "rejected"}.`);
      await loadUsers();
    } catch (e) {
      setErr(e.message || "Failed to update user status");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return <LoadingScreen text="Loading user verifications..." />;
  }

  return (
    <main className="adminUsersPage">
      <style>{css}</style>

      {(err || successMsg) && (
        <div className={`adminAlert ${err ? "error" : "success"}`}>
          {err || successMsg}
        </div>
      )}

      <section className="adminPanel">
        <div className="panelToolbar">
          <div>
            <h1>User Verifications</h1>
            <p>{filteredUsers.length} pending shown from {stats.pending} total pending</p>
          </div>

          <div className="filterTabs" aria-label="Filter pending users">
            <button
              type="button"
              className={roleFilter === "all" ? "active" : ""}
              onClick={() => setRoleFilter("all")}
            >
              All <span>{users.length}</span>
            </button>
            <button
              type="button"
              className={roleFilter === "alumni" ? "active" : ""}
              onClick={() => setRoleFilter("alumni")}
            >
              Alumni <span>{alumniCount}</span>
            </button>
            <button
              type="button"
              className={roleFilter === "student" ? "active" : ""}
              onClick={() => setRoleFilter("student")}
            >
              Students <span>{studentCount}</span>
            </button>
          </div>
        </div>

        <div className="tableShell">
          <table className="adminTable">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Created</th>
                <th>Status</th>
                <th className="actionsHead">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="emptyRow">No pending users in this view.</div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="personCell">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" />
                        ) : (
                          <span>{user.full_name?.slice(0, 1)?.toUpperCase() || "U"}</span>
                        )}
                        <div className="personCopy">
                          <strong>{user.full_name || "Unnamed user"}</strong>
                          <small>{user.email || "-"}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="softTag">{user.role === "alumni" ? "Alumni" : "Student"}</span>
                    </td>
                    <td className="mutedCell">{formatDate(user.created_at)}</td>
                    <td>
                      <span className="statusTag pending">Pending</span>
                    </td>
                    <td>
                      <div className="rowActions">
                        <button
                          className="roundAction approve"
                          type="button"
                          title="Approve user"
                          onClick={() => handleVerify(user.id, "verified")}
                        >
                          <Check size={14} strokeWidth={2.4} />
                        </button>
                        <button
                          className="roundAction reject"
                          type="button"
                          title="Reject user"
                          onClick={() => handleVerify(user.id, "rejected")}
                        >
                          <X size={14} strokeWidth={2.4} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const css = `
.adminUsersPage{
  min-height:100vh;
  width:100%;
  background:#fbfbfa;
  color:#111111;
  font-family:"Google Sans", Arial, sans-serif;
  padding:30px max(24px, calc((100% - 1180px) / 2)) 70px;
  animation:adminDissolve .22s ease both;
}

.adminAlert{
  margin:0 0 14px;
  padding:10px 12px;
  border-radius:8px;
  font-size:13px;
}

.adminAlert.error{ background:#fee8e8; color:#b42318; }
.adminAlert.success{ background:#d8f8e4; color:#047a31; }

.adminPanel{
  border-top:1px solid rgba(0,0,0,.08);
  padding-top:16px;
}

.panelToolbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  margin-bottom:12px;
}

.panelToolbar h1{
  margin:0;
  font-size:15px;
  line-height:1.25;
  font-weight:600;
}

.panelToolbar p{
  margin:4px 0 0;
  color:rgba(17,17,17,.46);
  font-size:12px;
}

.filterTabs{
  display:inline-flex;
  gap:5px;
  padding:4px;
  border-radius:999px;
  background:#eef1f4;
}

.filterTabs button{
  display:inline-flex;
  align-items:center;
  gap:6px;
  height:27px;
  padding:0 10px;
  border-radius:999px;
  color:rgba(17,17,17,.62);
  font-size:12px;
  font-family:"Google Sans", Arial, sans-serif;
}

.filterTabs button.active{
  background:#050505;
  color:#ffffff;
  box-shadow:0 8px 18px rgba(0,0,0,.12);
}

.tableShell{
  overflow:auto;
  border:1px solid rgba(0,0,0,.06);
  border-radius:8px;
  background:rgba(255,255,255,.48);
}

.adminTable{
  width:100%;
  min-width:700px;
  border-collapse:collapse;
}

.adminTable th{
  height:38px;
  padding:0 12px;
  color:rgba(17,17,17,.52);
  font-size:12px;
  font-weight:600;
  text-align:left;
  background:#fbfbfa;
  border-bottom:1px solid rgba(0,0,0,.06);
  white-space:nowrap;
}

.adminTable td{
  padding:10px 12px;
  border-bottom:1px solid rgba(0,0,0,.06);
  font-size:13px;
  vertical-align:middle;
}

.adminTable tbody tr:hover{
  background:rgba(238,241,244,.42);
}

.actionsHead{
  text-align:right;
}

.personCell{
  display:flex;
  align-items:center;
  gap:9px;
  min-width:240px;
}

.personCell img,
.personCell span{
  width:30px;
  height:30px;
  border-radius:50%;
  flex:0 0 auto;
}

.personCell img{
  object-fit:cover;
}

.personCell span{
  display:grid;
  place-items:center;
  background:#eef1f4;
  color:#111111;
  font-size:12px;
}

.personCopy{
  display:grid;
  gap:3px;
  min-width:0;
}

.personCopy strong{
  color:#111111;
  font-size:13px;
  font-weight:500;
}

.personCopy small,
.mutedCell{
  color:rgba(17,17,17,.52);
  font-size:12px;
  word-break:break-word;
}

.softTag,
.statusTag{
  display:inline-flex;
  align-items:center;
  min-height:23px;
  border-radius:999px;
  padding:0 9px;
  font-size:12px;
  white-space:nowrap;
}

.softTag{
  background:#eef1f4;
  color:rgba(17,17,17,.66);
}

.statusTag.pending{
  background:#fef3c7;
  color:#a16207;
}

.rowActions{
  display:flex;
  justify-content:flex-end;
  gap:7px;
}

.roundAction{
  width:28px;
  height:28px;
  display:inline-grid;
  place-items:center;
  border-radius:999px;
  transition:transform .16s ease, box-shadow .16s ease;
}

.roundAction.approve{ background:#d8f8e4; color:#047a31; }
.roundAction.reject{ background:#fee8e8; color:#b42318; }

.roundAction:hover{
  transform:translateY(-1px);
  box-shadow:0 10px 20px rgba(0,0,0,.12);
}

.emptyRow{
  padding:26px 0;
  text-align:center;
  color:rgba(17,17,17,.46);
  font-size:13px;
}

@keyframes adminDissolve{
  from{ opacity:0; transform:translateY(4px); }
  to{ opacity:1; transform:translateY(0); }
}

@media (max-width:860px){
  .panelToolbar{
    align-items:flex-start;
    flex-direction:column;
  }

  .filterTabs{
    width:100%;
    overflow:auto;
  }
}
`;
