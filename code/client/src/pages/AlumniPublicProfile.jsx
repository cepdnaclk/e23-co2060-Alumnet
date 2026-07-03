import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PageShell from "../components/PageShell";
import { getAlumniProfile } from "../api";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";

export default function AlumniPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = localStorage.getItem("token");

  const currentUser = useMemo(() => {
    try {
      if (!token) return null;
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const isStudent = currentUser?.role === "student";
  const isOwnProfile = Number(currentUser?.id) === Number(id);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getAlumniProfile(id);
        setProfile(data);
      } catch (e) {
        setErr(e.message || "Failed to load alumni profile");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Alumni Profile" subtitle="Public mentor profile">
        <div>Loading...</div>
      </PageShell>
    );
  }

  if (err) {
    return (
      <PageShell title="Alumni Profile" subtitle="Public mentor profile">
        <div style={errorBox}>{err}</div>
      </PageShell>
    );
  }

  if (!profile) {
    return (
      <PageShell title="Alumni Profile" subtitle="Public mentor profile">
        <div>No alumni profile found.</div>
      </PageShell>
    );
  }

  const statusIcon =
    profile.verification_status === "verified"
      ? verifiedIcon
      : profile.verification_status === "rejected"
      ? rejectedIcon
      : pendingIcon;

  const acceptedCount = Number(profile.accepted_mentees_count || 0);
  const capacity = Number(profile.preferred_mentee_capacity || 0);
  const remainingSlots = Math.max(capacity - acceptedCount, 0);

  const isVerified = profile.verification_status === "verified";
  const canRequest =
    token &&
    isStudent &&
    !isOwnProfile &&
    isVerified &&
    remainingSlots > 0;

  return (
    <PageShell
      title="Alumni Profile"
      subtitle="Public mentor profile"
      right={
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {canRequest && (
            <button
              style={requestBtn}
              onClick={() => navigate(`/request-mentorship/${id}`)}
            >
              Request Mentorship
            </button>
          )}
        </div>
      }
    >
      <div style={pageWrap}>
        <div style={topArea}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="avatar"
              style={avatar}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div style={avatarFallback}>
              {profile.full_name?.slice(0, 1)?.toUpperCase() || "U"}
            </div>
          )}

          <div style={nameWrap}>
            <div style={nameRow}>
              <h2 style={nameStyle}>{profile.full_name}</h2>
              <img
                src={statusIcon}
                alt={profile.verification_status}
                style={statusIconStyle}
              />
            </div>

            <div style={emailStyle}>{profile.email}</div>
          </div>
        </div>

        {!isVerified && (
          <div style={warningBox}>This mentor is not verified yet.</div>
        )}

        {isVerified && remainingSlots <= 0 && (
          <div style={warningBox}>
            This mentor has reached their mentee capacity.
          </div>
        )}

        <div style={detailsGrid}>
          <section>
            <h3 style={sectionTitle}>Personal Details</h3>
            <div style={rowsWrap}>
              <InfoRow label="Department" value={profile.department} />
              <InfoRow label="Graduation Year" value={profile.graduation_year} />
              <InfoRow label="Bio" value={profile.bio} multiline />
              <InfoRow
                label="Mentee Capacity"
                value={profile.preferred_mentee_capacity}
              />
            </div>
          </section>

          <section>
            <h3 style={sectionTitle}>Professional Details</h3>
            <div style={rowsWrap}>
              <InfoRow label="Job Title" value={profile.job_title} />
              <InfoRow label="Company" value={profile.organization} />
              <InfoRow
                label="Expertise / Interests"
                value={profile.primary_interests}
                multiline
              />
              <InfoRow label="LinkedIn URL" value={profile.linkedin_url} isLink />
            </div>
          </section>
        </div>

        {!token && (
          <div style={{ marginTop: 22 }}>
            <Link to="/login" style={directoryLink}>
              Login to request mentorship
            </Link>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <Link to="/directory" style={directoryLink}>
            ← Back to Directory
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

function InfoRow({ label, value, isLink = false, multiline = false }) {
  return (
    <div style={row}>
      <div style={rowLabel}>{label}</div>
      <div
        style={{
          ...rowValue,
          whiteSpace: multiline ? "pre-wrap" : "normal",
        }}
      >
        {value ? (
          isLink ? (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              style={linkValue}
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          "-"
        )}
      </div>
    </div>
  );
}

const pageWrap = {
  paddingTop: 10,
};

const topArea = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 34,
};

const avatar = {
  width: 100,
  height: 100,
  borderRadius: "50%",
  objectFit: "cover",
  border: "1px solid rgba(0,0,0,0.06)",
  marginBottom: 14,
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
  fontWeight: 400,
  marginBottom: 14,
};

const nameWrap = {
  textAlign: "center",
};

const nameRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const nameStyle = {
  margin: 0,
  fontSize: 22,
  lineHeight: 1.1,
  letterSpacing: "-0.03em",
  fontWeight: 400,
  color: "#111111",
};

const statusIconStyle = {
  width: 16,
  height: 16,
  objectFit: "contain",
};

const emailStyle = {
  marginTop: 6,
  color: "rgba(17,17,17,0.56)",
  fontSize: 13,
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 26,
};

const sectionTitle = {
  margin: "0 0 14px",
  fontSize: 15,
  fontWeight: 400,
  color: "#111111",
};

const rowsWrap = {
  display: "grid",
};

const row = {
  display: "grid",
  gridTemplateColumns: "180px 1fr",
  gap: 16,
  padding: "10px 0",
  borderBottom: "1px solid rgba(0,0,0,0.05)",
};

const rowLabel = {
  fontSize: 13,
  color: "rgba(17,17,17,0.54)",
};

const rowValue = {
  fontSize: 14,
  color: "#111111",
  lineHeight: 1.7,
  wordBreak: "break-word",
};

const linkValue = {
  color: "#2527be",
  textDecoration: "none",
  borderBottom: "1px solid rgba(17,17,17,0.14)",
};

const requestBtn = {
  background: "rgba(255, 255, 255, 0.7)",
  color: "#111111",
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(51, 207, 64, 0.06)",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 400,
  fontFamily: '"Google Sans"',
};

const directoryLink = {
  color: "#111111",
  textDecoration: "none",
  fontSize: 15,
  borderBottom: "1px solid rgba(17,17,17,0.14)",
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 14,
};

const warningBox = {
  background: "#fee6c7",
  padding: 10,
  borderRadius: 12,
  marginBottom: 14,
  color: "#ca240e",
};