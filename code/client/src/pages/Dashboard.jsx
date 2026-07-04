import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PageShell from "../components/PageShell";
import LoadingScreen from "../components/LoadingScreen";
import { getProfile } from "../api";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const currentUser = useMemo(() => {
    try {
      if (!token) return null;
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const role = currentUser?.role || "";
  const isAdmin = role === "university_admin" || role === "system_admin";

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getProfile(token);
        setProfile(data);
      } catch (e) {
        setErr(e.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const statusIcon =
    profile?.verification_status === "verified"
      ? verifiedIcon
      : profile?.verification_status === "rejected"
      ? rejectedIcon
      : pendingIcon;

  const roleLabel =
    role === "student"
      ? "Student"
      : role === "alumni"
      ? "Alumni"
      : role === "university_admin"
      ? "University Admin"
      : role === "system_admin"
      ? "System Admin"
      : role;

  return (
    <PageShell title="Home" subtitle="Your dashboard">
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <LoadingScreen text="Loading dashboard..." />
      ) : (
        <>
          <div style={hero}>
            <div style={heroTop}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" style={avatar} />
              ) : (
                <div style={avatarFallback}>
                  {profile?.full_name?.slice(0, 1)?.toUpperCase() || "U"}
                </div>
              )}

              <div>
                <div style={nameRow}>
                  <h2 style={name}>{profile?.full_name || "User"}</h2>
                  {profile?.verification_status && (
                    <img
                      src={statusIcon}
                      alt={profile.verification_status}
                      style={statusIconStyle}
                    />
                  )}
                </div>

                <div style={subtext}>{roleLabel}</div>
                <div style={subtext}>{profile?.email || "-"}</div>
              </div>
            </div>

            <p style={heroText}>
              Welcome back to Alumnet. Continue building student–alumni
              connections through mentorship, events, and your professional
              network.
            </p>
          </div>

          <div style={grid}>
            {!isAdmin && (
              <>
                <QuickCard
                  title="My Profile"
                  text="View your account details and public information."
                  to="/profile"
                />

                <QuickCard
                  title="Edit Profile"
                  text="Update your details, profile image, and links."
                  to="/edit-profile"
                />

                <QuickCard
                  title="Directory"
                  text="Browse alumni and find relevant mentors."
                  to="/directory"
                />
              </>
            )}

            <QuickCard
              title="Events"
              text="See upcoming approved events and register."
              to="/events"
            />

            {role === "student" && (
              <>
                <QuickCard
                  title="My Requests"
                  text="Track mentorship requests you have sent."
                  to="/my-requests"
                />
                <QuickCard
                  title="My Mentors"
                  text="See mentors who have accepted your requests."
                  to="/my-mentors"
                />
              </>
            )}

            {role === "alumni" && (
              <>
                <QuickCard
                  title="Mentor Requests"
                  text="Review mentorship requests from students."
                  to="/mentor-requests"
                />
                <QuickCard
                  title="My Mentees"
                  text="See students currently connected with you."
                  to="/my-mentees"
                />
              </>
            )}

            {(role === "alumni" ||
              role === "university_admin" ||
              role === "system_admin") && (
              <QuickCard
                title="Create Event"
                text="Create a new event for approval."
                to="/create-event"
              />
            )}

            {(role === "university_admin" || role === "system_admin") && (
              <>
                <QuickCard
                  title="Admin Dashboard"
                  text="Verify new accounts and manage approvals."
                  to="/admin"
                />
                <QuickCard
                  title="Event Approvals"
                  text="Approve or reject submitted events."
                  to="/admin-events"
                />
              </>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}

function QuickCard({ title, text, to }) {
  return (
    <Link to={to} style={quickCard}>
      <div style={quickTitle}>{title}</div>
      <div style={quickText}>{text}</div>
    </Link>
  );
}

const hero = {
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: 18,
  padding: 22,
  marginBottom: 22,
};

const heroTop = {
  display: "flex",
  gap: 16,
  alignItems: "center",
  marginBottom: 14,
  flexWrap: "wrap",
};

const avatar = {
  width: 74,
  height: 74,
  borderRadius: "50%",
  objectFit: "cover",
  border: "1px solid rgba(0,0,0,0.06)",
};

const avatarFallback = {
  width: 74,
  height: 74,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#ecebe7",
  color: "#111111",
  fontSize: 26,
};

const nameRow = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const name = {
  margin: 0,
  fontSize: 24,
  fontWeight: 400,
  color: "#111111",
};

const statusIconStyle = {
  width: 16,
  height: 16,
  objectFit: "contain",
};

const subtext = {
  color: "rgba(17,17,17,0.56)",
  fontSize: 14,
  marginTop: 4,
};

const heroText = {
  margin: 0,
  color: "rgba(17,17,17,0.72)",
  fontSize: 14,
  lineHeight: 1.7,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
  gap: 18,
};

const quickCard = {
  background: "rgba(255,255,255,0.65)",
  border: "1px solid rgba(0,0,0,0.06)",
  borderRadius: 16,
  padding: 18,
  textDecoration: "none",
  color: "#111111",
};

const quickTitle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 8,
};

const quickText = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "rgba(17,17,17,0.62)",
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
};
