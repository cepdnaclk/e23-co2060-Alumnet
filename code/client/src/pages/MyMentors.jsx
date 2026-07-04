import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AccountListShell from "../components/AccountListShell";
import LoadingScreen from "../components/LoadingScreen";
import SegmentedFilter from "../components/SegmentedFilter";
import { getMyMentors } from "../api";

import verifiedIcon from "../assets/verified.png";
import pendingIcon from "../assets/pending.png";
import rejectedIcon from "../assets/rejected.png";
import linkedinIcon from "../assets/linkedin.png";
import emailIcon from "../assets/email.png";
import chemicalIcon from "../assets/chemical.png";
import civilIcon from "../assets/civil.png";
import computerIcon from "../assets/computer.png";
import electricalIcon from "../assets/elec.png";
import manufacturingIcon from "../assets/manu.png";
import mechanicalIcon from "../assets/mechanical.png";

export default function MyMentors() {
  const token = localStorage.getItem("token");

  const [mentors, setMentors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("accepted");
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

  const filteredMentors = mentors.filter(
    (mentor) => mentor.mentorship_status === statusFilter
  );
  const filterOptions = [
    {
      label: "Active",
      value: "accepted",
      count: countByStatus(mentors, "accepted"),
    },
    {
      label: "End requested",
      value: "ending_requested",
      count: countByStatus(mentors, "ending_requested"),
    },
    {
      label: "Ended",
      value: "ended",
      count: countByStatus(mentors, "ended"),
    },
  ];

  return (
    <AccountListShell>
      <style>{css}</style>
      {err && <div className="accountListError">{err}</div>}

      {loading ? (
        <LoadingScreen text="Loading mentors..." />
      ) : mentors.length === 0 ? (
        <div className="accountListState">No mentors yet.</div>
      ) : (
        <>
          <div className="accountListToolbar">
            <SegmentedFilter
              label="Filter mentors"
              value={statusFilter}
              options={filterOptions}
              onChange={setStatusFilter}
            />
          </div>
          {filteredMentors.length === 0 ? (
            <div className="accountListState">No mentors match this filter.</div>
          ) : (
            <div className="accountTableWrap">
              <table className="accountTable">
                <thead>
                  <tr>
                    <th style={{ width: "32%" }}>Mentor</th>
                    <th style={{ width: "26%" }}>Department</th>
                    <th style={{ width: "16%" }}>Socials</th>
                    <th className="tableActionHeader" style={{ width: "26%" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMentors.map((mentor) => (
                    <tr key={mentor.id}>
                      <td>
                        <div className="tablePerson">
                          <Avatar person={mentor} fallback="M" />
                          <div>
                            <div className="tableName">
                              <span>{mentor.full_name}</span>
                              <img
                                src={getStatusIcon(mentor.verification_status)}
                                alt={mentor.verification_status}
                                className="tableStatusIcon"
                              />
                            </div>
                            <div className="tableMeta">
                              {formatRole(mentor.job_title, mentor.organization)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="departmentCell">
                          {getDepartmentIcon(mentor.department) && (
                            <img src={getDepartmentIcon(mentor.department)} alt="" />
                          )}
                          {mentor.department || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="socialLinks">
                          {mentor.email && (
                            <a href={`mailto:${mentor.email}`} title={mentor.email}>
                              <img src={emailIcon} alt="Email" />
                            </a>
                          )}
                          {mentor.linkedin_url && (
                            <a
                              href={mentor.linkedin_url}
                              target="_blank"
                              rel="noreferrer"
                              title={mentor.linkedin_url}
                            >
                              <img src={linkedinIcon} alt="LinkedIn" />
                            </a>
                          )}
                          {!mentor.email && !mentor.linkedin_url && "-"}
                        </span>
                      </td>
                      <td className="tableActionCell">
                        <div className="tableActions">
                          <Link
                            to={`/directory/${mentor.id}`}
                            state={{ alumniName: mentor.full_name, fromMyMentors: true }}
                            className="accountButton"
                          >
                            View Profile
                          </Link>
                          {mentor.mentorship_status === "ending_requested" ? (
                            <span className="accountPill pending">End requested</span>
                          ) : mentor.mentorship_status === "ended" ? (
                            <span className="accountPill ended">Ended</span>
                          ) : (
                            <Link
                              to={`/end-mentorship/${mentor.id}`}
                              state={{
                                alumniName: mentor.full_name,
                                alumniAvatar: mentor.avatar_url,
                              }}
                              className="accountButton endMentorshipButton"
                            >
                              End Mentorship
                            </Link>
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

.endMentorshipButton{
  background:#eef1f4;
  color:#111111;
  box-shadow:0 8px 18px rgba(0,0,0,.08);
}

.endMentorshipButton:hover{
  background:#fee8e8;
  color:#b42318;
  box-shadow:0 12px 26px rgba(185,35,24,.14);
}
`;

function Avatar({ person, fallback }) {
  return person.avatar_url ? (
    <img src={person.avatar_url} alt={person.full_name} className="tableAvatar" />
  ) : (
    <div className="tableAvatar">{person.full_name?.slice(0, 1)?.toUpperCase() || fallback}</div>
  );
}

function formatRole(title, organization) {
  if (title && organization) return `${title} at ${organization}`;
  return title || organization || "Mentor";
}

function countByStatus(items, status) {
  return items.filter((item) => item.mentorship_status === status).length;
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
