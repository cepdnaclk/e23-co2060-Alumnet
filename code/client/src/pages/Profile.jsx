// src/pages/Profile.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile } from "../api";
import AuthLayout from "../components/AuthLayout";
import { titleStyle, footerRowStyle, linkStyle, badge, errorBoxStyle } from "../styles/ui";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const data = await getProfile(token);
        setProfile(data);
      } catch (e) {
        setErr(e.message || "Failed to load profile");
      }
    };
    run();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const token = localStorage.getItem("token");
  let isAdmin = false;
  try {
    if (token) {
      const decoded = jwtDecode(token);
      isAdmin = decoded?.role === "admin";
    }
  } catch {}

  return (
    <AuthLayout maxWidth={720}>
      <h1 style={titleStyle}>My Profile</h1>

      {err && <div style={errorBoxStyle}>{err}</div>}

      {profile && (
        <>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <span style={badge(profile.verification_status === "verified" ? "verified" : "pending")}>
              {profile.verification_status === "verified" ? "Verified" : "Pending"}
            </span>
          </div>

          <div style={{ color: "#0b2a6f", opacity: 0.95, lineHeight: 1.7 }}>
            <div><b>Name:</b> {profile.full_name}</div>
            <div><b>Email:</b> {profile.email}</div>
            <div><b>Role:</b> {profile.role}</div>
          </div>

          {profile.verification_status !== "verified" && (
            <div style={{ marginTop: 14, color: "#92400e", textAlign: "center" }}>
              Your account is awaiting admin approval.
            </div>
          )}

          {isAdmin && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <Link className="link" style={linkStyle} to="/admin">
                Go to Admin Dashboard →
              </Link>
            </div>
          )}

          <div style={footerRowStyle}>
            <button
              className="btnSecondary"
              onClick={logout}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid rgba(11,42,111,0.18)",
                background: "white",
                color: "#0b2a6f",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              Logout
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 10 }}>
            <Link className="link" style={linkStyle} to="/">
              ← Back to Home
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}