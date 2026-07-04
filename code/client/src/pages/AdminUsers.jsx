import { useEffect, useMemo, useState } from "react";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import SegmentedFilter from "../components/SegmentedFilter";
import { getAdminPendingUsers, getAdminStats, verifyUserStatus } from "../api";
import rejectedIcon from "../assets/rejected.png";
import tickIcon from "../assets/tick.png";

export default function AdminUsers() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ pending: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const counts = useMemo(
    () => ({
      all: users.length,
      alumni: users.filter((user) => user.role === "alumni").length,
      student: users.filter((user) => user.role === "student").length,
    }),
    [users]
  );

  const filteredUsers = useMemo(
    () =>
      roleFilter === "all"
        ? users
        : users.filter((user) => user.role === roleFilter),
    [roleFilter, users]
  );

  const filterOptions = [
    { label: "All", value: "all", count: counts.all },
    { label: "Alumni", value: "alumni", count: counts.alumni },
    { label: "Students", value: "student", count: counts.student },
  ];

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

  if (loading) {
    return <LoadingScreen text="Loading user verifications..." />;
  }

  return (
    <AccountListShell>
      <style>{css}</style>
      {err && <div className="accountListError">{err}</div>}
      {successMsg && <div className="accountListState successState">{successMsg}</div>}

      {users.length === 0 ? (
        <div className="accountListState">
          No pending users. Total pending: {Number(stats.pending || 0)}
        </div>
      ) : (
        <>
          <div className="accountListToolbar">
            <SegmentedFilter
              label="Filter pending users"
              value={roleFilter}
              options={filterOptions}
              onChange={setRoleFilter}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="accountListState">No pending users in this view.</div>
          ) : (
            <div className="accountTableWrap">
              <table className="accountTable adminUsersTable">
                <thead>
                  <tr>
                    <th style={{ width: "34%" }}>User</th>
                    <th style={{ width: "14%" }}>Role</th>
                    <th style={{ width: "17%" }}>Created</th>
                    <th style={{ width: "13%" }}>Status</th>
                    <th className="tableActionHeader" style={{ width: "22%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="tablePerson">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="tableAvatar" />
                          ) : (
                            <div className="tableAvatar">
                              {user.full_name?.slice(0, 1)?.toUpperCase() || "U"}
                            </div>
                          )}
                          <div>
                            <div className="tableName">
                              <span>{user.full_name || "Unnamed user"}</span>
                            </div>
                            <div className="tableMeta">{user.email || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="adminSoftTag">
                          {user.role === "alumni" ? "Alumni" : "Student"}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <span className="accountPill pending">Pending</span>
                      </td>
                      <td className="tableActionCell">
                        <div className="tableActions adminUserActions">
                          <button
                            className="accountIconButton labeled accept"
                            type="button"
                            title="Approve user"
                            aria-label={`Approve ${user.full_name || "user"}`}
                            onClick={() => handleVerify(user.id, "verified")}
                          >
                            <img src={tickIcon} alt="" />
                            <span>Approve</span>
                          </button>
                          <button
                            className="accountIconButton labeled reject"
                            type="button"
                            title="Reject user"
                            aria-label={`Reject ${user.full_name || "user"}`}
                            onClick={() => handleVerify(user.id, "rejected")}
                          >
                            <img src={rejectedIcon} alt="" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </AccountListShell>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const css = `
.adminUsersTable{
  min-width:0;
}

.adminSoftTag{
  display:inline-flex;
  align-items:center;
  min-height:23px;
  border-radius:999px;
  padding:0 9px;
  background:#eef1f4;
  color:rgba(17,17,17,.66);
  font-size:12px;
  white-space:nowrap;
}

.adminUserActions{
  gap:7px;
}
`;
