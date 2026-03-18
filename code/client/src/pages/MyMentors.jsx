import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { getMyMentors } from "../api";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";

export default function MyMentors() {
  const token = localStorage.getItem("token");

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getMyMentors(token);
        setMentors(data);
      } catch (e) {
        setErr(e.message || "Failed to load mentors");
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
    <PageShell title="My Mentors" subtitle="Mentors connected with you">
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : mentors.length === 0 ? (
        <div>No mentors yet.</div>
      ) : (
        <div style={grid}>
          {mentors.map((mentor) => (
            <div key={mentor.id} style={card}>
              <div style={topRow}>
                {mentor.avatar_url ? (
                  <img src={mentor.avatar_url} alt={mentor.full_name} style={avatar} />
                ) : (
                  <div style={avatarFallback}>
                    {mentor.full_name?.slice(0, 1)?.toUpperCase() || "M"}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={nameRow}>
                    <div style={name}>{mentor.full_name}</div>
                    <img
                      src={getStatusIcon(mentor.verification_status)}
                      alt={mentor.verification_status}
                      style={statusIcon}
                    />
                  </div>

                  <div style={meta}>{mentor.job_title || "-"}</div>
                  <div style={meta}>{mentor.organization || "-"}</div>
                </div>
              </div>

              <div style={row}>
                <div style={label}>Department</div>
                <div style={value}>{mentor.department || "-"}</div>
              </div>

              <div style={row}>
                <div style={label}>LinkedIn</div>
                <div style={value}>
                  {mentor.linkedin_url ? (
                    <a href={mentor.linkedin_url} target="_blank" rel="noreferrer" style={linkStyle}>
                      Open Profile
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div style={row}>
                <div style={label}>Expertise</div>
                <div style={value}>{mentor.primary_interests || "-"}</div>
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
  fontWeight: 500,
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
  color: "#295bb8",
  textDecoration: "none",
  borderBottom: "1px solid rgba(92, 116, 170, 0.71)",
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
};