// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { titleStyle, footerRowStyle, linkStyle, errorBoxStyle, badge, theme } from "../styles/ui";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const loadPending = async () => {
    setErr("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await fetch(`${API_URL}/api/auth/admin/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load pending users");

      setPending(data.users || data);
    } catch (e) {
      setErr(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/admin/verify/${userId}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verify failed");
      await loadPending();
    } catch (e) {
      setErr(e.message || "Verify failed");
    }
  };

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthLayout maxWidth={820}>
      <h1 style={titleStyle}>Admin Dashboard</h1>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <span style={badge("admin")}>Admin</span>
      </div>

      {err && <div style={errorBoxStyle}>{err}</div>}

      {loading ? (
        <div style={{ textAlign: "center", color: theme.blue, opacity: 0.85 }}>Loading…</div>
      ) : pending.length === 0 ? (
        <div style={{ textAlign: "center", color: theme.blue, opacity: 0.85 }}>
          No pending users 🎉
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {pending.map((u) => (
            <div
              key={u.user_id || u.id}
              style={{
                border: "1px solid rgba(11,42,111,0.12)",
                borderRadius: 12,
                padding: 12,
                background: "rgba(255,255,255,0.95)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ color: theme.blue }}>
                  <div style={{ fontWeight: 700 }}>{u.full_name || "Unnamed"}</div>
                  <div style={{ opacity: 0.85 }}>{u.email}</div>
                  <div style={{ opacity: 0.85, fontSize: 13 }}>Role: {u.role}</div>
                </div>

                <button
                  className="btnPrimary"
                  onClick={() => verifyUser(u.user_id || u.id)}
                  style={{
                    border: "none",
                    background: theme.blue,
                    color: "white",
                    borderRadius: 10,
                    padding: "10px 14px",
                    cursor: "pointer",
                    fontWeight: 600,
                    height: 42,
                    alignSelf: "center",
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Verify
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={footerRowStyle}>
        <div style={{ textAlign: "center" }}>
          <Link className="link" style={linkStyle} to="/profile">
            ← Back to Profile
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}