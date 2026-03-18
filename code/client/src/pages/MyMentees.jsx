import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { getMyMentees } from "../api";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";

export default function MyMentees() {
  const token = localStorage.getItem("token");

  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getMyMentees(token);
        setMentees(data);
      } catch (e) {
        setErr(e.message || "Failed to load mentees");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const getStatusIcon = (status) => {
    if (status === "verified") return verifiedIcon;
    if (status === "rejected") return rejectedIcon;
    return pendingIcon;
  };

  return (
    <PageShell title="My Mentees" subtitle="Students connected with you">
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : mentees.length === 0 ? (
        <div>No mentees yet.</div>
      ) : (
        <div style={grid}>
          {mentees.map((mentee) => (
            <div key={mentee.id} style={card}>
              <div style={topRow}>
                {mentee.avatar_url ? (
                  <img src={mentee.avatar_url} alt={mentee.full_name} style={avatar} />
                ) : (
                  <div style={avatarFallback}>
                    {mentee.full_name?.slice(0, 1)?.toUpperCase() || "S"}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={nameRow}>
                    <div style={name}>{mentee.full_name}</div>
                    <img
                      src={getStatusIcon(mentee.verification_status)}
                      alt={mentee.verification_status}
                      style={statusIcon}
                    />
                  </div>

                  <div style={meta}>{mentee.department || "-"}</div>
                  <div style={meta}>Batch: {mentee.batch || "-"}</div>
                </div>
              </div>

              <div style={row}>
                <div style={label}>Interests</div>
                <div style={value}>{mentee.areas_of_interest || "-"}</div>
              </div>

              <div style={row}>
                <div style={label}>LinkedIn</div>
                <div style={value}>
                  {mentee.linkedin_url ? (
                    <a href={mentee.linkedin_url} target="_blank" rel="noreferrer" style={linkStyle}>
                      Open Profile
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div style={row}>
                <div style={label}>GitHub</div>
                <div style={value}>
                  {mentee.github_url ? (
                    <a href={mentee.github_url} target="_blank" rel="noreferrer" style={linkStyle}>
                      Open GitHub
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
  gap: 20,
};

const card = {
  padding: 18,
  borderRadius: 14,
  background: "rgba(255,255,255,0.65)",
  border: "1px solid rgba(0,0,0,0.06)",
  backdropFilter: "blur(6px)",
};

const topRow = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  marginBottom: 14,
};

const avatar = {
  width: 54,
  height: 54,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
};

const avatarFallback = {
  width: 54,
  height: 54,
  borderRadius: "50%",
  display: "grid",
  placeItems: "center",
  background: "#ecebe7",
  fontWeight: 600,
  flexShrink: 0,
};

const nameRow = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  minWidth: 0,
};

const name = {
  fontSize: 16,
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const statusIcon = {
  width: 18,
  height: 18,
  flexShrink: 0,
};

const meta = {
  fontSize: 13,
  color: "rgba(0,0,0,0.6)",
};

const row = {
  display: "grid",
  gridTemplateColumns: "90px 1fr",
  gap: 12,
  marginTop: 8,
  fontSize: 14,
};

const label = {
  color: "rgba(0,0,0,0.6)",
};

const value = {
  wordBreak: "break-word",
};

const linkStyle = {
  color: "#4970dd",
  textDecoration: "none",
  borderBottom: "1px solid rgba(57, 78, 197, 0.65)",
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
};