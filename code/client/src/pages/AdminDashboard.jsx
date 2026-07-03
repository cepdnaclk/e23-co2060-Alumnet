import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { getPendingUsers, verifyUser } from "../api";

export default function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await getPendingUsers(token);
      setUsers(data);
    } catch (e) {
      setErr(e.message || "Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleVerify = async (id) => {
    try {
      setErr("");
      await verifyUser(token, id);
      loadUsers();
    } catch (e) {
      setErr(e.message || "Failed to verify account");
    }
  };

  return (
    <PageShell title="Admin Dashboard" subtitle="Verify new accounts">
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : users.length === 0 ? (
        <div>No pending users.</div>
      ) : (
        <div style={grid}>
          {users.map((u) => (
            <div key={u.id} style={card}>
              <h3 style={name}>{u.full_name}</h3>

              <div style={meta}>{u.email}</div>
              <div style={meta}>Role: {u.role}</div>

              <button
                style={verifyBtn}
                onClick={() => handleVerify(u.id)}
              >
                Verify Account
              </button>
            </div>
          ))}
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