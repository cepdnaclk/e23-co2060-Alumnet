import { useEffect, useState } from "react";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import SegmentedFilter from "../components/SegmentedFilter";
import { acceptEndMentorship, getMyMentees } from "../api";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";
import linkedinIcon from "../assets/linkedin.png";
import githubIcon from "../assets/github.png";
import chemicalIcon from "../assets/chemical.png";
import civilIcon from "../assets/civil.png";
import computerIcon from "../assets/computer.png";
import electricalIcon from "../assets/elec.png";
import manufacturingIcon from "../assets/manu.png";
import mechanicalIcon from "../assets/mechanical.png";

export default function MyMentees() {
  const token = localStorage.getItem("token");

  const [mentees, setMentees] = useState([]);
  const [statusFilter, setStatusFilter] = useState("accepted");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const loadMentees = async () => {
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

  useEffect(() => {
    loadMentees();
  }, [token]);

  const handleAcceptEnd = async (mentee) => {
    try {
      setActionLoadingId(mentee.mentorship_request_id);
      setErr("");
      setActionMessage("");
      const res = await acceptEndMentorship(token, mentee.mentorship_request_id);
      setActionMessage(res.message || "Mentorship ended");
      setMentees((current) =>
        current.map((item) =>
          item.mentorship_request_id === mentee.mentorship_request_id
            ? {
                ...item,
                mentorship_status: "ended",
                ended_at: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (e) {
      setErr(e.message || "Failed to end mentorship");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredMentees = mentees.filter(
    (mentee) => mentee.mentorship_status === statusFilter
  );
  const filterOptions = [
    {
      label: "Active",
      value: "accepted",
      count: countByStatus(mentees, "accepted"),
    },
    {
      label: "End request received",
      value: "ending_requested",
      count: countByStatus(mentees, "ending_requested"),
    },
    {
      label: "Ended",
      value: "ended",
      count: countByStatus(mentees, "ended"),
    },
  ];

  return (
    <AccountListShell>
      <style>{css}</style>
      {err && <div className="accountListError">{err}</div>}
      {actionMessage && <div className="accountListState successState">{actionMessage}</div>}

      {loading ? (
        <LoadingScreen text="Loading mentees..." />
      ) : mentees.length === 0 ? (
        <div className="accountListState">No mentees yet.</div>
      ) : (
        <>
          <div className="accountListToolbar">
            <SegmentedFilter
              label="Filter mentees"
              value={statusFilter}
              options={filterOptions}
              onChange={setStatusFilter}
            />
          </div>
          {filteredMentees.length === 0 ? (
            <div className="accountListState">No mentees match this filter.</div>
          ) : (
            <div className="accountTableWrap">
              <table className="accountTable">
                <thead>
                  <tr>
                    <th style={{ width: "30%" }}>Mentee</th>
                    <th style={{ width: "18%" }}>Department</th>
                    <th style={{ width: "28%" }}>Interests</th>
                    <th style={{ width: "10%" }}>Socials</th>
                    <th className="tableActionHeader" style={{ width: "14%" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMentees.map((mentee) => (
                    <tr key={mentee.id}>
                      <td>
                        <div className="tablePerson">
                          {mentee.avatar_url ? (
                            <img
                              src={mentee.avatar_url}
                              alt={mentee.full_name}
                              className="tableAvatar"
                            />
                          ) : (
                            <div className="tableAvatar">
                              {mentee.full_name?.slice(0, 1)?.toUpperCase() || "S"}
                            </div>
                          )}
                          <div>
                            <div className="tableName">
                              <span>{mentee.full_name}</span>
                              <img
                                src={getStatusIcon(mentee.verification_status)}
                                alt={mentee.verification_status}
                                className="tableStatusIcon"
                              />
                            </div>
                            <div className="tableMeta">Batch {mentee.batch || "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="departmentCell">
                          {getDepartmentIcon(mentee.department) && (
                            <img src={getDepartmentIcon(mentee.department)} alt="" />
                          )}
                          {mentee.department || "-"}
                        </span>
                      </td>
                      <td>
                        <InterestTags value={mentee.areas_of_interest} />
                        {mentee.mentorship_status === "ending_requested" && (
                          <div className="endReasonText">
                            <span className="accountPill pending">Ending requested</span>
                            <p>{mentee.end_reason || "No reason provided."}</p>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="socialLinks">
                          {mentee.linkedin_url && (
                            <a href={mentee.linkedin_url} target="_blank" rel="noreferrer">
                              <img src={linkedinIcon} alt="LinkedIn" />
                            </a>
                          )}
                          {mentee.github_url && (
                            <a href={mentee.github_url} target="_blank" rel="noreferrer">
                              <img src={githubIcon} alt="GitHub" />
                            </a>
                          )}
                          {!mentee.linkedin_url && !mentee.github_url && "-"}
                        </span>
                      </td>
                      <td className="tableActionCell">
                        <div className="tableActions">
                          {mentee.mentorship_status === "ending_requested" ? (
                            <button
                              type="button"
                              className="accountButton"
                              onClick={() => handleAcceptEnd(mentee)}
                              disabled={actionLoadingId === mentee.mentorship_request_id}
                            >
                              {actionLoadingId === mentee.mentorship_request_id
                                ? "Ending..."
                                : "Accept End"}
                            </button>
                          ) : mentee.mentorship_status === "ended" ? (
                            <span className="accountPill ended">ended</span>
                          ) : (
                            <span className="accountPill accepted">Active</span>
                          )}
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

function countByStatus(items, status) {
  return items.filter((item) => item.mentorship_status === status).length;
}

function InterestTags({ value = "" }) {
  const interests = value
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (interests.length === 0) return "-";

  return (
    <span className="tableTags">
      {interests.map((interest) => (
        <span key={interest}>{interest}</span>
      ))}
    </span>
  );
}

function getStatusIcon(status) {
  if (status === "verified") return verifiedIcon;
  if (status === "rejected") return rejectedIcon;
  return pendingIcon;
}

function getDepartmentIcon(department = "") {
  const normalized = department.toLowerCase();

  if (normalized.includes("chemical")) return chemicalIcon;
  if (normalized.includes("civil")) return civilIcon;
  if (normalized.includes("computer")) return computerIcon;
  if (normalized.includes("electrical") || normalized.includes("electronic")) {
    return electricalIcon;
  }
  if (normalized.includes("manufacturing") || normalized.includes("industrial")) {
    return manufacturingIcon;
  }
  if (normalized.includes("mechanical")) return mechanicalIcon;

  return null;
}

const css = `
.socialLinks{
  display:inline-flex;
  align-items:center;
  gap:9px;
}

.socialLinks a{
  width:18px;
  height:18px;
  display:inline-grid;
  place-items:center;
  transition:transform .18s ease, opacity .18s ease;
}

.socialLinks a:hover{
  transform:translateY(-1px);
  opacity:.74;
}

.socialLinks img{
  width:16px;
  height:16px;
  object-fit:contain;
}

.endReasonText{
  display:grid;
  justify-items:start;
  gap:7px;
  margin-top:9px;
}

.endReasonText p{
  margin:0;
  color:#111111;
  font-size:13px;
  line-height:1.45;
  white-space:pre-wrap;
}
`;
