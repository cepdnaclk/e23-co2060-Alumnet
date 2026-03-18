import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import { getStudentRequests } from "../api";

export default function StudentRequests() {
  const token = localStorage.getItem("token");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getStudentRequests(token);
        setRequests(data);
      } catch (e) {
        setErr(e.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  return (
    <PageShell title="My Requests" subtitle="Mentorship requests you have sent">
      {err && <div style={errorBox}>{err}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div>No requests sent yet.</div>
      ) : (
        <div style={grid}>
          {requests.map((request) => (
            <div key={request.id} style={card}>
              <div style={title}>{request.alumni_full_name || "Mentor"}</div>
              <div style={meta}>{request.alumni_job_title || "-"}</div>
              <div style={meta}>{request.alumni_organization || "-"}</div>

              <div style={row}>
                <div style={label}>Status</div>
                <div style={statusValue(request.status)}>{request.status}</div>
              </div>

              <div style={row}>
                <div style={label}>Sent</div>
                <div style={value}>
                  {request.created_at
                    ? new Date(request.created_at).toLocaleString()
                    : "-"}
                </div>
              </div>

              <div style={messageWrap}>
                <div style={messageLabel}>Message</div>
                <div style={messageText}>{request.message || "-"}</div>
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

const title = {
  fontSize: 16,
  fontWeight: 500,
};

const meta = {
  fontSize: 13,
  color: "rgba(0,0,0,0.6)",
  marginTop: 4,
};

const row = {
  display: "grid",
  gridTemplateColumns: "70px 1fr",
  gap: 12,
  marginTop: 10,
  fontSize: 14,
};

const label = {
  color: "rgba(0,0,0,0.6)",
};

const value = {
  wordBreak: "break-word",
};

const statusValue = (status) => ({
  textTransform: "capitalize",
  color:
    status === "accepted"
      ? "#166534"
      : status === "rejected"
      ? "#b91c1c"
      : "#92400e",
  fontWeight: 500,
});

const messageWrap = {
  marginTop: 14,
  paddingTop: 12,
  borderTop: "1px solid rgba(0,0,0,0.05)",
};

const messageLabel = {
  fontSize: 13,
  color: "rgba(0,0,0,0.6)",
  marginBottom: 6,
};

const messageText = {
  fontSize: 14,
  lineHeight: 1.7,
  color: "#111111",
  whiteSpace: "pre-wrap",
};

const errorBox = {
  background: "#fee2e2",
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
};